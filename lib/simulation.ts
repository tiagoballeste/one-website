export const MAX_RENT_AMOUNT = 10_000_000

export type SimulationFormValues = {
  rentAmount: string
  fullName: string
  whatsapp: string
}

export type SimulationCalculation = {
  rentAmount: number
  estimatedMonthlyInsurance: number
  estimatedYearlyInsurance: number
  cashTotal: number
  fiveInstallmentValue: number
  fiveInstallmentTotal: number
  twelveInstallmentValue: number
  twelveInstallmentTotal: number
}

export type SimulationPayload = SimulationCalculation & {
  fullName: string
  whatsapp: string
  source: "website_simulation"
  contactStatus: "awaiting_contact"
  simulatedAt: string
}

export type SimulationPersistenceResponse = {
  id: string
  persistence?: "backend" | "development_mock" | "preview_mock"
}

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function parseCurrencyInput(value: string) {
  const normalized = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatCurrencyInput(value: string) {
  const cleaned = value.replace(/[^\d,]/g, "")
  if (!cleaned) return ""

  const [integerPart = "", ...decimalParts] = cleaned.split(",")
  const integerDigits = integerPart.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
  const integerValue = integerDigits ? Number(integerDigits) : 0
  const formattedInteger = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(integerValue)

  if (!cleaned.includes(",")) return formattedInteger
  return `${formattedInteger},${decimalParts.join("").replace(/\D/g, "").slice(0, 2)}`
}

export function formatCurrencyInputOnBlur(value: string) {
  const amount = parseCurrencyInput(value)
  return amount > 0 ? decimalFormatter.format(amount) : value
}

export function formatBRL(value: number) {
  return brlFormatter.format(value)
}

export function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits ? `(${digits}` : ""
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d+)/, "($1) $2")
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d{1,4})/, "($1) $2-$3")
  return digits.replace(/^(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3")
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

export function hasAtLeastTwoNames(value: string) {
  return normalizeName(value)
    .split(" ")
    .filter((part) => /[\p{L}]/u.test(part)).length >= 2
}

export function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "")
}

export function calculateSimulation(rentAmount: number): SimulationCalculation {
  const estimatedMonthlyInsurance = roundCurrency(rentAmount * 0.1)
  const estimatedYearlyInsurance = roundCurrency(rentAmount * 1.2)
  const cashTotal = estimatedYearlyInsurance
  const fiveInstallmentTotal = roundCurrency(estimatedYearlyInsurance * 1.1)
  const twelveInstallmentTotal = roundCurrency(estimatedYearlyInsurance * 1.15)

  return {
    rentAmount: roundCurrency(rentAmount),
    estimatedMonthlyInsurance,
    estimatedYearlyInsurance,
    cashTotal,
    fiveInstallmentValue: roundCurrency(fiveInstallmentTotal / 5),
    fiveInstallmentTotal,
    twelveInstallmentValue: roundCurrency(twelveInstallmentTotal / 12),
    twelveInstallmentTotal,
  }
}
