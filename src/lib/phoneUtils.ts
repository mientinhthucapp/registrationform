/**
 * Phone number validation and normalisation utilities.
 * Supports Australian mobile (04...) and international (+XX...) formats.
 */

/** Remove all spaces, dashes, and parentheses from a phone number */
function clean(phone: string): string {
  return phone.replace(/[\s\-()]/g, '');
}

/** Validate phone number format (AU mobile or international) */
export function isValidPhone(phone: string): boolean {
  const p = clean(phone);
  // Australian mobile: 04XXXXXXXX (10 digits)
  if (/^04\d{8}$/.test(p)) return true;
  // International: +XX... (8–15 digits after +)
  if (/^\+\d{8,15}$/.test(p)) return true;
  return false;
}

/** Normalise phone number: AU 04... → +61..., otherwise keep as-is (cleaned) */
export function normalisePhone(phone: string): string {
  const p = clean(phone);
  if (/^04\d{8}$/.test(p)) {
    return '+61' + p.slice(1);
  }
  return p;
}
