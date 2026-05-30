"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type PartnershipSectionProps = {
  onOpenRegistration: () => void
}

type IconName = "handshake" | "lightning" | "shield" | "support" | "trend" | "lock" | "globe" | "award"

const benefits: Array<{ icon: IconName; title: string }> = [
  { icon: "lightning", title: "Mais agilidade no fechamento" },
  { icon: "shield", title: "Alternativa moderna à caução" },
  { icon: "support", title: "Apoio comercial dedicado" },
  { icon: "trend", title: "Menos perdas por falta de fiador" },
  { icon: "lock", title: "Segurança para o proprietário" },
  { icon: "globe", title: "Atuação nacional" },
]

function PartnershipIcon({ name }: { name: IconName }) {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  }

  switch (name) {
    case "handshake":
      return (
        <svg {...commonProps}>
          <path d="M7.5 12.2 10 14.7c.8.8 2 .8 2.8 0l.8-.8" />
          <path d="m14.1 10.5 2.4 2.4c.7.7.7 1.8 0 2.5l-2.1 2.1c-.7.7-1.8.7-2.5 0L5.8 11.4" />
          <path d="m8.3 9 2.6-2.6c.8-.8 2.1-.8 2.9 0l4.4 4.4" />
          <path d="m3.5 9.3 3.2-3.2 2.2 2.2-3.2 3.2z" />
          <path d="m15.1 8.3 2.2-2.2 3.2 3.2-2.2 2.2z" />
        </svg>
      )
    case "lightning":
      return (
        <svg {...commonProps}>
          <path d="m13.4 2.8-7 10.2h5.1l-1 8.2 7.1-10.8h-5z" />
        </svg>
      )
    case "shield":
      return (
        <svg {...commonProps}>
          <path d="M12 3.1 19 6v5.2c0 4.4-2.8 7.9-7 9.7-4.2-1.8-7-5.3-7-9.7V6z" />
          <path d="m8.7 12 2.1 2.1 4.5-4.6" />
        </svg>
      )
    case "support":
      return (
        <svg {...commonProps}>
          <path d="M12 11.5a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z" />
          <path d="M5.2 20.2c.6-3.3 3.1-5.4 6.8-5.4s6.2 2.1 6.8 5.4" />
          <path d="M3.5 13.7v-1.2a8.5 8.5 0 0 1 17 0v1.2" />
        </svg>
      )
    case "trend":
      return (
        <svg {...commonProps}>
          <path d="M3.7 7.8 9 13.1l3.2-3.2 8.1 8.1" />
          <path d="M15.8 18h4.5v-4.5" />
        </svg>
      )
    case "lock":
      return (
        <svg {...commonProps}>
          <path d="M6.5 10.5h11v9h-11z" />
          <path d="M8.7 10.5V8.1a3.3 3.3 0 0 1 6.6 0v2.4" />
          <path d="M12 14.1v2.2" />
        </svg>
      )
    case "globe":
      return (
        <svg {...commonProps}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <path d="M3.8 12h16.4" />
          <path d="M12 3c2.1 2.3 3.2 5.3 3.2 9s-1.1 6.7-3.2 9c-2.1-2.3-3.2-5.3-3.2-9S9.9 5.3 12 3Z" />
        </svg>
      )
    case "award":
      return (
        <svg {...commonProps}>
          <path d="m12 3.2 2 4.1 4.5.7-3.3 3.2.8 4.5-4-2.1-4 2.1.8-4.5L5.5 8l4.5-.7z" />
          <path d="M8.2 20h7.6" />
          <path d="M9.8 16.1v3.9" />
          <path d="M14.2 16.1v3.9" />
        </svg>
      )
  }
}

export function PartnershipSection({ onOpenRegistration }: PartnershipSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reducedMotion) return

    const context = gsap.context(() => {
      gsap.fromTo(
        ".partnership-reveal",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.82,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 74%",
            once: true,
          },
        },
      )
    }, section)

    return () => context.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="partnership-section" id="parceria-b2b" aria-labelledby="partnership-title">
      <div className="partnership-section__inner">
        <div className="partnership-hero">
          <div className="partnership-hero__copy">
            <span className="partnership-pill partnership-reveal">
              <PartnershipIcon name="handshake" />
              Parceria comercial
            </span>
            <h2 id="partnership-title" className="partnership-headline partnership-reveal">
              <strong>Imobiliárias e corretores:</strong>
              <span>acelerem seus contratos com a ONE</span>
            </h2>
            <p className="partnership-copy partnership-reveal">
              Reduza barreiras, melhore a experiência do cliente e aumente a conversão de contratos de locação.
            </p>
          </div>

          <div className="partnership-image partnership-reveal">
            <img src="/images/partnership/building.png" alt="Vista noturna de edifício corporativo premium" />
          </div>
        </div>

        <div className="partnership-benefits partnership-reveal">
          <h3>Benefícios para parceiros</h3>
          <div className="partnership-benefits__grid">
            {benefits.map((benefit) => (
              <div className="partnership-benefit" key={benefit.title}>
                <PartnershipIcon name={benefit.icon} />
                <span>{benefit.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="partnership-commission partnership-reveal">
          <div className="partnership-commission__icon" aria-hidden="true">
            <PartnershipIcon name="award" />
          </div>
          <div className="partnership-commission__content">
            <span>COMISSÃO</span>
            <h3>Maior comissão do mercado</h3>
            <p>
              <strong>10% sobre o valor da apólice</strong>, com pagamento na assinatura.
            </p>
          </div>
          <button type="button" className="partnership-commission__cta" onClick={onOpenRegistration}>
            Quero ser parceiro
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
