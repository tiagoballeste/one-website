"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

type RegistrationModalProps = {
  isOpen: boolean
  onClose: () => void
}

type CityActuation = {
  cidade: string
  uf: string
}

type TrackingValues = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term", string>>

type FormValues = {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  cepDraft: string
  endereco: string
  ufDraft: string
  cityDraft: string
  cidades_ufs_atuacao: CityActuation[]
  responsavel_principal: string
  cargo_responsavel: string
  whatsapp: string
  email: string
  site: string
  instagram: string
  media_locacoes_mes: number | null
  aceite_lgpd: boolean
  opt_in_marketing: boolean
}

type FormField = keyof FormValues | "submit"
type Errors = Partial<Record<FormField, string>>

type BrazilState = {
  id: number
  nome: string
  sigla: string
}

type BrazilCity = {
  nome: string
  codigo_ibge: string
}

type CepAddress = {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
}

type ProgressPayload = {
  values: FormValues
  currentStep: number
  completedStep: number
  savedAt: number
}

type BackendErrorResponse = {
  detail?: unknown
  message?: string
  error?: string
  field?: FormField
}

const PROGRESS_KEY = "cadastro_imobiliaria_progresso"
const PROGRESS_TTL = 24 * 60 * 60 * 1000
const TOKEN_KEY = "cadastro_imobiliaria_token"
const UTM_STORAGE_KEY = "cadastro_imobiliaria_utm"

let cachedBrazilStates: BrazilState[] | null = null
const cachedBrazilCitiesByUf = new Map<string, BrazilCity[]>()

const initialValues: FormValues = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  cepDraft: "",
  endereco: "",
  ufDraft: "",
  cityDraft: "",
  cidades_ufs_atuacao: [],
  responsavel_principal: "",
  cargo_responsavel: "",
  whatsapp: "",
  email: "",
  site: "",
  instagram: "",
  media_locacoes_mes: null,
  aceite_lgpd: false,
  opt_in_marketing: false,
}

const steps = [
  { number: 1, label: "Dados" },
  { number: 2, label: "Contato" },
  { number: 3, label: "Perfil" },
]

const stepCopy = {
  1: {
    title: "Dados da imobiliária",
    description: "Comece com as informações básicas da empresa.",
    badge: "STEP 1 · DADOS DA IMOBILIÁRIA",
  },
  2: {
    title: "Contato e responsável",
    description: "Informe canais de contato e quem será o ponto focal da parceria.",
    badge: "STEP 2 · CONTATO E RESPONSÁVEL",
  },
  3: {
    title: "Perfil e envio",
    description: "Última etapa. Ajuda nossa equipe a entender melhor o perfil da imobiliária.",
    badge: "STEP 3 · PERFIL E ENVIO",
  },
}

const volumeOptions = [
  { label: "Até 5", value: 3 },
  { label: "6 a 15", value: 10 },
  { label: "16 a 50", value: 33 },
  { label: "Mais de 50", value: 75 },
]

const onlyDigits = (value: string) => value.replace(/\D/g, "")

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ")

const stripAccents = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const formatCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8)
  return digits.replace(/^(\d{5})(\d)/, "$1-$2")
}

const toDisplayCity = (value: string) =>
  value
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s|-|')(\p{L})/gu, (_, prefix: string, letter: string) => `${prefix}${letter.toLocaleUpperCase("pt-BR")}`)

const isValidCnpj = (value: string) => {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false

  const calculateDigit = (length: number) => {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const sum = weights.reduce((total, weight, index) => total + Number(cnpj[index]) * weight, 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  return calculateDigit(12) === Number(cnpj[12]) && calculateDigit(13) === Number(cnpj[13])
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

const normalizeUrl = (value: string) => {
  const url = value.trim()
  if (!url) return ""
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

const normalizeInstagram = (value: string) => value.trim().replace(/^@+/, "")

const fetchJson = async <T,>(url: string, signal: AbortSignal): Promise<T> => {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  })
  const contentType = response.headers.get("content-type") ?? ""

  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error("A fonte pública retornou uma resposta inválida.")
  }

  return response.json() as Promise<T>
}

const getProgress = (): ProgressPayload | null => {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ProgressPayload
    if (!parsed.savedAt || Date.now() - parsed.savedAt > PROGRESS_TTL) {
      window.localStorage.removeItem(PROGRESS_KEY)
      return null
    }
    return parsed
  } catch {
    window.localStorage.removeItem(PROGRESS_KEY)
    return null
  }
}

