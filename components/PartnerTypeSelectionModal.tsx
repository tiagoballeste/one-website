"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useId, useRef, useState } from "react"

type PartnerType = "imobiliaria" | "corretor"

type PartnerTypeSelectionModalProps = {
  isOpen: boolean
  onClose: () => void
  onContinue: (type: PartnerType) => void
}

const options: Array<{
  id: PartnerType
  title: string
  description: string
  icon: "building" | "broker"
}> = [
  {
    id: "imobiliaria",
    title: "Sou uma imobiliária",
    description: "Quero cadastrar minha imobiliária na ONE.",
    icon: "building",
  },
  {
    id: "corretor",
    title: "Sou corretor",
    description: "Quero seguir com o cadastro como corretor.",
    icon: "broker",
  },
]

function BuildingIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 40V9h18v31M28 18h10v22M6 40h36M16 16h5M16 23h5M16 30h5M32 25h2M32 31h2" />
    </svg>
  )
}

function BrokerIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 24a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM10 40c1.6-7 6.6-11 14-11s12.4 4 14 11M21 30l3 10 3-10" />
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

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v7M12 7h.01" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  )
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5m6-6-6 6 6 6" />
    </svg>
  )
}

export function PartnerTypeSelectionModal({ isOpen, onClose, onContinue }: PartnerTypeSelectionModalProps) {
  const [selectedType, setSelectedType] = useState<PartnerType>("imobiliaria")
  const modalRef = useRef<HTMLDivElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!isOpen) return
    setSelectedType("imobiliaria")

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="partner-selection-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          ref={modalRef}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <button className="partner-selection-modal__backdrop" type="button" onClick={onClose} aria-label="Fechar seleção de parceria" />

          <motion.section
            className="partner-selection-modal__sheet"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="partner-selection-modal__back" type="button" onClick={onClose} aria-label="Voltar para a página inicial">
              <BackArrowIcon />
              Voltar
            </button>

            <div className="partner-selection-modal__header">
              <span className="partner-selection-modal__eyebrow">Parceria</span>
              <h2 id={titleId}>Como você deseja seguir?</h2>
              <p id={descriptionId}>Selecione o perfil para ir ao formulário correto.</p>
            </div>

            <div className="partner-selection-modal__options" role="radiogroup" aria-label="Tipo de parceiro">
              {options.map((option) => {
                const isSelected = selectedType === option.id
                return (
                  <button
                    key={option.id}
                    className={`partner-selection-card ${isSelected ? "is-selected" : ""}`}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedType(option.id)}
                  >
                    <span className="partner-selection-card__icon" aria-hidden="true">
                      {option.icon === "building" ? <BuildingIcon /> : <BrokerIcon />}
                    </span>
                    <span className="partner-selection-card__copy">
                      <strong>{option.title}</strong>
                      <span>{option.description}</span>
                    </span>
                    <span className="partner-selection-card__marker" aria-hidden="true">
                      {isSelected && <CheckIcon />}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="partner-selection-modal__info">
              <InfoIcon />
              <span>Ao continuar, você irá para o formulário correspondente.</span>
            </div>

            <div className="partner-selection-modal__divider" aria-hidden="true" />

            <div className="partner-selection-modal__actions">
              <button
                className="partner-selection-modal__button partner-selection-modal__button--primary"
                type="button"
                onClick={() => onContinue(selectedType)}
              >
                Continuar
                <ArrowIcon />
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
