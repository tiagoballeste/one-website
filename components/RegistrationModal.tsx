"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"

type RegistrationModalProps = {
  isOpen: boolean
  onClose: () => void
}

type FormValues = {
  agencyName: string
  cnpj: string
  state: string
  city: string
  contactName: string
  contactRole: string
  whatsapp: string
  email: string
  volume: string
  authorization: boolean
  communications: boolean
}

type Errors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  agencyName: "",
  cnpj: "",
  state: "",
  city: "",
  contactName: "",
  contactRole: "",
  whatsapp: "",
  email: "",
  volume: "Até 5",
  authorization: false,
  communications: false,
}

const steps = [
  { number: 1, label: "Dados da imobiliária" },
  { number: 2, label: "Responsável" },
  { number: 3, label: "Perfil e envio" },
]

const states = [
  { value: "SP", label: "São Paulo", cities: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto"] },
  { value: "RJ", label: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói", "Petrópolis", "Macaé"] },
  { value: "MG", label: "Minas Gerais", cities: ["Belo Horizonte", "Uberlândia", "Juiz de Fora", "Nova Lima"] },
  { value: "PR", label: "Paraná", cities: ["Curitiba", "Londrina", "Maringá", "Cascavel"] },
  { value: "SC", label: "Santa Catarina", cities: ["Florianópolis", "Joinville", "Blumenau", "Itajaí"] },
  { value: "RS", label: "Rio Grande do Sul", cities: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas"] },
]

const volumeOptions = ["Até 5", "6 a 15", "31 a 50", "Mais de 50"]

const stepCopy = {
  1: {
    title: "Dados da imobiliária",
    description: "Primeiro, informe os dados básicos da imobiliária.",
  },
  2: {
    title: "Responsável pelo cadastro",
    description: "Agora, informe quem será o contato responsável pela parceria.",
  },
  3: {
    title: "Perfil e envio",
    description: "Para finalizar, informe o volume médio de locações para entendermos melhor o perfil da imobiliária.",
  },
}

const onlyDigits = (value: string) => value.replace(/\D/g, "")

const formatCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
  }
  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
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
      {direction === "left" ? (
        <path d="M19 12H5m6-6-6 6 6 6" />
      ) : (
        <path d="M5 12h14m-6-6 6 6-6 6" />
      )}
    </motion.svg>
  )
}

function Spinner() {
  return <span className="registration-spinner" aria-hidden="true" />
}

