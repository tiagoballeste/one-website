"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react"
import { SimulationExportCard } from "@/components/SimulationExportCard"
import { WhatsappIcon } from "@/components/icons/WhatsappIcon"
import { buildSimulationWhatsAppUrl } from "@/lib/one-contact"
import { downloadSimulationImage } from "@/lib/simulation-image"
import {
  MAX_RENT_AMOUNT,
  calculateSimulation,
  formatBRL,
  formatCurrencyInput,
  formatCurrencyInputOnBlur,
  formatWhatsapp,
  hasAtLeastTwoNames,
  normalizeName,
  normalizeWhatsapp,
  parseCurrencyInput,
  type SimulationCalculation,
  type SimulationFormValues,
  type SimulationPayload,
} from "@/lib/simulation"
import { persistSimulation, trackSimulationWhatsappOpen } from "@/lib/simulation-service"

type SimulationModalProps = {
  isOpen: boolean
  onClose: () => void
}

type FieldName = keyof SimulationFormValues
type FormErrors = Partial<Record<FieldName, string>>

const INITIAL_VALUES: SimulationFormValues = { rentAmount: "", fullName: "", whatsapp: "" }

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4v17m0 0 7-7m-7 7-7-7M5 21v6h22v-6" />
    </svg>
  )
}

