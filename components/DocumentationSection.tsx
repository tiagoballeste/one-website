"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type DocumentationIconName = "document" | "person" | "building" | "info"

const documentationCards = [
  {
    title: "Pessoa física",
    icon: "person" as const,
    items: ["CPF", "Documento de identificação", "Comprovante de renda", "Dados do imóvel", "Dados de contato"],
  },
  {
    title: "Pessoa jurídica",
    icon: "building" as const,
    items: ["CNPJ", "Contrato social", "Comprovação de faturamento", "Dados do imóvel e responsável", "Dados de contato"],
  },
]

function DocumentationIcon({ name }: { name: DocumentationIconName }) {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  }

  switch (name) {
    case "document":
      return (
        <svg {...commonProps}>
          <path d="M6.5 3.5h7.2L18 7.8v12.7H6.5z" />
          <path d="M13.5 3.8v4.3h4.2" />
          <path d="M9 10.2h5.1" />
          <path d="M9 13.2h6" />
          <path d="M9 16.2h3.8" />
          <circle cx="17.3" cy="17.4" r="2.4" />
          <path d="m19 19.1 1.8 1.8" />
        </svg>
      )
    case "person":
      return (
        <svg {...commonProps}>
          <path d="M12 11.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />
          <path d="M5.7 20.2c.5-3.6 2.8-5.7 6.3-5.7s5.8 2.1 6.3 5.7" />
        </svg>
      )
    case "building":
      return (
        <svg {...commonProps}>
          <path d="M5.5 20.5v-16h9v16" />
          <path d="M14.5 9.5h4v11" />
          <path d="M8.2 7.6h1.6" />
          <path d="M11.2 7.6h1.6" />
          <path d="M8.2 10.8h1.6" />
          <path d="M11.2 10.8h1.6" />
          <path d="M8.2 14h1.6" />
          <path d="M16.2 12.8h1" />
          <path d="M16.2 15.8h1" />
          <path d="M10.2 20.5v-3.8h2.2v3.8" />
          <path d="M3.8 20.5h16.4" />
        </svg>
      )
    case "info":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 10.9v5.1" />
          <path d="M12 7.7h.01" />
        </svg>
      )
  }
}

export function DocumentationSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reducedMotion) return

    const context = gsap.context(() => {
      gsap.fromTo(
        ".documentation-reveal",
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
    <section ref={sectionRef} className="documentation-section" id="documentacao" aria-labelledby="documentation-title">
      <div className="documentation-section__inner">
        <div className="documentation-section__intro">
          <span className="documentation-pill documentation-reveal">
            <DocumentationIcon name="document" />
            Documentação
          </span>
          <h2 id="documentation-title" className="documentation-headline documentation-reveal">
            <span>Tudo que você precisa</span>
            <span>
              para <strong>solicitar</strong>
            </span>
          </h2>
          <p className="documentation-copy documentation-reveal">
            A ONE solicita informações cadastrais, documentos de identificação e dados do imóvel.
          </p>
        </div>

        <div className="documentation-cards">
          {documentationCards.map((card) => (
            <article className="documentation-card documentation-reveal" key={card.title}>
              <header className="documentation-card__header">
                <span className="documentation-card__icon">
                  <DocumentationIcon name={card.icon} />
                </span>
                <h3>{card.title}</h3>
              </header>
              <ul className="documentation-card__list">
                {card.items.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="documentation-notice documentation-reveal">
          <span className="documentation-notice__icon">
            <DocumentationIcon name="info" />
          </span>
          <p>A lista pode variar conforme análise, perfil da locação e condições comerciais vigentes.</p>
        </div>
      </div>
    </section>
  )
}
