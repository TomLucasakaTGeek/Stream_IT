/**
 * [SYSTEM DESIGN]: Type Definitions
 * Strict TypeScript interfaces ensure type safety across the payment flow
 * and state management. WebLN types follow the BOLT-11 spec.
 */

// WebLN Provider Interface (extends the window object)
export interface WebLNProvider {
  enable(): Promise<void>;
  sendPayment(paymentRequest: string): Promise<SendPaymentResponse>;
  makeInvoice(args: RequestInvoiceArgs): Promise<RequestInvoiceResponse>;
  getInfo(): Promise<GetInfoResponse>;
}

export interface SendPaymentResponse {
  preimage: string;
}

export interface RequestInvoiceArgs {
  amount?: string | number;
  defaultAmount?: string | number;
  minimumAmount?: string | number;
  maximumAmount?: string | number;
  defaultMemo?: string;
}

export interface RequestInvoiceResponse {
  paymentRequest: string;
}

export interface GetInfoResponse {
  node: {
    alias: string;
    pubkey: string;
    color?: string;
  };
  methods: string[];
}

// Extend Window interface to include WebLN
declare global {
  interface Window {
    webln?: WebLNProvider;
  }
}

/**
 * [SYSTEM DESIGN]: Application State Types
 * These types model the core business logic of the streaming platform
 */

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  isZap?: boolean;
}

export interface StreamState {
  isPaid: boolean;
  isLoading: boolean;
  error: string | null;
}

export type PaymentStatus = 
  | 'idle' 
  | 'checking_webln' 
  | 'requesting_invoice' 
  | 'awaiting_payment' 
  | 'success' 
  | 'error';

export interface PaymentState {
  status: PaymentStatus;
  error: string | null;
  preimage: string | null;
}
