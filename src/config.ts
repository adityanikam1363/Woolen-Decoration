export const WHATSAPP_NUMBER = "919766651363"

export function getWhatsAppUrl(productName?: string) {
  const message = productName
    ? `Hello, I'd like to enquire about the ${productName}.`
    : "Hello, I'd like to know more about your handmade woolen collection."
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
