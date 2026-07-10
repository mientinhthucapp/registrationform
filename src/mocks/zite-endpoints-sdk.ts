export interface RegistrationPayload {
  email: string;
  hoVaTen: string;
  phapDanh?: string;
  phoneViberOriginal: string;
  phoneViberNormalised: string;
  namSinh: string;
  gioiTinh: string;
  ngheNghiep?: string;
  diaChi: string;
  yeuCauHoTro?: string;
  emergencyName: string;
  emergencyPhoneOriginal: string;
  emergencyPhoneNormalised: string;
  emergencyRelationship: string;
  emergencyAddress?: string;
  healthConfirmed: boolean;
  rulesConfirmed: boolean;
  camping: string;
  tShirt: string;
  tShirtSize?: string;
  paymentMethod: string;
  paymentAmount: number;
  tShirtFee: number;
  baseFee?: number;
  donationAmount?: number;
  totalAmount?: number;
  receiptUrl?: string;
  additionalMessage?: string;
}

export interface SubmitRegistrationOutputType {
  success: boolean;
  id: string;
  ticketNumber: string;
  qrCodeUrl: string;
}

// Local stand-in for the proprietary Zite-hosted `zite-endpoints-sdk` package
// (no npm equivalent exists) so the form is click-through-able without Zite's backend.
export async function submitRegistration(payload: RegistrationPayload): Promise<SubmitRegistrationOutputType> {
  console.log('[mock zite-endpoints-sdk] submitRegistration called with:', payload);
  await new Promise(resolve => setTimeout(resolve, 600));
  console.log('[mock zite-endpoints-sdk] no real backend was called — this is a local stub');
  const ticketNumber = `TK-${String(Math.floor(Math.random() * 900) + 1).padStart(3, '0')}`;
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(payload.phoneViberNormalised)}&size=200`;
  return { success: true, id: 'local-mock-id', ticketNumber, qrCodeUrl };
}

export async function getRegistrationCount(_params: Record<string, never> = {}): Promise<{ count: number }> {
  console.log('[mock zite-endpoints-sdk] getRegistrationCount called (returning 0)');
  return { count: 0 };
}

export interface CheckPhoneUniqueParams {
  normalisedPhone: string;
}

// Local stand-in for checkPhoneUnique. Without a real backend to query existing
// registrations, this always reports the phone number as unique.
export async function checkPhoneUnique(_params: CheckPhoneUniqueParams): Promise<{ isUnique: boolean }> {
  console.log('[mock zite-endpoints-sdk] checkPhoneUnique called with:', _params);
  console.log('[mock zite-endpoints-sdk] no real backend was called — this is a local stub, always returns unique');
  return { isUnique: true };
}

export interface CreatePaymentIntentParams {
  email: string;
  amount: number;
}

// Local stand-in for createPaymentIntent. Without a real Stripe secret key backend,
// there's no valid client secret to return, so Stripe Elements can't actually mount —
// this only unblocks the local build/import; the Stripe payment method still requires
// a real backend (or VITE_STRIPE_PUBLISHABLE_KEY + real endpoint) to test end-to-end.
export async function createPaymentIntent(_params: CreatePaymentIntentParams): Promise<{ clientSecret: string }> {
  console.log('[mock zite-endpoints-sdk] createPaymentIntent called with:', _params);
  console.log('[mock zite-endpoints-sdk] no real backend was called — this is a local stub, Stripe Elements will not mount');
  return { clientSecret: '' };
}
