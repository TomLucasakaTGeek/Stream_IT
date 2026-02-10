/**
 * [SYSTEM DESIGN]: Main Application Component
 * 
 * This is the orchestration layer that ties together:
 * 1. The Media Engine (VideoPlayer)
 * 2. The Comment Engine (ChatSidebar) 
 * 3. The Payment Layer (LightningManager)
 * 
 * State Management Strategy:
 * - isPaid: Controls video blur and unlock state
 * - isLoading: Prevents double-clicks during payment processing
 * - error: Displays user-friendly error messages
 * 
 * Payment Flow Sequence:
 * 1. User clicks "Pay with Lightning" button
 * 2. App calls lightningManager.initialize() → WebLN provider prompt
 * 3. App calls lightningManager.generateInvoice() → Get payment request
 * 4. App calls lightningManager.sendPayment() → User approves in wallet
 * 5. On success: Set isPaid=true, remove blur, inject zap comment
 */

import { useState } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { ChatSidebar } from './components/ChatSidebar';
import { useRollingComments } from './hooks/useRollingComments';
import { lightningManager } from './services/LightningManager';

function App() {
  /**
   * [SYSTEM DESIGN]: Core Application State
   * These three state variables control the entire payment and unlock flow
   */
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * [SYSTEM DESIGN]: Rolling Comments Hook
   * Manages the simulated chat stream with circular buffer logic.
   * Limited to 20 comments to prevent scrolling issues.
   */
  const { comments, addZapComment } = useRollingComments(isPaid);

  /**
   * [SYSTEM DESIGN]: Payment Handler
   * 
   * This is the critical business logic that executes the Lightning payment.
   * It implements a multi-step async flow with error handling at each stage.
   * 
   * Error Handling Philosophy:
   * - User-friendly messages (no raw error objects)
   * - Guidance on how to resolve issues
   * - Graceful degradation if WebLN unavailable
   */
  const handlePayment = async () => {
    try {
      // Reset error state from previous attempts
      setError(null);
      setIsLoading(true);

      /**
       * [SYSTEM DESIGN]: Step 1 - WebLN Provider Initialization
       * This prompts the user's wallet extension to connect.
       * Common failure: User doesn't have a WebLN wallet installed.
       */
      console.log('[App] Step 1: Initializing WebLN provider...');
      await lightningManager.initialize();

      /**
       * [SYSTEM DESIGN]: Step 2 - Invoice Generation
       * In production, this would call your backend API.
       * For MVP, we use a test invoice.
       */
      console.log('[App] Step 2: Generating invoice...');
      const invoice = await lightningManager.generateInvoice(100); // 100 sats
      console.log('[App] Invoice generated:', invoice);

      /**
       * [SYSTEM DESIGN]: Step 3 - Payment Execution
       * The WebLN provider (Alby/Zeus/etc) will show a confirmation dialog.
       * User must approve the payment in their wallet.
       * 
       * This is the critical moment - if successful, we get a cryptographic
       * proof (preimage) that payment was made.
       */
      console.log('[App] Step 3: Requesting payment from user...');
      const response = await lightningManager.sendPayment(invoice);
      console.log('[App] Payment successful! Preimage:', response.preimage);

      /**
       * [SYSTEM DESIGN]: Step 4 - Unlock Content
       * On successful payment:
       * - Remove video blur (setIsPaid)
       * - Show confirmation message in chat
       * - Could also store receipt in localStorage for persistence
       */
      setIsPaid(true);
      addZapComment();
      console.log('[App] Stream unlocked! ⚡');

      // Optional: Persist unlock state to localStorage
      localStorage.setItem('streamUnlocked', 'true');
      localStorage.setItem('paymentPreimage', response.preimage);

    } catch (err) {
      /**
       * [SYSTEM DESIGN]: Error Handling & User Communication
       * Different error types require different user guidance
       */
      console.error('[App] Payment failed:', err);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      // Type-safe error message extraction
      if (err instanceof Error) {
        if (err.message.includes('WebLN not available')) {
          errorMessage = 'Please install a Lightning wallet like Alby or Zeus to continue.';
        } else if (err.message.includes('User rejected')) {
          errorMessage = 'Payment cancelled. Click again when ready.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      /**
       * [SYSTEM DESIGN]: Cleanup
       * Always reset loading state to re-enable the button
       */
      setIsLoading(false);
    }
  };

  /**
   * [SYSTEM DESIGN]: Restore Previous Session (Optional Enhancement)
   * Check if user already paid in a previous session
   */
  useState(() => {
    const wasUnlocked = localStorage.getItem('streamUnlocked') === 'true';
    if (wasUnlocked) {
      setIsPaid(true);
      console.log('[App] Restored previous unlock state from localStorage');
    }
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      {/**
       * [SYSTEM DESIGN]: Application Header
       * Branding and navigation (minimal for MVP)
       */}
      <header className="max-w-[1800px] mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lightning-yellow rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lightning Stream</h1>
              <p className="text-sm text-zinc-400">Bitcoin-powered live streaming</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-zinc-300">LIVE</span>
            </div>
            <div className="text-zinc-400">
              {Math.floor(Math.random() * 1000) + 500} viewers
            </div>
          </div>
        </div>
      </header>

      {/**
       * [SYSTEM DESIGN]: Error Notification Banner
       * Displayed at top of viewport when payment fails
       */}
      {error && (
        <div className="max-w-[1800px] mx-auto mb-4 bg-red-500/10 border border-red-500 
                        text-red-400 px-6 py-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/**
       * [SYSTEM DESIGN]: Main Content Grid
       * 75/25 split: Video takes majority, chat sidebar on right
       * Responsive grid that stacks on mobile
       */}
      <main className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
          {/* Video Player Section - 75% width on desktop */}
          <div className="lg:col-span-3">
            <VideoPlayer
              isPaid={isPaid}
              onPayClick={handlePayment}
              isLoading={isLoading}
            />
          </div>

          {/* Chat Sidebar - 25% width on desktop */}
          <div className="lg:col-span-1">
            <ChatSidebar comments={comments} />
          </div>
        </div>

        {/**
         * [SYSTEM DESIGN]: Stream Info Panel
         * Metadata about the stream (below main content)
         */}
        <div className="mt-6 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-2">
            Bitcoin & Lightning Network Demo Stream
          </h2>
          <p className="text-zinc-400 mb-4">
            Experience instant micropayments with Lightning Network. This demo showcases
            WebLN integration for content monetization without subscriptions or ads.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">
              #Bitcoin
            </span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">
              #Lightning
            </span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">
              #WebLN
            </span>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">
              #SatsBack
            </span>
          </div>
        </div>
      </main>

      {/**
       * [SYSTEM DESIGN]: Footer
       * Credits and links
       */}
      <footer className="max-w-[1800px] mx-auto mt-8 text-center text-zinc-500 text-sm">
        <p>
          Built with React, TypeScript, Tailwind CSS, and WebLN |{' '}
          <a
            href="https://webln.guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lightning-yellow hover:underline"
          >
            Learn about WebLN
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
