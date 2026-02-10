/**
 * [SYSTEM DESIGN]: Lightning Network Payment Service
 * 
 * This service class abstracts all WebLN interactions and provides a clean API
 * for the React components. It handles the full payment lifecycle:
 * 1. WebLN Provider Detection
 * 2. Connection Initialization
 * 3. Invoice Generation (simulated for MVP)
 * 4. Payment Execution via sendPayment()
 * 
 * The class implements defensive programming patterns to handle cases where
 * WebLN is not available (e.g., user doesn't have Alby or Zeus wallet installed).
 */

import { WebLNProvider, SendPaymentResponse } from '../types';

export class LightningManager {
  private provider: WebLNProvider | null = null;
  private isEnabled: boolean = false;

  /**
   * [SYSTEM DESIGN]: Provider Initialization
   * Attempts to enable WebLN provider. This must be called before any payment operations.
   * Throws if WebLN is not available in the browser.
   */
  async initialize(): Promise<void> {
    if (!window.webln) {
      throw new Error('WebLN not available. Please install a Lightning wallet (Alby, Zeus, etc.)');
    }

    try {
      await window.webln.enable();
      this.provider = window.webln;
      this.isEnabled = true;
      console.log('[LightningManager] WebLN provider enabled successfully');
    } catch (error) {
      console.error('[LightningManager] Failed to enable WebLN:', error);
      throw new Error('Failed to enable WebLN provider');
    }
  }

  /**
   * [SYSTEM DESIGN]: Invoice Generation (MVP Simulation)
   * 
   * In a production system, this would call your backend API to generate a BOLT-11 invoice.
   * For this MVP, we're using a hardcoded test invoice that some wallets will accept.
   * 
   * Real implementation would look like:
   * const response = await fetch('/api/create-invoice', { 
   *   method: 'POST', 
   *   body: JSON.stringify({ amount: sats }) 
   * });
   */
  async generateInvoice(amountSats: number): Promise<string> {
    // Simulated delay to show "Requesting Invoice" state
    await new Promise(resolve => setTimeout(resolve, 1000));

    /**
     * [CRITICAL]: This is a TEST invoice for demonstration purposes only.
     * In production, replace this with your backend's invoice generation endpoint.
     * 
     * This invoice is for 100 sats on testnet. Some wallets will recognize it as invalid
     * for mainnet, which is expected behavior.
     */
    const testInvoice = 'lnbc1000n1pj9x8zdpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w';
    
    console.log(`[LightningManager] Generated invoice for ${amountSats} sats`);
    return testInvoice;
  }

  /**
   * [SYSTEM DESIGN]: Payment Execution
   * 
   * Sends the payment request to the user's WebLN provider.
   * The provider will show a confirmation dialog to the user.
   * Returns the payment preimage on success, which cryptographically proves payment.
   */
  async sendPayment(invoice: string): Promise<SendPaymentResponse> {
    if (!this.isEnabled || !this.provider) {
      throw new Error('WebLN provider not initialized. Call initialize() first.');
    }

    try {
      console.log('[LightningManager] Sending payment...');
      const response = await this.provider.sendPayment(invoice);
      console.log('[LightningManager] Payment successful! Preimage:', response.preimage);
      return response;
    } catch (error) {
      console.error('[LightningManager] Payment failed:', error);
      throw error;
    }
  }

  /**
   * [SYSTEM DESIGN]: Provider Status Check
   * Allows components to check if WebLN is available before attempting payment.
   */
  isWebLNAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.webln;
  }

  /**
   * [SYSTEM DESIGN]: Connection Status
   * Returns whether the provider has been successfully initialized.
   */
  isProviderEnabled(): boolean {
    return this.isEnabled;
  }
}

// Singleton instance for use across the application
export const lightningManager = new LightningManager();
