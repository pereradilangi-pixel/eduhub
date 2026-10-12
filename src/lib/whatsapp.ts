export const WHATSAPP_NUMBER = '94767749660';
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

export function whatsappLink(text?: string): string {
  return text ? `${WHATSAPP_BASE}?text=${encodeURIComponent(text)}` : WHATSAPP_BASE;
}

export function whatsappBuyLink(product: string): string {
  return whatsappLink(`I want to buy ${product}. Please share details.`);
}
