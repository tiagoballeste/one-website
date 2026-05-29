"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

type BrokerRegistrationModalProps = {
  isOpen: boolean
  onClose: () => void
}

type TrackingValues = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term", string>>

type BrokerType = "autonomo" | "vinculado_imobiliaria" | "consultor" | "outro"

type BrokerFormValues = {
  nome_completo: string
  cpf: string
  creci: string
  tipo_corretor: BrokerType | ""
  uf: string
  cidade: string
  imobiliaria_informada: string
  whatsapp: string
  email: string
  perfil_profissional: string
  volume_indicacoes: number | null
  aceite_lgpd: boolean
  opt_in_marketing: boolean
}

type BrokerFormField = keyof BrokerFormValues | "submit"
type BrokerErrors = Partial<Record<BrokerFormField, string>>

type BrokerProgressPayload = {
  values: BrokerFormValues
  currentStep: number
  completedStep: number
  savedAt: number
}

type BackendErrorResponse = {
  detail?: unknown
  message?: string
  error?: string
  field?: BrokerFormField
}

const PROGRESS_KEY = "cadastro_corretor_progresso"
const PROGRESS_TTL = 24 * 60 * 60 * 1000
const TOKEN_KEY = "cadastro_corretor_token"
const UTM_STORAGE_KEY = "cadastro_corretor_utm"

const initialBrokerValues: BrokerFormValues = {
  nome_completo: "",
  cpf: "",
  creci: "",
  tipo_corretor: "",
  uf: "",
  cidade: "",
  imobiliaria_informada: "",
  whatsapp: "",
  email: "",
  perfil_profissional: "",
  volume_indicacoes: null,
  aceite_lgpd: false,
  opt_in_marketing: false,
}

const steps = [
  { number: 1, label: "Identificação" },
  { number: 2, label: "Atuação" },
  { number: 3, label: "Perfil" },
]

const stepCopy = {
  1: {
    title: "Identificação",
    description: "Comece com seus dados profissionais como corretor.",
  },
  2: {
    title: "Onde você atua",
    description: "Informe sua região de atuação e dados de vínculo.",
    autonomousDescription: "Informe sua região principal de atuação.",
  },
  3: {
    title: "Contato e perfil",
    description: "Última etapa. Como entramos em contato e um pouco sobre sua atuação.",
  },
}

const brokerTypeOptions: Array<{ title: string; description: string; value: BrokerType }> = [
  { title: "Autônomo", description: "Atuo por conta própria", value: "autonomo" },
  { title: "Vinculado", description: "Trabalho em uma imobiliária", value: "vinculado_imobiliaria" },
  { title: "Consultor", description: "Atuo como consultor imobiliário", value: "consultor" },
  { title: "Outro", description: "Outra forma de atuação", value: "outro" },
]

const volumeOptions = [
  { label: "Até 2", value: 2 },
  { label: "3 a 5", value: 4 },
  { label: "6 a 10", value: 8 },
  { label: "Mais de 10", value: 15 },
]

const brazilUfs = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

const onlyDigits = (value: string) => value.replace(/\D/g, "")
const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ")

const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
}

const isValidCpf = (value: string) => {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  const calculateDigit = (length: number) => {
    const numbers = cpf.slice(0, length).split("").map(Number)
    const sum = numbers.reduce((total, number, index) => total + number * (length + 1 - index), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10])
}

const formatPhone = (value: string) => {
  let digits = onlyDigits(value).slice(0, 13)
  if (digits.startsWith("55")) digits = digits.slice(2)
  digits = digits.slice(0, 11)

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
  }

  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
}

const normalizeWhatsapp = (value: string) => {
  const digits = onlyDigits(value)
  if (digits.startsWith("55")) return digits.slice(0, 13)
  return `55${digits}`.slice(0, 13)
}

const getProgress = (): BrokerProgressPayload | null => {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BrokerProgressPayload
    if (!parsed.savedAt || Date.now() - parsed.savedAt > PROGRESS_TTL) {
      window.localStorage.removeItem(PROGRESS_KEY)
      return null
    }
    parsed.values = { ...initialBrokerValues, ...parsed.values }
    return parsed
  } catch {
    window.localStorage.removeItem(PROGRESS_KEY)
    return null
  }
}

