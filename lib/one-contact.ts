export const ONE_WHATSAPP_NUMBER = "5511970309686"
export const ONE_SIMULATION_WHATSAPP_NUMBER = "554784810480"

export function buildWhatsAppUrl(number: string, message?: string) {
  const baseUrl = `https://wa.me/${number}`
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl
}

export function buildOneWhatsAppUrl(message?: string) {
  return buildWhatsAppUrl(ONE_WHATSAPP_NUMBER, message)
}

export function buildSimulationWhatsAppUrl(message: string) {
  return buildWhatsAppUrl(ONE_SIMULATION_WHATSAPP_NUMBER, message)
}
