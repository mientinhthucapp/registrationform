export interface FormData {
  email: string;
  hoVaTen: string;
  phapDanh: string;
  phoneViber: string;
  namSinh: string;
  gioiTinh: string;
  ngheNghiep: string;
  diaChi: string;
  yeuCauHoTro: string;
  // Emergency contact
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  emergencyAddress: string;
  // Health
  healthConfirmed: boolean;
  rulesConfirmed: boolean;
  // Accommodation
  camping: string;
  campingConfirm: boolean;
  tShirt: string;
  tShirtSize: string;
  // Fee
  donationAmount: string;
  // Payment
  paymentMethod: string;
  additionalMessage: string;
  receiptUrl: string;
  stripePaymentIntentId: string;
}

export const initialFormData: FormData = {
  email: '',
  hoVaTen: '',
  phapDanh: '',
  phoneViber: '',
  namSinh: '',
  gioiTinh: '',
  ngheNghiep: '',
  diaChi: '',
  yeuCauHoTro: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelationship: '',
  emergencyAddress: '',
  healthConfirmed: false,
  rulesConfirmed: false,
  camping: '',
  campingConfirm: false,
  tShirt: '',
  tShirtSize: '',
  donationAmount: '',
  paymentMethod: '',
  additionalMessage: '',
  receiptUrl: '',
  stripePaymentIntentId: '',
};

export const BASE_RETREAT_FEE = 350; // AUD — includes accommodation, meals, group transport & program
export const TSHIRT_PRICE = 1; // [INSERT T-SHIRT PRICE] in AUD
export const MAX_CAPACITY = 999; // [INSERT MAX CAPACITY]

export const LOGO_URL = 'https://images.fillout.com/orgid-702671/flowpublicid-default/widgetid-default/pUfxfV7UzhHdtW4wv6UAV9/pasted-image-1782913166317-o2awyrhs.png';
export const COVER_URL = 'https://images.fillout.com/orgid-702671/flowpublicid-j7pdezg8fp/widgetid-default/rDr67BUngx876bbAmftm64/pasted-image-1783081807189-yp8cga2l.jpg';
export const PAGE_BG_URL = 'https://forms.mientinhthucmelbourne.org/thap-sang-ndbt/images/background_sunrise.jpg';
export const BANNER_URL = 'https://forms.mientinhthucmelbourne.org/thap-sang-ndbt/images/banner.jpg';

/** Parse a donation-amount input string into a valid non-negative number, or 0 if empty/invalid. */
export function parseDonationAmount(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** A donation input is valid if empty, or a non-negative number (up to 2 decimal places). */
export function isValidDonationAmount(value: string): boolean {
  if (value.trim() === '') return true;
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

export function calculateTotal(data: Pick<FormData, 'tShirt' | 'donationAmount'>): { baseFee: number; tShirtFee: number; donationAmount: number; total: number } {
  const baseFee = BASE_RETREAT_FEE;
  const tShirtFee = data.tShirt === 'Có' ? TSHIRT_PRICE : 0;
  const donationAmount = parseDonationAmount(data.donationAmount);
  return { baseFee, tShirtFee, donationAmount, total: baseFee + tShirtFee + donationAmount };
}