const extractBackendMessage = (data: BackendErrorResponse) => {
  if (data.message || data.error) return data.message || data.error

  if (Array.isArray(data.detail)) {
    const firstDetail = data.detail[0] as { msg?: string } | undefined
    if (firstDetail?.msg) return firstDetail.msg
  }

  if (typeof data.detail === "string") return data.detail

  return ""
}

const extractBackendField = (data: BackendErrorResponse): BrokerFormField | undefined => {
  if (data.field) return data.field

  if (Array.isArray(data.detail)) {
    const firstDetail = data.detail[0] as { loc?: unknown[] } | undefined
    const field = firstDetail?.loc
      ?.slice()
      .reverse()
      .find((item) => typeof item === "string")
    if (typeof field === "string" && field in initialBrokerValues) return field as BrokerFormField
  }

  return undefined
}

function ArrowIcon({ pulseKey, direction = "right" }: { pulseKey?: number; direction?: "left" | "right" }) {
  return (
    <motion.svg
      key={pulseKey}
      className="registration-arrow"
      viewBox="0 0 24 24"
      aria-hidden="true"
      initial={{ x: 0 }}
      animate={{ x: direction === "right" ? [0, 8, 0] : [0, -8, 0] }}
      transition={{ duration: 0.36, ease: "easeInOut" }}
    >
      {direction === "left" ? <path d="M19 12H5m6-6-6 6 6 6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </motion.svg>
  )
}

function Spinner() {
  return <span className="registration-spinner" aria-hidden="true" />
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 12.5 4 4L18 8" />
    </svg>
  )
}

function RecoveryClockIcon() {
  return (
    <svg className="registration-recovery__clock" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="21" />
      <path d="M32 20v14h12" />
    </svg>
  )
}

