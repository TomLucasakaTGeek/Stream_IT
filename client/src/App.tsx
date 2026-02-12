/**
 * [SYSTEM DESIGN]: Content-First Streaming Application
 * 
 * Modern streaming UX inspired by Twitch/YouTube:
 * - Video content is FREE and immediately accessible
 * - Monetization through OPTIONAL tips (like YouTube Super Chat)
 * - No paywalls, no locked content, no "pay to play"
 * 
 * State Management Strategy:
 * - isProcessingTip: Prevents double-clicks during tip creation
 * - toast: Displays success/error notifications
 * - No "isPaid" state - content is always available
 * 
 * Tipping Flow:
 * 1. User clicks "Zap Creator" button
 * 2. WebLN wallet prompts for permission
 * 3. Wallet generates invoice using makeInvoice()
 * 4. Invoice displayed to user OR auto-paid (wallet dependent)
 * 5. Success message shown in chat
 */

import { useState } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { ChatSidebar } from './components/ChatSidebar';
import { useRollingComments } from './hooks/useRollingComments';
import { lightningManager } from './services/LightningManager';

function App() {
  /**
   * [SYSTEM DESIGN]: Application State
   * Minimal state - only what's needed for tipping flow
   */
  const [isProcessingTip, setIsProcessingTip] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  /**
   * [SYSTEM DESIGN]: Rolling Comments Hook
   * Manages simulated chat stream with sliding window (max 20 comments)
   */
  const { comments, addZapComment } = useRollingComments();

  /**
   * [SYSTEM DESIGN]: Show Toast Notification
   * Non-intrusive way to show success/error messages
   */
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Auto-dismiss after 5s
  };

  /**
   * [SYSTEM DESIGN]: Tipping Handler
   * 
   * This implements the WebLN tipping flow:
   * 1. Check if wallet is available
   * 2. Initialize WebLN provider (user approval)
   * 3. Create invoice using makeInvoice()
   * 4. Show success notification
   * 5. Add zap comment to chat
   * 
   * Error Handling:
   * - No wallet installed → Helpful error with download link
   * - User cancelled → Silent dismissal (no error)
   * - Other errors → User-friendly message
   */
  const handleTip = async () => {
    try {
      setIsProcessingTip(true);

      /**
       * [SYSTEM DESIGN]: Step 1 - Check WebLN Availability
       * Fail fast if user doesn't have a compatible wallet
       */
      if (!lightningManager.isWebLNAvailable()) {
        showToast(
          'Please install Alby wallet extension to send tips',
          'error'
        );
        
        // Open Alby website in new tab after a delay
        setTimeout(() => {
          window.open('https://getalby.com', '_blank');
        }, 2000);
        
        return;
      }

      /**
       * [SYSTEM DESIGN]: Step 2 - Initialize WebLN
       * Request permission to interact with user's wallet
       */
      console.log('[App] Initializing WebLN provider...');
      await lightningManager.initialize();

      /**
       * [SYSTEM DESIGN]: Step 3 - Create Tip Invoice
       * Use makeInvoice() to generate a payment request.
       * The wallet will show this to the user for payment.
       */
      console.log('[App] Creating tip invoice...');
      const invoice = await lightningManager.createTipInvoice(
        100, // 100 sats (~$0.10 USD)
        'Thanks for the awesome stream! ⚡'
      );

      console.log('[App] Tip invoice created:', invoice.paymentRequest);

      /**
       * [SYSTEM DESIGN]: Step 4 - Show Success
       * The wallet handles the actual payment display/processing.
       * We just confirm the invoice was created successfully.
       */
      showToast('Tip invoice created! Check your wallet to complete payment.', 'success');
      
      // Add zap comment to chat for visual feedback
      addZapComment('Someone tipped 100 sats! ⚡');

      // Optional: Log this to analytics
      console.log('[App] Tip successful! Invoice:', invoice.paymentRequest);

    } catch (err) {
      /**
       * [SYSTEM DESIGN]: Error Handling
       * Different error types get different user messages
       */
      console.error('[App] Tip failed:', err);

      if (err instanceof Error) {
        if (err.message.includes('User rejected') || 
            err.message.includes('cancelled')) {
          // User cancelled - don't show error, this is intentional
          console.log('[App] User cancelled tip');
          return;
        } else if (err.message.includes('WebLN not available')) {
          showToast(err.message, 'error');
        } else {
          showToast(`Tip failed: ${err.message}`, 'error');
        }
      } else {
        showToast('Tip failed. Please try again.', 'error');
      }
    } finally {
      setIsProcessingTip(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      {/**
       * [SYSTEM DESIGN]: Application Header
       * Minimal branding - keeps focus on content
       */}
      <header className="max-w-[1800px] mx-auto mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lightning-yellow rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">StreamBit</h1>
              {/* <p className="text-xs text-zinc-400">Powered by WebLN</p> */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Video Section - Uses 3/4 of grid */}
          <div className="lg:col-span-3 h-[500px] lg:h-full">
            <VideoPlayer onTipClick={handleTip} isProcessingTip={isProcessingTip} />
          </div>

          {/* Chat Section - Uses 1/4 of grid */}
          <div className="lg:col-span-1 h-[400px] lg:h-full">
            <ChatSidebar comments={comments} />
          </div>
        </div>
      </main>

      {/* Toast Notification (Absolute positioned so it doesn't bump layout) */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl font-bold text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