function SuccessMark() {
  return (
    <motion.svg
      className="registration-success__mark"
      viewBox="0 0 120 120"
      aria-hidden="true"
      initial={{ scale: 0.88, rotate: -4, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
    >
      <path d="M60 8 70.5 18.2 85 14.8l5.3 13.9 14.5 3.3-1.6 14.8 11 10-8.2 12.4 4.2 14.3-13.4 6.5-3.2 14.5-14.8-1.5-10.2 10.8L56.3 106 42 110.2l-6.5-13.4-14.5-3.2 1.5-14.8L11.8 68.6 19.9 56 15.8 41.8l13.4-6.5 3.2-14.5 14.8 1.5L57.4 11.5 60 8Z" />
      <path className="registration-success__check" d="m36 61 16 16 34-38" />
    </motion.svg>
  )
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="registration-stepper" aria-label="Progresso do cadastro">
      {steps.map((step, index) => {
        const isActive = step.number <= currentStep
        return (
          <li className="registration-stepper__item" key={step.number}>
            <span className={`registration-stepper__dot ${isActive ? "is-active" : ""}`}>{step.number}</span>
            <span className={`registration-stepper__label ${isActive ? "is-active" : ""}`}>{step.label}</span>
            {index < steps.length - 1 && <span className="registration-stepper__line" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

export function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<Errors>({})
  const [observation, setObservation] = useState("")
  const [observationDraft, setObservationDraft] = useState("")
  const [isObservationOpen, setIsObservationOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)
  const [arrowPulse, setArrowPulse] = useState(0)
  const [expanderBounds, setExpanderBounds] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const modalRef = useRef<HTMLDivElement | null>(null)
  const sheetRef = useRef<HTMLElement | null>(null)
  const submitButtonRef = useRef<HTMLButtonElement | null>(null)

  const selectedState = useMemo(() => states.find((state) => state.value === values.state), [values.state])
  const availableCities = selectedState?.cities ?? []

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isObservationOpen) {
          setIsObservationOpen(false)
          return
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
  }, [isOpen, isObservationOpen, onClose])

  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0
  }, [currentStep, isSuccess])

  const updateValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validateStep = (step = currentStep) => {
    const nextErrors: Errors = {}

    if (step === 1) {
      if (!values.agencyName.trim()) nextErrors.agencyName = "Informe o nome da imobiliária."
      if (onlyDigits(values.cnpj).length !== 14) nextErrors.cnpj = "Informe um CNPJ válido."
      if (!values.state) nextErrors.state = "Selecione o estado."
      if (!values.city) nextErrors.city = "Selecione a cidade."
    }

    if (step === 2) {
      if (!values.contactName.trim()) nextErrors.contactName = "Informe o nome do responsável."
      if (!values.contactRole.trim()) nextErrors.contactRole = "Informe o cargo do responsável."
      if (onlyDigits(values.whatsapp).length < 10) nextErrors.whatsapp = "Informe um WhatsApp válido."
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Informe um e-mail válido."
    }

    if (step === 3) {
      if (!values.volume) nextErrors.volume = "Selecione uma média de locações."
      if (!values.authorization) nextErrors.authorization = "A autorização é obrigatória para enviar."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const advanceStep = () => {
    setArrowPulse((current) => current + 1)
    if (!validateStep()) return
    setCurrentStep((step) => Math.min(3, step + 1))
  }

  const goBack = () => {
    setCurrentStep((step) => Math.max(1, step - 1))
    setErrors({})
  }

  const resetFlow = () => {
    setArrowPulse((current) => current + 1)
    setValues(initialValues)
    setErrors({})
    setObservation("")
    setObservationDraft("")
    setCurrentStep(1)
    setIsSuccess(false)
    setIsLoading(false)
    setIsExpanding(false)
  }

  const submitForm = () => {
    setArrowPulse((current) => current + 1)
    if (!validateStep(3) || isLoading || isExpanding) return

    setIsLoading(true)

    window.setTimeout(() => {
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
      setIsLoading(false)
    }, 720)
  }

  const finishExpansion = () => {
    setIsSuccess(true)
    setIsExpanding(false)
  }

  const closeObservation = () => {
    setObservationDraft(observation)
    setIsObservationOpen(false)
  }

  const saveObservation = () => {
    setObservation(observationDraft)
    setIsObservationOpen(false)
  }

  const renderFieldError = (key: keyof FormValues) =>
    errors[key] ? <span className="registration-field__error">{errors[key]}</span> : null

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <div className="registration-fields">
          <label className="registration-field">
            <span>Dados da imobiliária</span>
            <input
              value={values.agencyName}
              onChange={(event) => updateValue("agencyName", event.target.value)}
              placeholder="Ex: Imobiliária Central"
              autoComplete="organization"
            />
            {renderFieldError("agencyName")}
          </label>

          <label className="registration-field">
            <span>CNPJ</span>
            <input
              value={values.cnpj}
              onChange={(event) => updateValue("cnpj", formatCnpj(event.target.value))}
              placeholder="00.000.000/0000-00"
              inputMode="numeric"
            />
            {renderFieldError("cnpj")}
          </label>

          <label className="registration-field registration-field--select">
            <span>Estado</span>
            <select
              value={values.state}
              onChange={(event) => {
                updateValue("state", event.target.value)
                updateValue("city", "")
              }}
            >
              <option value="">Selecione o estado</option>
              {states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            {renderFieldError("state")}
          </label>

          <label className="registration-field registration-field--select">
            <span>Cidade</span>
            <select
              value={values.city}
              onChange={(event) => updateValue("city", event.target.value)}
              disabled={!values.state}
            >
              <option value="">{values.state ? "Selecione a cidade" : "Selecione o estado primeiro"}</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {renderFieldError("city")}
          </label>
        </div>
      )
    }

    if (currentStep === 2) {
      return (
        <div className="registration-fields">
          <label className="registration-field">
            <span>Nome do responsável</span>
            <input
              value={values.contactName}
              onChange={(event) => updateValue("contactName", event.target.value)}
              placeholder="Ex: João da Silva"
              autoComplete="name"
            />
            {renderFieldError("contactName")}
          </label>

          <label className="registration-field">
            <span>Cargo do responsável</span>
            <input
              value={values.contactRole}
              onChange={(event) => updateValue("contactRole", event.target.value)}
              placeholder="Ex: Diretor Comercial"
            />
            {renderFieldError("contactRole")}
          </label>

          <label className="registration-field">
            <span>WhatsApp</span>
            <input
              value={values.whatsapp}
              onChange={(event) => updateValue("whatsapp", formatPhone(event.target.value))}
              placeholder="(11) 99999-9999"
              inputMode="tel"
              autoComplete="tel"
            />
            {renderFieldError("whatsapp")}
          </label>

          <label className="registration-field">
            <span>E-mail profissional</span>
            <input
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              placeholder="exemplo@imobiliaria.com.br"
              type="email"
              autoComplete="email"
            />
            {renderFieldError("email")}
          </label>
        </div>
      )
    }

    return (
      <div className="registration-profile">
        <fieldset className="registration-volume">
          <legend>Média de locações por mês</legend>
          <div className="registration-volume__options">
            {volumeOptions.map((option) => (
              <button
                className={`registration-volume__option ${values.volume === option ? "is-selected" : ""}`}
                key={option}
                type="button"
                onClick={() => updateValue("volume", option)}
              >
                {option}
              </button>
            ))}
          </div>
          {renderFieldError("volume")}
        </fieldset>

        <button
          className="registration-observation-trigger"
          type="button"
          onClick={() => {
            setObservationDraft(observation)
            setIsObservationOpen(true)
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h16M5 16.5V19h2.5L18.3 8.2 15.8 5.7 5 16.5Zm11.2-12.2 2.5 2.5" />
          </svg>
          {observation ? "Editar observação para a equipe" : "Adicionar observação para a equipe"}
        </button>

        <label className="registration-check">
          <input
            checked={values.authorization}
            onChange={(event) => updateValue("authorization", event.target.checked)}
            type="checkbox"
          />
          <span>
            Declaro que as informações fornecidas são verdadeiras e autorizo a ONE Fiança Locatícia a
            utilizar meus dados para análise do cadastro, contato comercial e elaboração de proposta de
            parceria, conforme a Política de Privacidade.
          </span>
        </label>
        {renderFieldError("authorization")}

        <label className="registration-check">
          <input
            checked={values.communications}
            onChange={(event) => updateValue("communications", event.target.checked)}
            type="checkbox"
          />
          <span>Aceito receber comunicações da ONE Fiança Locatícia por WhatsApp, e-mail ou telefone.</span>
        </label>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="registration-modal"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          data-lenis-prevent
        >
          <button className="registration-modal__backdrop" type="button" aria-label="Fechar cadastro" onClick={onClose} />

          <motion.section
            ref={sheetRef}
            className={`registration-modal__sheet ${isSuccess ? "registration-modal__sheet--success" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 14 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              ref={modalRef}
              className={`registration-modal__main ${isObservationOpen ? "registration-modal__main--blurred" : ""}`}
              tabIndex={-1}
            >
              {!isSuccess ? (
                <>
                  <button className="registration-modal__close" type="button" onClick={onClose} aria-label="Fechar cadastro">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </button>

                  <Stepper currentStep={currentStep} />

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
                        <h2 id="registration-title">{stepCopy[currentStep as 1 | 2 | 3].title}</h2>
                        <p>{stepCopy[currentStep as 1 | 2 | 3].description}</p>
                      </div>

                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>

                  <div className="registration-modal__footer">
                    {currentStep > 1 ? (
                      <button className="registration-button registration-button--secondary" type="button" onClick={goBack}>
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
                        disabled={isLoading || isExpanding}
                        onClick={submitForm}
                      >
                        {isLoading ? (
                          <Spinner />
                        ) : (
                          <>
                            Enviar cadastro da imobiliária
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
              {isObservationOpen && (
                <motion.div
                  className="registration-observation-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="observation-title"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button className="registration-observation-modal__close" type="button" onClick={closeObservation} aria-label="Fechar observações">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </button>
                  <h3 id="observation-title">Adicionar observações</h3>
                  <textarea
                    value={observationDraft}
                    onChange={(event) => setObservationDraft(event.target.value)}
                    placeholder="Escreva aqui..."
                    autoFocus
                  />
                  <button className="registration-observation-modal__confirm" type="button" onClick={saveObservation} aria-label="Salvar observações">
                    <ArrowIcon pulseKey={arrowPulse} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

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
      icon: (
        <path d="M7 4h7l4 4v12H7V4Zm7 0v5h5M10 13h6M10 16h4m3 1 4 4m-2-8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      ),
    },
    {
      title: "Contato da equipe",
      description: "Entraremos em contato por WhatsApp, e-mail ou telefone.",
      icon: (
        <path d="M12 4a8 8 0 0 0-6.7 12.3L4 21l4.8-1.3A8 8 0 1 0 12 4Zm-2.4 5.2c.2 2.6 2.6 5 5.2 5.2l1.2-1.2 2.1.8c-.5 1.6-1.8 2.6-3.3 2.6-3.8 0-7.4-3.6-7.4-7.4 0-1.5 1-2.8 2.6-3.3l.8 2.1-1.2 1.2Z" />
      ),
    },
    {
      title: "Avanço da parceria",
      description: "Se estiver tudo certo, seguimos com a ativação e próximos alinhamentos.",
      icon: <path d="M12 3c3.2 2.4 4.8 5.2 4.8 8.4L20 14l-3.6 1.1A8.5 8.5 0 0 1 12 21a8.5 8.5 0 0 1-4.4-5.9L4 14l3.2-2.6C7.2 8.2 8.8 5.4 12 3Zm0 0v18m-2-8h4" />,
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
          {successSteps.map((step) => (
            <article className="registration-success__card" key={step.title}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {step.icon}
              </svg>
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
