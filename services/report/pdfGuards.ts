export function ensureBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation must run on client side');
  }
}