const extractBackendMessage = (data: BackendErrorResponse) => {
  if (data.message || data.error) return data.message || data.error

  if (Array.isArray(data.detail)) {
    const firstDetail = data.detail[0] as { msg?: string; loc?: unknown[] } | undefined
    if (firstDetail?.msg) return firstDetail.msg
  }

  if (typeof data.detail === "string") return data.detail

  return ""
}

const extractBackendField = (data: BackendErrorResponse): FormField | undefined => {
  if (data.field) return data.field

  if (Array.isArray(data.detail)) {
    const firstDetail = data.detail[0] as { loc?: unknown[] } | undefined
    const field = firstDetail?.loc
      ?.slice()
      .reverse()
      .find((item) => typeof item === "string")
    if (typeof field === "string" && field in initialValues) return field as FormField
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

function RecoveryClockIcon() {
  return (
    <svg className="registration-recovery__clock" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="21" />
      <path d="M32 20v14h12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 12.5 4 4L18 8" />
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
    <ol className="registration-stepper" aria-label="Progresso do cadastro">
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

export function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedStep, setCompletedStep] = useState(0)
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<Errors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)
  const [arrowPulse, setArrowPulse] = useState(0)
  const [expanderBounds, setExpanderBounds] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [brazilStates, setBrazilStates] = useState<BrazilState[]>([])
  const [brazilCities, setBrazilCities] = useState<BrazilCity[]>([])
  const [isStatesLoading, setIsStatesLoading] = useState(false)
  const [isCitiesLoading, setIsCitiesLoading] = useState(false)
  const [isCepLoading, setIsCepLoading] = useState(false)
  const [statesError, setStatesError] = useState("")
  const [citiesError, setCitiesError] = useState("")
  const [cepMessage, setCepMessage] = useState("")
  const [tracking, setTracking] = useState<TrackingValues>({})
  const [recoveryProgress, setRecoveryProgress] = useState<ProgressPayload | null>(null)
  const [isRecoveryPromptOpen, setIsRecoveryPromptOpen] = useState(false)
  const progressPromptedRef = useRef(false)
  const lastAutofilledAddressRef = useRef("")
  const modalRef = useRef<HTMLDivElement | null>(null)
  const sheetRef = useRef<HTMLElement | null>(null)
  const submitButtonRef = useRef<HTMLButtonElement | null>(null)
  const titleId = useId()
  const cityListId = useId()

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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
  }, [isOpen, onClose])

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
    if (!isOpen) return
    if (cachedBrazilStates) {
      setBrazilStates(cachedBrazilStates)
      return
    }

    const controller = new AbortController()

    const fetchStates = async () => {
      setIsStatesLoading(true)
      setStatesError("")

      try {
        const data = await fetchJson<BrazilState[]>(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
          controller.signal,
        ).catch(() => fetchJson<BrazilState[]>("https://brasilapi.com.br/api/ibge/uf/v1", controller.signal))
        const orderedStates = data
          .map((state) => ({ id: state.id, nome: state.nome, sigla: state.sigla }))
          .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))

        cachedBrazilStates = orderedStates
        setBrazilStates(orderedStates)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setStatesError("Não foi possível carregar os estados. Tente novamente.")
      } finally {
        if (!controller.signal.aborted) setIsStatesLoading(false)
      }
    }

    fetchStates()

    return () => controller.abort()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !values.ufDraft) {
      setBrazilCities([])
      setCitiesError("")
      setIsCitiesLoading(false)
      return
    }

    const uf = values.ufDraft
    const cachedCities = cachedBrazilCitiesByUf.get(uf)
    if (cachedCities) {
      setBrazilCities(cachedCities)
      setCitiesError("")
      return
    }

    const controller = new AbortController()

    const fetchCities = async () => {
      setIsCitiesLoading(true)
      setCitiesError("")

      try {
        const data = await fetchJson<BrazilCity[]>(
          `https://brasilapi.com.br/api/ibge/municipios/v1/${uf}?providers=dados-abertos-br,gov,wikipedia`,
          controller.signal,
        )
        const orderedCities = data
          .map((city) => ({ ...city, nome: toDisplayCity(city.nome) }))
          .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))

        cachedBrazilCitiesByUf.set(uf, orderedCities)
        setBrazilCities(orderedCities)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setBrazilCities([])
        setCitiesError("Não foi possível carregar as cidades. Você ainda pode digitar manualmente.")
      } finally {
        if (!controller.signal.aborted) setIsCitiesLoading(false)
      }
    }

    fetchCities()

    return () => controller.abort()
  }, [isOpen, values.ufDraft])

  useEffect(() => {
    if (!isOpen) return

    const cep = onlyDigits(values.cepDraft)
    if (cep.length < 8) {
      setCepMessage("")
      setIsCepLoading(false)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setIsCepLoading(true)
      setCepMessage("")

      try {
        const data = await fetchJson<CepAddress>(`https://brasilapi.com.br/api/cep/v2/${cep}`, controller.signal)
        const addressParts = [data.street, data.neighborhood, `${data.city}/${data.state}`].filter(Boolean)
        const address = addressParts.join(", ")

        setValues((current) => {
          const currentAddress = normalizeText(current.endereco)
          const canAutofill = !currentAddress || currentAddress === lastAutofilledAddressRef.current

          if (!canAutofill) return current

          lastAutofilledAddressRef.current = address
          return { ...current, endereco: address }
        })
        setCepMessage(address ? "Endereço sugerido pelo CEP. Você pode editar antes de continuar." : "")
        setErrors((current) => ({ ...current, endereco: undefined, submit: undefined }))
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setCepMessage("Não encontramos esse CEP. Preencha o endereço manualmente.")
      } finally {
        if (!controller.signal.aborted) setIsCepLoading(false)
      }
    }, 420)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [isOpen, values.cepDraft])

  useEffect(() => {
    if (!isOpen || isSuccess || isRecoveryPromptOpen) return
    const hasProgress =
      Object.entries(values).some(([key, value]) => {
        if (key === "aceite_lgpd" || key === "opt_in_marketing") return Boolean(value)
        if (Array.isArray(value)) return value.length > 0
        return typeof value === "string" ? value.trim().length > 0 : value !== null
      }) || currentStep > 1

    if (!hasProgress) return

    const payload: ProgressPayload = {
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

  const citySuggestions = useMemo(() => {
    const search = stripAccents(values.cityDraft).toLowerCase()
    if (!values.ufDraft || !brazilCities.length) return []
    if (!search) return brazilCities.slice(0, 12)

    return brazilCities
      .filter((city) => stripAccents(city.nome).toLowerCase().includes(search))
      .slice(0, 12)
  }, [brazilCities, values.cityDraft, values.ufDraft])

  const updateValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined }))
  }

  const addCity = () => {
    const uf = values.ufDraft
    const draftCity = normalizeText(values.cityDraft)
    const matchedCity = brazilCities.find(
      (city) => stripAccents(city.nome).toLowerCase() === stripAccents(draftCity).toLowerCase(),
    )
    const cidade = matchedCity?.nome ?? toDisplayCity(draftCity)

    if (!uf || !cidade) {
      setErrors((current) => ({
        ...current,
        cidades_ufs_atuacao: !uf ? "Selecione a UF e informe a cidade." : "Informe a cidade de atuação.",
      }))
      return
    }

    const alreadyAdded = values.cidades_ufs_atuacao.some(
      (item) => item.uf === uf && stripAccents(item.cidade).toLowerCase() === stripAccents(cidade).toLowerCase(),
    )

    if (alreadyAdded) {
      setErrors((current) => ({ ...current, cidades_ufs_atuacao: "Esta cidade já foi adicionada." }))
      return
    }

    setValues((current) => ({
      ...current,
      cityDraft: "",
      cidades_ufs_atuacao: [...current.cidades_ufs_atuacao, { cidade, uf }],
    }))
    setErrors((current) => ({ ...current, cidades_ufs_atuacao: undefined }))
  }

  const removeCity = (city: CityActuation) => {
    setValues((current) => ({
      ...current,
      cidades_ufs_atuacao: current.cidades_ufs_atuacao.filter(
        (item) => !(item.cidade === city.cidade && item.uf === city.uf),
      ),
    }))
  }

  const validateStep = (step = currentStep) => {
    const nextErrors: Errors = {}

    if (step === 1) {
      const razao = normalizeText(values.razao_social)
      const fantasia = normalizeText(values.nome_fantasia)
      if (razao.length < 2 || razao.length > 220) nextErrors.razao_social = "Informe a razão social com 2 a 220 caracteres."
      if (fantasia.length < 2 || fantasia.length > 220) nextErrors.nome_fantasia = "Informe o nome fantasia com 2 a 220 caracteres."
      if (!isValidCnpj(values.cnpj)) nextErrors.cnpj = "Informe um CNPJ válido."
      if (normalizeText(values.endereco).length < 5) nextErrors.endereco = "Informe um endereço com pelo menos 5 caracteres."
      if (!values.cidades_ufs_atuacao.length) nextErrors.cidades_ufs_atuacao = "Adicione pelo menos uma cidade de atuação."
    }

    if (step === 2) {
      const responsavel = normalizeText(values.responsavel_principal)
      const cargo = normalizeText(values.cargo_responsavel)
      const whatsappDigits = onlyDigits(values.whatsapp)
      if (responsavel.length < 2 || responsavel.length > 200) nextErrors.responsavel_principal = "Informe o nome completo."
      if (cargo.length < 2 || cargo.length > 120) nextErrors.cargo_responsavel = "Informe o cargo."
      if (whatsappDigits.length < 10 || whatsappDigits.length > 13) nextErrors.whatsapp = "Informe um WhatsApp válido."
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 255) nextErrors.email = "Informe um e-mail válido."
      if (values.site && normalizeUrl(values.site).length > 300) nextErrors.site = "Informe um site com até 300 caracteres."
      if (values.instagram && normalizeInstagram(values.instagram).length > 120) nextErrors.instagram = "Informe um Instagram com até 120 caracteres."
    }

    if (step === 3) {
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
    setValues(initialValues)
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
    const payload = {
      razao_social: normalizeText(values.razao_social),
      nome_fantasia: normalizeText(values.nome_fantasia),
      cnpj: onlyDigits(values.cnpj),
      endereco: normalizeText(values.endereco),
      cidades_ufs_atuacao: values.cidades_ufs_atuacao,
      responsavel_principal: normalizeText(values.responsavel_principal),
      cargo_responsavel: normalizeText(values.cargo_responsavel),
      whatsapp: normalizeWhatsapp(values.whatsapp),
      email: values.email.trim(),
      site: normalizeUrl(values.site),
      instagram: normalizeInstagram(values.instagram),
      media_locacoes_mes: values.media_locacoes_mes,
      aceite_lgpd: values.aceite_lgpd,
      opt_in_marketing: values.opt_in_marketing,
      origem: "site",
      origem_nome: "modal_imobiliaria",
      ...tracking,
    }

    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== "" && value !== null && value !== undefined),
    )
  }

  const showSuccessExpansion = () => {
    const sheetRect = sheetRef.current?.getBoundingClientRect()
    const buttonRect = submitButtonRef.current?.getBoundingClientRect()

    if (sheetRect && buttonRect) {
      setExpanderBounds({
        top: buttonRect.top - sheetRect.top,
        left: buttonRect.left - sheetRect.left,
        width: buttonRect.width,
        height: buttonRect.height,
      })
    }

    setIsExpanding(true)
  }

  const submitForm = async () => {
    setArrowPulse((current) => current + 1)
    if (!validateStep(3) || isLoading || isExpanding) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch("/api/imobiliarias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(buildPayload()),
      })

      const data = (await response.json().catch(() => ({}))) as BackendErrorResponse & {
        id?: string
        token_cadastro?: string
      }

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Esta imobiliária já está cadastrada")
        }

        const backendMessage = extractBackendMessage(data)
        const backendField = extractBackendField(data)

        if ((response.status === 400 || response.status === 422) && backendField) {
          setErrors({ [backendField]: backendMessage || "Revise este campo." })
          return
        }

        throw new Error(response.status >= 500 ? backendMessage || "Erro ao enviar. Tente novamente em alguns instantes." : backendMessage || "Não foi possível enviar o cadastro.")
      }

      if (data.token_cadastro) {
        window.localStorage.setItem(TOKEN_KEY, data.token_cadastro)
      }

      window.localStorage.removeItem(PROGRESS_KEY)
      setCompletedStep(3)
      showSuccessExpansion()
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Erro ao enviar. Tente novamente em alguns instantes." })
    } finally {
      setIsLoading(false)
    }
  }

  const finishExpansion = () => {
    setIsSuccess(true)
    setIsExpanding(false)
  }

  const renderFieldError = (key: FormField) =>
    errors[key] ? <span className="registration-field__error">{errors[key]}</span> : null

  const fieldClass = (key: FormField, extra = "") => `registration-field ${extra} ${errors[key] ? "has-error" : ""}`.trim()

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <div className="registration-fields registration-fields--company">
          <label className={fieldClass("razao_social")}>
            <span>Razão social *</span>
            <input
              value={values.razao_social}
              onChange={(event) => updateValue("razao_social", event.target.value.slice(0, 220))}
              placeholder="Ex: Imobiliária Central Ltda"
              autoComplete="organization"
            />
            {renderFieldError("razao_social")}
          </label>

          <label className={fieldClass("nome_fantasia")}>
            <span>Nome fantasia *</span>
            <input
              value={values.nome_fantasia}
              onChange={(event) => updateValue("nome_fantasia", event.target.value.slice(0, 220))}
              placeholder="Ex: Imobiliária Central"
              autoComplete="organization"
            />
            {renderFieldError("nome_fantasia")}
          </label>

          <label className={fieldClass("cnpj")}>
            <span>CNPJ *</span>
            <input
              value={values.cnpj}
              onChange={(event) => updateValue("cnpj", formatCnpj(event.target.value))}
              placeholder="00.000.000/0000-00"
              inputMode="numeric"
            />
            {renderFieldError("cnpj")}
          </label>

          <label className="registration-field">
            <span>CEP</span>
            <input
              value={values.cepDraft}
              onChange={(event) => updateValue("cepDraft", formatCep(event.target.value))}
              placeholder="00000-000"
              inputMode="numeric"
              autoComplete="postal-code"
            />
            <span className="registration-field__hint">
              {isCepLoading ? "Buscando endereço..." : cepMessage || "Opcional. Use para preencher o endereço automaticamente."}
            </span>
          </label>

          <label className={fieldClass("endereco")}>
            <span>Endereço *</span>
            <input
              value={values.endereco}
              onChange={(event) => updateValue("endereco", event.target.value)}
              placeholder="Rua, número, bairro, cidade"
              autoComplete="street-address"
            />
            {renderFieldError("endereco")}
          </label>

          <div className={`registration-city-manager ${errors.cidades_ufs_atuacao ? "has-error" : ""}`}>
            <div className="registration-city-manager__title">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s7-5.1 7-11a7 7 0 0 0-14 0c0 5.9 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </svg>
              <span>Cidades de atuação *</span>
            </div>

            <div className="registration-city-manager__inputs">
              <label className="registration-field registration-field--select">
                <span className="sr-only">UF</span>
                <select
                  value={values.ufDraft}
                  onChange={(event) => {
                    updateValue("ufDraft", event.target.value)
                    updateValue("cityDraft", "")
                  }}
                  disabled={isStatesLoading}
                  aria-label="UF"
                >
                  <option value="">{isStatesLoading ? "..." : "UF"}</option>
                  {brazilStates.map((state) => (
                    <option key={state.id} value={state.sigla}>
                      {state.sigla}
                    </option>
                  ))}
                </select>
              </label>

              <label className="registration-field registration-city-manager__city">
                <span className="sr-only">Cidade</span>
                <input
                  value={values.cityDraft}
                  onChange={(event) => updateValue("cityDraft", event.target.value)}
                  list={values.ufDraft ? cityListId : undefined}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      addCity()
                    }
                  }}
                  placeholder={
                    !values.ufDraft ? "Selecione a UF primeiro" : isCitiesLoading ? "Carregando cidades..." : "Digite a cidade..."
                  }
                  disabled={!values.ufDraft}
                />
                {values.ufDraft && (
                  <datalist id={cityListId}>
                    {citySuggestions.map((city) => (
                      <option key={`${city.codigo_ibge}-${city.nome}`} value={city.nome} />
                    ))}
                  </datalist>
                )}
              </label>

              <button className="registration-city-manager__add" type="button" onClick={addCity} disabled={!values.ufDraft}>
                + Adicionar
              </button>
            </div>

            {values.cidades_ufs_atuacao.length > 0 && (
              <div className="registration-city-manager__chips" aria-label="Cidades adicionadas">
                {values.cidades_ufs_atuacao.map((city) => (
                  <button
                    className="registration-chip"
                    key={`${city.cidade}-${city.uf}`}
                    type="button"
                    onClick={() => removeCity(city)}
                    aria-label={`Remover ${city.cidade} - ${city.uf}`}
                  >
                    {city.cidade} - {city.uf}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}

            <span className="registration-field__hint">
              {values.cidades_ufs_atuacao.length} {values.cidades_ufs_atuacao.length === 1 ? "cidade adicionada" : "cidades adicionadas"}. Adicione pelo menos 1.
            </span>
            {statesError && <span className="registration-field__hint">{statesError}</span>}
            {citiesError && <span className="registration-field__hint">{citiesError}</span>}
            {renderFieldError("cidades_ufs_atuacao")}
          </div>
        </div>
      )
    }

    if (currentStep === 2) {
      return (
        <div className="registration-fields registration-fields--grouped">
          <div className="registration-field-group">
            <p className="registration-field-group__title">RESPONSÁVEL</p>
            <div className="registration-fields">
              <label className={fieldClass("responsavel_principal")}>
                <span>Nome completo *</span>
                <input
                  value={values.responsavel_principal}
                  onChange={(event) => updateValue("responsavel_principal", event.target.value.slice(0, 200))}
                  placeholder="Ex: João da Silva"
                  autoComplete="name"
                />
                {renderFieldError("responsavel_principal")}
              </label>

              <label className={fieldClass("cargo_responsavel")}>
                <span>Cargo *</span>
                <input
                  value={values.cargo_responsavel}
                  onChange={(event) => updateValue("cargo_responsavel", event.target.value.slice(0, 120))}
                  placeholder="Ex: Diretor Comercial"
                />
                {renderFieldError("cargo_responsavel")}
              </label>
            </div>
          </div>

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
                  placeholder="contato@imobiliaria.com.br"
                  type="email"
                  autoComplete="email"
                />
                {renderFieldError("email")}
              </label>
            </div>
          </div>

          <div className="registration-field-group">
            <p className="registration-field-group__title">
              PRESENÇA DIGITAL <span>opcional</span>
            </p>
            <div className="registration-fields">
              <label className={fieldClass("site")}>
                <span>Site</span>
                <input
                  value={values.site}
                  onChange={(event) => updateValue("site", event.target.value.slice(0, 300))}
                  onBlur={() => updateValue("site", normalizeUrl(values.site))}
                  placeholder="https://imobiliaria.com.br"
                  inputMode="url"
                />
                {renderFieldError("site")}
              </label>

              <label className={fieldClass("instagram")}>
                <span>Instagram</span>
                <input
                  value={values.instagram}
                  onChange={(event) => updateValue("instagram", event.target.value.slice(0, 120))}
                  onBlur={() => updateValue("instagram", normalizeInstagram(values.instagram))}
                  placeholder="@imobiliaria"
                />
                {renderFieldError("instagram")}
              </label>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="registration-profile">
        <fieldset className="registration-volume">
          <legend>
            Média de locações por mês <span>opcional</span>
          </legend>
          <div className="registration-volume__options">
            {volumeOptions.map((option) => (
              <button
                className={`registration-volume__option ${values.media_locacoes_mes === option.value ? "is-selected" : ""}`}
                key={option.value}
                type="button"
                onClick={() => updateValue("media_locacoes_mes", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="registration-field__hint">Será enviado como número médio.</span>
        </fieldset>

        <div className="registration-checks">
          <label className={`registration-check ${errors.aceite_lgpd ? "has-error" : ""}`}>
            <input
              checked={values.aceite_lgpd}
              onChange={(event) => updateValue("aceite_lgpd", event.target.checked)}
              type="checkbox"
            />
            <span>
              Declaro que as informações fornecidas são verdadeiras e autorizo a ONE Fiança Locatícia a utilizar meus dados para análise do cadastro, contato comercial e elaboração de proposta de parceria, conforme a{" "}
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
          className={`registration-modal ${isRecoveryPromptOpen ? "registration-modal--recovery" : ""}`}
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
            aria-label={isRecoveryPromptOpen ? "Fechar aviso de cadastro em andamento" : "Fechar cadastro"}
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
                  <button className="registration-modal__close" type="button" onClick={onClose} aria-label="Fechar cadastro">
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
                        <p>{stepCopy[currentStep as 1 | 2 | 3].description}</p>
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
                <SuccessScreen onClose={onClose} onReset={resetFlow} arrowPulse={arrowPulse} />
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

function SuccessScreen({
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
      description: "Verificamos os dados enviados pela imobiliária.",
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
            Seu cadastro foi enviado para análise. Em breve, nossa equipe entrará em contato para validar as informações
            e seguir com a parceria.
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
          Cadastrar outra imobiliária
          <ArrowIcon pulseKey={arrowPulse} />
        </button>
      </div>
    </motion.div>
  )
}
