/**
 * [SYSTEM DESIGN]: Lightning Network Tipping Service
 * 
 * This service implements the WebLN tipping flow for content creators:
 * 1. Check if WebLN wallet is available (Alby, Zeus, etc.)
 * 2. Request permission via enable()
 * 3. Generate invoice using makeInvoice() - this creates a payment request FOR the creator
 * 4. Display invoice to user for payment
 * 
 * This is the CORRECT flow for tipping/donations, different from the pay-to-unlock pattern.
 * The wallet generates an invoice that the viewer can then pay.
 */

import { WebLNProvider, RequestInvoiceResponse } from '../types';

export class LightningManager {
  private provider: WebLNProvider | null = null;
  private isEnabled: boolean = false;

  /**
   * [SYSTEM DESIGN]: Provider Initialization
   * Attempts to enable WebLN provider. This must be called before any tipping operations.
   * Throws if WebLN is not available in the browser.
   */
  async initialize(): Promise<void> {
    if (!window.webln) {
      throw new Error('WebLN not available. Please install a Lightning wallet extension like Alby (https://getalby.com) or Zeus.');
    }

    try {
      await window.webln.enable();
      this.provider = window.webln;
      this.isEnabled = true;
      console.log('[LightningManager] WebLN provider enabled successfully');
    } catch (error) {
      console.error('[LightningManager] Failed to enable WebLN:', error);
      throw new Error('User rejected wallet connection');
    }
  }

  /**
   * [SYSTEM DESIGN]: Tipping Flow - Generate Invoice
   * 
   * Uses WebLN's makeInvoice() method to create a payment request.
   * This is the standard way to request tips/donations via Lightning.
   * 
   * Flow:
   * 1. Wallet creates invoice for specified amount
   * 2. Invoice is displayed to user (or automatically paid if they choose)
   * 3. Creator receives payment once user confirms
   * 
   * @param amountSats - Amount in satoshis (1 sat = 0.00000001 BTC)
   * @param memo - Optional message describing the tip
   */
  async createTipInvoice(amountSats: number, memo?: string): Promise<RequestInvoiceResponse> {
    if (!this.isEnabled || !this.provider) {
      throw new Error('WebLN provider not initialized. Call initialize() first.');
    }

    try {
      console.log(`[LightningManager] Creating tip invoice for ${amountSats} sats...`);
      
      const invoice = await this.provider.makeInvoice({
        amount: amountSats,
        defaultAmount: amountSats,
        defaultMemo: memo || 'Tip for Lightning Stream Creator ⚡'
      });
      
      console.log('[LightningManager] Invoice created:', invoice.paymentRequest);
      return invoice;
    } catch (error) {
      console.error('[LightningManager] Failed to create invoice:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || 
            error.message.includes('User denied') ||
            error.message.includes('cancelled')) {
          throw new Error('User cancelled the tip');
        }
        throw error;
      }
      
      throw new Error('Failed to create tip invoice');
    }
  }

  /**
   * [SYSTEM DESIGN]: Provider Status Check
   * Allows components to check if WebLN is available before attempting to tip.
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

  /**
   * [SYSTEM DESIGN]: Get Wallet Info (Optional)
   * Fetches wallet details like node alias and available methods.
   * Useful for showing which wallet the user is connected with.
   */
  async getWalletInfo() {
    if (!this.isEnabled || !this.provider) {
      throw new Error('WebLN provider not initialized');
    }

    try {
      const info = await this.provider.getInfo();
      console.log('[LightningManager] Wallet info:', info);
      return info;
    } catch (error) {
      console.error('[LightningManager] Failed to get wallet info:', error);
      return null;
    }
  }
}

// Singleton instance for use across the application
export const lightningManager = new LightningManager();
