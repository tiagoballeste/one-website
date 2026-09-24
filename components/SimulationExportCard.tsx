import Image from "next/image"
import { forwardRef } from "react"
import { formatBRL, normalizeName, normalizeWhatsapp, type SimulationCalculation } from "@/lib/simulation"

type SimulationExportCardProps = {
  result: SimulationCalculation
  fullName: string
  whatsapp: string
  simulatedAt: Date
}

function formatExportWhatsapp(value: string) {
  const digits = normalizeWhatsapp(value)
  if (digits.length === 11) return `+55 ${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `+55 ${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `+55 ${digits}`
}

function formatSimulationDate(date: Date) {
  const day = date.toLocaleDateString("pt-BR")
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  return `Simulação realizada em ${day}, às ${time}`
}

function compactCurrencyClass(value: string) {
  return value.length > 14 ? "is-compact" : undefined
}

function nameClass(value: string) {
  if (value.length > 64) return "is-extra-compact"
  if (value.length > 36) return "is-compact"
  return undefined
}

export const SimulationExportCard = forwardRef<HTMLDivElement, SimulationExportCardProps>(
  function SimulationExportCard({ result, fullName, whatsapp, simulatedAt }, ref) {
    const normalizedFullName = normalizeName(fullName)
    const rentAmount = formatBRL(result.rentAmount)
    const cashTotal = formatBRL(result.cashTotal)
    const fiveInstallmentValue = formatBRL(result.fiveInstallmentValue)
    const fiveInstallmentTotal = formatBRL(result.fiveInstallmentTotal)
    const twelveInstallmentValue = formatBRL(result.twelveInstallmentValue)
    const twelveInstallmentTotal = formatBRL(result.twelveInstallmentTotal)

    return (
      <div className="simulation-export-stage" aria-hidden="true">
        <div className="simulation-export" ref={ref}>
          <Image
            className="simulation-export__logo"
            src="/logos/logo-one-wide-export.png"
            alt=""
            width={920}
            height={335}
            loading="eager"
            unoptimized
          />

          <header className="simulation-export__header">
            <h2>Simulação de Fiança Locatícia</h2>
            <p>Dados enviados pelo simulador do site</p>
          </header>

          <section className="simulation-export__card simulation-export__applicant">
            <h3>Solicitante</h3>
            <div className="simulation-export__applicant-grid">
              <div>
                <span>Nome</span>
                <strong className={nameClass(normalizedFullName)}>{normalizedFullName}</strong>
              </div>
              <div>
                <span>WhatsApp</span>
                <strong>{formatExportWhatsapp(whatsapp)}</strong>
              </div>
            </div>
            <p>{formatSimulationDate(simulatedAt)}</p>
          </section>

          <section className="simulation-export__card simulation-export__summary">
            <h3>Resumo da Simulação</h3>
            <span>Valor mensal do aluguel</span>
            <strong className={`simulation-export__rent ${compactCurrencyClass(rentAmount) ?? ""}`.trim()}>{rentAmount}</strong>
            <div className="simulation-export__divider" />

            <div className="simulation-export__payment-layout">
              <div className="simulation-export__cash">
                <span>Seguro estimado</span>
                <strong className={compactCurrencyClass(cashTotal)}>{cashTotal}</strong>
                <small>À vista</small>
              </div>
              <div className="simulation-export__installments">
                <div className="simulation-export__installment">
                  <span>em 5x no cartão de:</span>
                  <strong className={compactCurrencyClass(fiveInstallmentValue)}>{fiveInstallmentValue}</strong>
                  <small className={compactCurrencyClass(fiveInstallmentTotal)}>total de: {fiveInstallmentTotal}</small>
                </div>
                <div className="simulation-export__installment">
                  <span>em 12x no cartão de:</span>
                  <strong className={compactCurrencyClass(twelveInstallmentValue)}>{twelveInstallmentValue}</strong>
                  <small className={compactCurrencyClass(twelveInstallmentTotal)}>total de: {twelveInstallmentTotal}</small>
                </div>
              </div>
            </div>
          </section>

          <p className="simulation-export__coverage">
            A cobertura da ONE Fiança Locatícia contempla as principais obrigações financeiras previstas no contrato de locação, como aluguel, IPTU, condomínio e taxa de lixo. Em caso de inadimplência do inquilino, também abrange a condução do processo jurídico de despejo, quando necessário, evitando que o proprietário e o corretor precisem assumir diretamente os procedimentos relacionados à ação judicial.
          </p>

          <footer className="simulation-export__footer">
            <p>Estimativa inicial. O valor final pode variar após a análise.</p>
            <span>onefiancalocaticia.com.br</span>
          </footer>
        </div>
      </div>
    )
  },
)