export function SimulationModal({ isOpen, onClose }: SimulationModalProps) {
  const [view, setView] = useState<"form" | "result">("form")
  const [values, setValues] = useState<SimulationFormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState("")
  const [result, setResult] = useState<SimulationCalculation | null>(null)
  const [simulationId, setSimulationId] = useState<string>()
  const [simulatedAt, setSimulatedAt] = useState<Date>()
  const modalRef = useRef<HTMLDivElement | null>(null)
  const exportRef = useRef<HTMLDivElement | null>(null)
  const rentInputRef = useRef<HTMLInputElement | null>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const fieldRefs = useRef<Record<FieldName, HTMLInputElement | null>>({ rentAmount: null, fullName: null, whatsapp: null })
  const titleId = useId()
  const descriptionId = useId()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (isOpen) return
    const resetTimer = window.setTimeout(() => {
      setView("form")
      setValues(INITIAL_VALUES)
      setErrors({})
      setSubmitError("")
      setIsSubmitting(false)
      setIsDownloading(false)
      setDownloadError("")
      setResult(null)
      setSimulationId(undefined)
      setSimulatedAt(undefined)
    }, 260)
    return () => window.clearTimeout(resetTimer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting && !isDownloading) {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== "Tab" || !modalRef.current) return

      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled") && element.tabIndex >= 0 && element.offsetParent !== null,
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isDownloading, isOpen, isSubmitting, onClose])

  useEffect(() => {
    if (!isOpen) return
    const focusTimer = window.setTimeout(() => {
      if (view === "form") rentInputRef.current?.focus()
      else resultHeadingRef.current?.focus()
    }, reduceMotion ? 0 : 180)
    return () => window.clearTimeout(focusTimer)
  }, [isOpen, reduceMotion, view])

  const whatsappUrl = useMemo(() => {
    if (!result || !simulationId) return "#"
    const simulationReference = simulationId.startsWith("local-") ? "" : `\nSimulação: ${simulationId}`
    return buildSimulationWhatsAppUrl(
      `Olá! Meu nome é ${normalizeName(values.fullName)} e acabei de fazer uma simulação pelo site da ONE para um aluguel de ${formatBRL(result.rentAmount)}. O valor estimado foi de ${formatBRL(result.cashTotal)} à vista.\nGostaria de conhecer as condições e entender os próximos passos.${simulationReference}`,
    )
  }, [result, simulationId, values.fullName])

  const setFieldValue = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError("")
  }

  const validate = () => {
    const nextErrors: FormErrors = {}
    const rentAmount = parseCurrencyInput(values.rentAmount)
    const fullName = normalizeName(values.fullName)
    const whatsapp = normalizeWhatsapp(values.whatsapp)

    if (!values.rentAmount) nextErrors.rentAmount = "Informe o valor mensal do aluguel."
    else if (rentAmount <= 0) nextErrors.rentAmount = "Informe um valor de aluguel maior que zero."
    else if (rentAmount > MAX_RENT_AMOUNT) nextErrors.rentAmount = "Informe um aluguel de até R$ 10.000.000,00."

    if (!fullName) nextErrors.fullName = "Informe seu nome completo."
    else if (!hasAtLeastTwoNames(fullName)) nextErrors.fullName = "Informe seu nome e sobrenome."

    if (!whatsapp) nextErrors.whatsapp = "Informe seu WhatsApp com DDD."
    else if (!/^\d{10,11}$/.test(whatsapp)) nextErrors.whatsapp = "Informe um WhatsApp brasileiro válido com DDD."

    setErrors(nextErrors)
    const firstInvalid = (["rentAmount", "fullName", "whatsapp"] as FieldName[]).find((field) => nextErrors[field])
    if (firstInvalid) requestAnimationFrame(() => fieldRefs.current[firstInvalid]?.focus())
    return { isValid: !firstInvalid, rentAmount, fullName, whatsapp }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    const validated = validate()
    if (!validated.isValid) return

    const calculation = calculateSimulation(validated.rentAmount)
    const simulationDate = new Date()
    const payload: SimulationPayload = {
      ...calculation,
      fullName: validated.fullName,
      whatsapp: validated.whatsapp,
      source: "website_simulation",
      contactStatus: "awaiting_contact",
      simulatedAt: simulationDate.toISOString(),
    }

    setIsSubmitting(true)
    setSubmitError("")
    try {
      const saved = await persistSimulation(payload, simulationId)
      setSimulationId(saved.id)
      setValues({
        rentAmount: formatCurrencyInputOnBlur(values.rentAmount),
        fullName: validated.fullName,
        whatsapp: formatWhatsapp(validated.whatsapp),
      })
      setResult(calculation)
      setSimulatedAt(simulationDate)
      setView("result")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível registrar a simulação agora.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    if (!isSubmitting && !isDownloading) onClose()
  }

  const handleDownload = async () => {
    if (!result || !exportRef.current || isDownloading) return
    setIsDownloading(true)
    setDownloadError("")
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      await downloadSimulationImage({ element: exportRef.current, fullName: values.fullName, generatedAt: simulatedAt })
    } catch {
      setDownloadError("Não foi possível baixar a simulação. Tente novamente.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="simulation-modal"
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <button
            className="simulation-modal__backdrop"
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            disabled={isSubmitting || isDownloading}
            onClick={closeModal}
          />

          <motion.section
            className={`simulation-modal__sheet simulation-modal__sheet--${view}`}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="simulation-modal__close" type="button" onClick={closeModal} disabled={isSubmitting || isDownloading} aria-label="Fechar simulação">
              <CloseIcon />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {view === "form" ? (
                <motion.div
                  key="form"
                  className="simulation-modal__view"
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                >
                  <header className="simulation-modal__header">
                    <h2 id={titleId}>Simule sua<br />Fiança Locatícia</h2>
                    <p id={descriptionId}>Informe o valor do aluguel e seus dados para visualizar a estimativa.</p>
                  </header>

                  <form className="simulation-form" onSubmit={handleSubmit} noValidate>
                    <label className="simulation-field">
                      <span>Valor mensal do aluguel</span>
                      <span className={`simulation-field__control simulation-field__control--currency ${errors.rentAmount ? "is-invalid" : ""}`}>
                        <span className="simulation-field__prefix" aria-hidden="true">R$</span>
                        <input
                          ref={(node) => { rentInputRef.current = node; fieldRefs.current.rentAmount = node }}
                          name="rentAmount"
                          value={values.rentAmount}
                          onChange={(event) => setFieldValue("rentAmount", formatCurrencyInput(event.target.value))}
                          onBlur={(event) => setFieldValue("rentAmount", formatCurrencyInputOnBlur(event.target.value))}
                          inputMode="decimal"
                          autoComplete="off"
                          aria-invalid={Boolean(errors.rentAmount)}
                          aria-describedby={errors.rentAmount ? "simulation-rent-error" : undefined}
                        />
                      </span>
                      {errors.rentAmount && <small id="simulation-rent-error" className="simulation-field__error">{errors.rentAmount}</small>}
                    </label>

                    <label className="simulation-field">
                      <span>Nome completo</span>
                      <span className={`simulation-field__control ${errors.fullName ? "is-invalid" : ""}`}>
                        <input
                          ref={(node) => { fieldRefs.current.fullName = node }}
                          name="fullName"
                          value={values.fullName}
                          onChange={(event) => setFieldValue("fullName", event.target.value)}
                          onBlur={(event) => setFieldValue("fullName", normalizeName(event.target.value))}
                          autoComplete="name"
                          maxLength={120}
                          aria-invalid={Boolean(errors.fullName)}
                          aria-describedby={errors.fullName ? "simulation-name-error" : undefined}
                        />
                      </span>
                      {errors.fullName && <small id="simulation-name-error" className="simulation-field__error">{errors.fullName}</small>}
                    </label>

                    <label className="simulation-field">
                      <span>WhatsApp com DDD</span>
                      <span className={`simulation-field__control ${errors.whatsapp ? "is-invalid" : ""}`}>
                        <input
                          ref={(node) => { fieldRefs.current.whatsapp = node }}
                          name="whatsapp"
                          type="tel"
                          value={values.whatsapp}
                          onChange={(event) => setFieldValue("whatsapp", formatWhatsapp(event.target.value))}
                          autoComplete="tel"
                          inputMode="tel"
                          aria-invalid={Boolean(errors.whatsapp)}
                          aria-describedby={errors.whatsapp ? "simulation-whatsapp-error" : undefined}
                        />
                      </span>
                      {errors.whatsapp && <small id="simulation-whatsapp-error" className="simulation-field__error">{errors.whatsapp}</small>}
                    </label>

                    <p className="simulation-form__privacy">Seus dados serão utilizados para registrar a simulação e atender esta solicitação.</p>
                    {submitError && <p className="simulation-form__submit-error" role="alert">{submitError}</p>}

                    <button className="simulation-modal__primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Calculando..." : "Ver minha simulação"}
                    </button>
                    <p className="simulation-form__duration">Leva menos de 1 minuto.</p>
                  </form>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  className="simulation-modal__view"
                  initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                >
                  <header className="simulation-modal__header simulation-modal__header--result">
                    <h2 id={titleId} ref={resultHeadingRef} tabIndex={-1}>Resultado da<br />simulação</h2>
                    <p id={descriptionId}>Simulação registrada.</p>
                  </header>

                  <div className="simulation-result__main">
                    <span>Seguro estimado</span>
                    <strong>{formatBRL(result.cashTotal)}</strong>
                    <p>À vista</p>
                  </div>

                  <div className="simulation-result__payments" aria-label="Formas de pagamento estimadas">
                    <div className="simulation-result__payment">
                      <span>5x no cartão de:</span>
                      <strong>{formatBRL(result.fiveInstallmentValue)}</strong>
                      <small>Total de: {formatBRL(result.fiveInstallmentTotal)}</small>
                    </div>
                    <div className="simulation-result__payment">
                      <span>12x no cartão de:</span>
                      <strong>{formatBRL(result.twelveInstallmentValue)}</strong>
                      <small>Total de: {formatBRL(result.twelveInstallmentTotal)}</small>
                    </div>
                  </div>

                  <p className="simulation-result__disclaimer">Estimativa inicial. O valor final pode variar após a análise.</p>
                  <div className="simulation-result__divider" aria-hidden="true" />
                  <div className="simulation-result__rent-row">
                    <p className="simulation-result__rent">Aluguel informado: <strong>{formatBRL(result.rentAmount)}</strong></p>
                    <button className="simulation-result__edit" type="button" onClick={() => setView("form")}>Alterar</button>
                  </div>

                  <a
                    className="simulation-modal__primary simulation-modal__whatsapp"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => simulationId && trackSimulationWhatsappOpen(simulationId)}
                  >
                    <WhatsappIcon />
                    <span>Consultar condições pelo WhatsApp</span>
                  </a>
                  <button
                    className="simulation-modal__secondary simulation-modal__download"
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    aria-describedby={downloadError ? "simulation-download-error" : undefined}
                  >
                    <DownloadIcon />
                    <span>{isDownloading ? "Gerando..." : "Baixar simulação"}</span>
                  </button>
                  {downloadError && <p id="simulation-download-error" className="simulation-modal__download-error" role="alert">{downloadError}</p>}
                  <button className="simulation-modal__quiet" type="button" onClick={closeModal} disabled={isDownloading}>Fechar</button>
                  <SimulationExportCard
                    ref={exportRef}
                    result={result}
                    fullName={values.fullName}
                    whatsapp={values.whatsapp}
                    simulatedAt={simulatedAt ?? new Date()}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