function SuccessMark() {
  return (
    <motion.img
      className="registration-success__mark"
      src="/icons/registration/check-cadastro-final.svg"
      alt=""
      aria-hidden="true"
      initial={{ scale: 0.88, rotate: -4, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}

function RecoveryPrompt({
  titleId,
  onClose,
  onRestart,
  onContinue,
}: {
  titleId: string
  onClose: () => void
  onRestart: () => void
  onContinue: () => void
}) {
  return (
    <div className="registration-recovery">
      <button className="registration-recovery__close" type="button" onClick={onClose} aria-label="Fechar aviso de cadastro em andamento">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>

      <div className="registration-recovery__icon">
        <RecoveryClockIcon />
      </div>

      <div className="registration-recovery__copy">
        <h2 id={titleId}>Cadastro em andamento</h2>
        <p>Encontramos um cadastro não finalizado. Deseja continuar de onde parou?</p>
      </div>

      <div className="registration-recovery__divider" aria-hidden="true" />

      <div className="registration-recovery__actions">
        <button className="registration-recovery__button registration-recovery__button--secondary" type="button" onClick={onRestart}>
          Recomeçar
        </button>
        <button className="registration-recovery__button registration-recovery__button--primary" type="button" onClick={onContinue}>
          Continuar
        </button>
      </div>
    </div>
  )
}

function Stepper({
  currentStep,
  completedStep,
  onStepClick,
}: {
  currentStep: number
  completedStep: number
  onStepClick: (step: number) => void
}) {
  return (
    <ol className="registration-stepper" aria-label="Progresso do cadastro de corretor">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep
        const isCompleted = step.number <= completedStep && step.number < currentStep
        const isClickable = step.number <= completedStep + 1 && step.number < currentStep

        return (
          <li className="registration-stepper__item" key={step.number}>
            <button
              className={`registration-stepper__dot ${isActive ? "is-active" : ""} ${isCompleted ? "is-completed" : ""}`}
              type="button"
              onClick={() => onStepClick(step.number)}
              disabled={!isClickable}
              aria-current={isActive ? "step" : undefined}
              aria-label={`${step.label}${isCompleted ? " concluído" : ""}`}
            >
              {isCompleted ? <CheckIcon /> : step.number}
            </button>
            <span className={`registration-stepper__label ${isActive || isCompleted ? "is-active" : ""}`}>{step.label}</span>
            {index < steps.length - 1 && <span className="registration-stepper__line" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

export function BrokerRegistrationModal({ isOpen, onClose }: BrokerRegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedStep, setCompletedStep] = useState(0)
  const [values, setValues] = useState<BrokerFormValues>(initialBrokerValues)
  const [errors, setErrors] = useState<BrokerErrors>({})
  const [tracking, setTracking] = useState<TrackingValues>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)
  const [arrowPulse, setArrowPulse] = useState(0)
  const [expanderBounds, setExpanderBounds] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [recoveryProgress, setRecoveryProgress] = useState<BrokerProgressPayload | null>(null)
  const [isRecoveryPromptOpen, setIsRecoveryPromptOpen] = useState(false)
  const progressPromptedRef = useRef(false)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const sheetRef = useRef<HTMLElement | null>(null)
  const submitButtonRef = useRef<HTMLButtonElement | null>(null)
  const titleId = useId()

  const isAutonomous = values.tipo_corretor === "autonomo"

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isRecoveryPromptOpen) {
          setIsRecoveryPromptOpen(false)
          setRecoveryProgress(null)
        }
        onClose()
      }

      if (event.key !== "Tab" || !modalRef.current) return

      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled") && element.offsetParent !== null,
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
    requestAnimationFrame(() => modalRef.current?.focus())

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen, isRecoveryPromptOpen, onClose])

  useEffect(() => {
    if (!isOpen || progressPromptedRef.current) return
    progressPromptedRef.current = true

    const savedProgress = getProgress()
    if (!savedProgress) return

    setRecoveryProgress(savedProgress)
    setIsRecoveryPromptOpen(true)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      progressPromptedRef.current = false
      setIsRecoveryPromptOpen(false)
      setRecoveryProgress(null)
      return
    }

    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const
    const urlParams = new URLSearchParams(window.location.search)
    const stored = window.sessionStorage.getItem(UTM_STORAGE_KEY)
    let storedTracking: TrackingValues = {}

    if (stored) {
      try {
        storedTracking = JSON.parse(stored) as TrackingValues
      } catch {
        window.sessionStorage.removeItem(UTM_STORAGE_KEY)
      }
    }

    const nextTracking = { ...storedTracking }

    keys.forEach((key) => {
      const value = urlParams.get(key)
      if (value) nextTracking[key] = value
    })

    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(nextTracking))
    setTracking(nextTracking)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || isSuccess || isRecoveryPromptOpen) return
    const hasProgress =
      Object.entries(values).some(([key, value]) => {
        if (key === "aceite_lgpd" || key === "opt_in_marketing") return Boolean(value)
        return typeof value === "string" ? value.trim().length > 0 : value !== null
      }) || currentStep > 1

    if (!hasProgress) return

    const payload: BrokerProgressPayload = {
      values,
      currentStep,
      completedStep,
      savedAt: Date.now(),
    }
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload))
  }, [completedStep, currentStep, isOpen, isRecoveryPromptOpen, isSuccess, values])

  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0
  }, [currentStep, isSuccess])

  const currentDescription = useMemo(() => {
    if (currentStep === 2 && isAutonomous) return stepCopy[2].autonomousDescription
    return stepCopy[currentStep as 1 | 2 | 3].description
  }, [currentStep, isAutonomous])

  const updateValue = <K extends keyof BrokerFormValues>(key: K, value: BrokerFormValues[K]) => {
    setValues((current) => {
      if (key === "tipo_corretor" && value === "autonomo") {
        return { ...current, [key]: value, imobiliaria_informada: "" }
      }
      return { ...current, [key]: value }
    })
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined }))
  }

  const validateStep = (step = currentStep) => {
    const nextErrors: BrokerErrors = {}

    if (step === 1) {
      const name = normalizeText(values.nome_completo)
      const creci = values.creci.trim()
      if (name.length < 2 || name.length > 220) nextErrors.nome_completo = "Informe o nome completo com 2 a 220 caracteres."
      if (!isValidCpf(values.cpf)) nextErrors.cpf = "Informe um CPF válido."
      if (creci.length < 3 || creci.length > 40) nextErrors.creci = "Informe o CRECI com 3 a 40 caracteres."
      if (!values.tipo_corretor) nextErrors.tipo_corretor = "Selecione como você atua."
    }

    if (step === 2) {
      const city = normalizeText(values.cidade)
      const informedRealEstate = normalizeText(values.imobiliaria_informada)
      if (!brazilUfs.includes(values.uf)) nextErrors.uf = "Selecione uma UF válida."
      if (city.length < 2 || city.length > 120) nextErrors.cidade = "Informe uma cidade com 2 a 120 caracteres."
      if (!isAutonomous && (informedRealEstate.length < 2 || informedRealEstate.length > 220)) {
        nextErrors.imobiliaria_informada = "Informe o nome da imobiliária com 2 a 220 caracteres."
      }
    }

    if (step === 3) {
      const whatsappDigits = onlyDigits(values.whatsapp)
      if (whatsappDigits.length < 10 || whatsappDigits.length > 13) nextErrors.whatsapp = "Informe um WhatsApp válido."
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 255) {
        nextErrors.email = "Informe um e-mail válido."
      }
      if (values.perfil_profissional.length > 500) {
        nextErrors.perfil_profissional = "Use no máximo 500 caracteres."
      }
      if (!values.aceite_lgpd) nextErrors.aceite_lgpd = "O aceite LGPD é obrigatório para enviar."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const advanceStep = () => {
    setArrowPulse((current) => current + 1)
    if (!validateStep()) return
    setCompletedStep((step) => Math.max(step, currentStep))
    setCurrentStep((step) => Math.min(3, step + 1))
  }

  const goToStep = (step: number) => {
    if (step <= completedStep + 1 && step < currentStep) {
      setCurrentStep(step)
      setErrors({})
    }
  }

  const goBack = () => {
    setCurrentStep((step) => Math.max(1, step - 1))
    setErrors({})
  }

  const resetFlow = () => {
    setArrowPulse((current) => current + 1)
    setValues(initialBrokerValues)
    setErrors({})
    setCurrentStep(1)
    setCompletedStep(0)
    setIsSuccess(false)
    setIsLoading(false)
    setIsExpanding(false)
    window.localStorage.removeItem(PROGRESS_KEY)
  }

  const closeRecoveryPrompt = () => {
    setIsRecoveryPromptOpen(false)
    setRecoveryProgress(null)
    onClose()
  }

  const continueSavedProgress = () => {
    if (!recoveryProgress) return
    setValues(recoveryProgress.values)
    setCurrentStep(recoveryProgress.currentStep)
    setCompletedStep(recoveryProgress.completedStep)
    setErrors({})
    setIsSuccess(false)
    setIsLoading(false)
    setIsExpanding(false)
    setIsRecoveryPromptOpen(false)
    setRecoveryProgress(null)
  }

  const restartSavedProgress = () => {
    resetFlow()
    setIsRecoveryPromptOpen(false)
    setRecoveryProgress(null)
  }

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      nome_completo: normalizeText(values.nome_completo),
      cpf: onlyDigits(values.cpf),
      creci: values.creci.trim(),
      whatsapp: normalizeWhatsapp(values.whatsapp),
      email: values.email.trim(),
      cidade: normalizeText(values.cidade),
      uf: values.uf,
      tipo_corretor: values.tipo_corretor,
      aceite_lgpd: values.aceite_lgpd,
      opt_in_marketing: values.opt_in_marketing,
      origem: "site",
      origem_nome: "modal_corretor",
      ...tracking,
    }

    const professionalProfile = normalizeText(values.perfil_profissional)
    const informedRealEstate = normalizeText(values.imobiliaria_informada)
    if (professionalProfile) payload.perfil_profissional = professionalProfile
    if (values.volume_indicacoes !== null) payload.volume_indicacoes = values.volume_indicacoes
    if (!isAutonomous && informedRealEstate) payload.imobiliaria_informada = informedRealEstate

    return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined && value !== null))
  }

  const finishExpansion = () => {
    window.localStorage.removeItem(PROGRESS_KEY)
    setIsExpanding(false)
    setIsSuccess(true)
  }

  const submitForm = async () => {
    setArrowPulse((current) => current + 1)
    if (!validateStep(3)) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch("/api/corretores", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload()),
      })
      const data = (await response.json().catch(() => ({}))) as BackendErrorResponse & { token_cadastro?: string }

      if (!response.ok) {
        const backendField = extractBackendField(data)
        const backendMessage = extractBackendMessage(data)
        const message =
          response.status === 409
            ? "Este CPF já está cadastrado"
            : response.status === 422
              ? "Imobiliária selecionada não está mais disponível. Selecione outra ou cadastre como autônomo."
              : response.status >= 500
                ? "Erro ao enviar. Tente novamente."
                : backendMessage || "Revise os dados e tente novamente."

        setErrors((current) => (backendField ? { ...current, [backendField]: message } : { ...current, submit: message }))
        return
      }

      if (data.token_cadastro) window.localStorage.setItem(TOKEN_KEY, data.token_cadastro)

      const button = submitButtonRef.current
      const sheet = sheetRef.current
      if (button && sheet) {
        const buttonRect = button.getBoundingClientRect()
        const sheetRect = sheet.getBoundingClientRect()
        setExpanderBounds({
          top: buttonRect.top - sheetRect.top,
          left: buttonRect.left - sheetRect.left,
          width: buttonRect.width,
          height: buttonRect.height,
        })
        setIsExpanding(true)
      } else {
        finishExpansion()
      }
    } catch {
      setErrors({ submit: "Erro ao enviar. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  const renderFieldError = (key: BrokerFormField) =>
    errors[key] ? <span className="registration-field__error">{errors[key]}</span> : null

  const fieldClass = (key: BrokerFormField, extra = "") => `registration-field ${extra} ${errors[key] ? "has-error" : ""}`.trim()

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <div className="registration-fields registration-fields--broker-id">
          <label className={fieldClass("nome_completo", "registration-field--full")}>
            <span>Nome completo *</span>
            <input
              value={values.nome_completo}
              onChange={(event) => updateValue("nome_completo", event.target.value.slice(0, 220))}
              placeholder="Ex: João da Silva"
              autoComplete="name"
            />
            {renderFieldError("nome_completo")}
          </label>

          <label className={fieldClass("cpf")}>
            <span>CPF *</span>
            <input
              value={values.cpf}
              onChange={(event) => updateValue("cpf", formatCpf(event.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
            {renderFieldError("cpf")}
          </label>

          <label className={fieldClass("creci")}>
            <span>CRECI *</span>
            <input
              value={values.creci}
              onChange={(event) => updateValue("creci", event.target.value.slice(0, 40))}
              placeholder="Ex: CRECI-SP 12345"
            />
            {renderFieldError("creci")}
          </label>

          <fieldset className={`registration-radio-group ${errors.tipo_corretor ? "has-error" : ""}`}>
            <legend>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 10V8a5 5 0 0 1 10 0v2m-9 0h8m-11 0h14v9H5v-9Z" />
              </svg>
              Como você atua? *
            </legend>
            <div className="registration-radio-grid">
              {brokerTypeOptions.map((option) => {
                const selected = values.tipo_corretor === option.value
                return (
                  <label className={`registration-radio-card ${selected ? "is-selected" : ""}`} key={option.value}>
                    <input
                      checked={selected}
                      name="tipo_corretor"
                      onChange={() => updateValue("tipo_corretor", option.value)}
                      type="radio"
                    />
                    <span>
                      <strong>{option.title}</strong>
                      <small>{option.description}</small>
                    </span>
                  </label>
                )
              })}
            </div>
            {renderFieldError("tipo_corretor")}
          </fieldset>
        </div>
      )
    }

    if (currentStep === 2) {
      return (
        <div className="registration-fields registration-fields--grouped">
          <div className="registration-field-group">
            <p className="registration-field-group__title">REGIÃO DE ATUAÇÃO</p>
            <div className="registration-fields registration-fields--area">
              <label className={fieldClass("uf", "registration-field--select")}>
                <span>UF *</span>
                <select value={values.uf} onChange={(event) => updateValue("uf", event.target.value)} aria-label="UF">
                  <option value="">UF</option>
                  {brazilUfs.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
                {renderFieldError("uf")}
              </label>

              <label className={fieldClass("cidade")}>
                <span>Cidade *</span>
                <input
                  value={values.cidade}
                  onChange={(event) => updateValue("cidade", event.target.value.slice(0, 120))}
                  placeholder="Ex: São Paulo"
                  autoComplete="address-level2"
                />
                {renderFieldError("cidade")}
              </label>
            </div>
          </div>

          {isAutonomous ? (
            <div className="registration-info-block registration-info-block--success">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 12.5 4 4L18 8" />
              </svg>
              <div>
                <strong>Cadastro como corretor autônomo</strong>
                <p>
                  Como você selecionou "Autônomo" no passo anterior, não é necessário vincular imobiliária. Você poderá
                  fazer essa vinculação depois, caso queira.
                </p>
              </div>
            </div>
          ) : (
            <div className="registration-field-group">
              <p className="registration-field-group__title">IMOBILIÁRIA INFORMADA</p>
              <label className={fieldClass("imobiliaria_informada", "registration-field--full")}>
                <span>Imobiliária onde atua *</span>
                <input
                  value={values.imobiliaria_informada}
                  onChange={(event) => updateValue("imobiliaria_informada", event.target.value.slice(0, 220))}
                  placeholder="Ex: Imobiliária Central"
                  autoComplete="organization"
                />
                <span className="registration-field__hint">
                  Informe o nome da imobiliária onde você atua. Não é necessário que ela já esteja cadastrada na ONE.
                </span>
                {renderFieldError("imobiliaria_informada")}
              </label>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="registration-profile">
        <div className="registration-field-group">
          <p className="registration-field-group__title">CONTATO</p>
          <div className="registration-fields">
            <label className={fieldClass("whatsapp")}>
              <span>WhatsApp *</span>
              <input
                value={values.whatsapp}
                onChange={(event) => updateValue("whatsapp", formatPhone(event.target.value))}
                placeholder="(11) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
              />
              {renderFieldError("whatsapp")}
            </label>

            <label className={fieldClass("email")}>
              <span>E-mail *</span>
              <input
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value.slice(0, 255))}
                placeholder="exemplo@email.com"
                type="email"
                autoComplete="email"
              />
              {renderFieldError("email")}
            </label>
          </div>
        </div>

        <div className="registration-field-group">
          <p className="registration-field-group__title">
            PERFIL PROFISSIONAL <span>opcional</span>
          </p>
          <label className={fieldClass("perfil_profissional", "registration-field--full")}>
            <span>Conte um pouco sobre sua atuação</span>
            <textarea
              value={values.perfil_profissional}
              onChange={(event) => updateValue("perfil_profissional", event.target.value.slice(0, 500))}
              placeholder="Ex: Atuo há 8 anos com locações residenciais na zona sul de São Paulo, com foco em imóveis de alto padrão."
            />
            {renderFieldError("perfil_profissional")}
          </label>

          <fieldset className="registration-volume">
            <legend>Volume médio de indicações por mês</legend>
            <div className="registration-volume__options">
              {volumeOptions.map((option) => (
                <button
                  className={`registration-volume__option ${values.volume_indicacoes === option.value ? "is-selected" : ""}`}
                  key={option.value}
                  type="button"
                  onClick={() => updateValue("volume_indicacoes", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="registration-checks">
          <label className={`registration-check ${errors.aceite_lgpd ? "has-error" : ""}`}>
            <input
              checked={values.aceite_lgpd}
              onChange={(event) => updateValue("aceite_lgpd", event.target.checked)}
              type="checkbox"
            />
            <span>
              Declaro que as informações fornecidas são verdadeiras e autorizo a ONE Fiança Locatícia a utilizar meus dados
              para análise do cadastro, contato comercial e elaboração de proposta de parceria, conforme a{" "}
              <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">
                Política de Privacidade
              </a>
              . *
            </span>
          </label>
          {renderFieldError("aceite_lgpd")}

          <label className="registration-check">
            <input
              checked={values.opt_in_marketing}
              onChange={(event) => updateValue("opt_in_marketing", event.target.checked)}
              type="checkbox"
            />
            <span>Aceito receber comunicações da ONE Fiança Locatícia por WhatsApp, e-mail ou telefone.</span>
          </label>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`registration-modal registration-modal--broker ${isRecoveryPromptOpen ? "registration-modal--recovery" : ""}`}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          data-lenis-prevent
        >
          <button
            className="registration-modal__backdrop"
            type="button"
            aria-label={isRecoveryPromptOpen ? "Fechar aviso de cadastro em andamento" : "Fechar cadastro de corretor"}
            onClick={isRecoveryPromptOpen ? closeRecoveryPrompt : onClose}
          />

          <motion.section
            ref={sheetRef}
            className={`registration-modal__sheet ${isSuccess ? "registration-modal__sheet--success" : ""} ${isRecoveryPromptOpen ? "registration-modal__sheet--recovery" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 14 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              ref={modalRef}
              className={`registration-modal__main ${isRecoveryPromptOpen ? "registration-modal__main--recovery" : ""}`}
              tabIndex={-1}
            >
              {isRecoveryPromptOpen ? (
                <RecoveryPrompt
                  titleId={titleId}
                  onClose={closeRecoveryPrompt}
                  onRestart={restartSavedProgress}
                  onContinue={continueSavedProgress}
                />
              ) : !isSuccess ? (
                <>
                  <button className="registration-modal__close" type="button" onClick={onClose} aria-label="Fechar cadastro de corretor">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </button>

                  <Stepper currentStep={currentStep} completedStep={completedStep} onStepClick={goToStep} />

                  <AnimatePresence mode="wait">
                    <motion.div
                      className="registration-step"
                      key={currentStep}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                    >
                      <div className="registration-step__header">
                        <h2 id={titleId}>{stepCopy[currentStep as 1 | 2 | 3].title}</h2>
                        <p>{currentDescription}</p>
                      </div>

                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>

                  {errors.submit && <div className="registration-submit-error">{errors.submit}</div>}

                  <div className="registration-modal__footer">
                    {currentStep > 1 ? (
                      <button className="registration-button registration-button--secondary" type="button" onClick={goBack}>
                        <ArrowIcon direction="left" />
                        Voltar
                      </button>
                    ) : (
                      <span aria-hidden="true" />
                    )}

                    {currentStep < 3 ? (
                      <button className="registration-button registration-button--primary" type="button" onClick={advanceStep}>
                        Continuar
                        <ArrowIcon pulseKey={arrowPulse} />
                      </button>
                    ) : (
                      <button
                        ref={submitButtonRef}
                        className={`registration-button registration-button--primary ${isLoading ? "is-loading" : ""}`}
                        type="button"
                        disabled={isLoading || isExpanding || !values.aceite_lgpd}
                        onClick={submitForm}
                      >
                        {isLoading ? (
                          <>
                            <Spinner />
                            Enviando...
                          </>
                        ) : (
                          <>
                            Enviar cadastro
                            <ArrowIcon pulseKey={arrowPulse} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <BrokerSuccessScreen onClose={onClose} onReset={resetFlow} arrowPulse={arrowPulse} />
              )}
            </div>

            <AnimatePresence>
              {isExpanding && (
                <motion.div
                  className="registration-submit-expander"
                  initial={{
                    top: expanderBounds.top,
                    left: expanderBounds.left,
                    width: expanderBounds.width,
                    height: expanderBounds.height,
                    borderRadius: 18,
                    opacity: 1,
                  }}
                  animate={{
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: 22,
                    opacity: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.74, ease: [0.76, 0, 0.24, 1] }}
                  onAnimationComplete={finishExpansion}
                />
              )}
            </AnimatePresence>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function BrokerSuccessScreen({
  onClose,
  onReset,
  arrowPulse,
}: {
  onClose: () => void
  onReset: () => void
  arrowPulse: number
}) {
  const successSteps = [
    {
      title: "Análise do cadastro",
      description: "Verificamos os dados enviados pelo corretor.",
    },
    {
      title: "Contato da equipe",
      description: "Entraremos em contato por WhatsApp, e-mail ou telefone.",
    },
    {
      title: "Avanço da parceria",
      description: "Se estiver tudo certo, seguimos com a ativação e próximos alinhamentos.",
    },
  ]

  return (
    <motion.div
      className="registration-success"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="registration-success__hero">
        <SuccessMark />
        <div>
          <h2>Tudo certo</h2>
          <p>
            Seu cadastro foi enviado para análise. Em breve, nossa equipe entrará em contato para validar as informações e
            seguir com a parceria.
          </p>
        </div>
      </div>

      <div className="registration-success__next">
        <h3>Próximos passos</h3>
        <div className="registration-success__cards">
          {successSteps.map((step, index) => (
            <article className="registration-success__card" key={step.title}>
              <img
                src={[
                  "/icons/registration/analise-cadastro.svg",
                  "/icons/registration/whatsapp.svg",
                  "/icons/registration/avanco-parceria.svg",
                ][index]}
                alt=""
                aria-hidden="true"
              />
              <div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="registration-success__actions">
        <button className="registration-button registration-button--success-secondary" type="button" onClick={onClose}>
          <ArrowIcon direction="left" />
          Voltar ao site
        </button>
        <button className="registration-button registration-button--success-primary" type="button" onClick={onReset}>
          Cadastrar outro corretor
          <ArrowIcon pulseKey={arrowPulse} />
        </button>
      </div>
    </motion.div>
  )
}
