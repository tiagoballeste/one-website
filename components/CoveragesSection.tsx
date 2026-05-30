"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const coverages = [
  {
    number: "01",
    title: "Aluguel",
    description: "Valor mensal do contrato",
  },
  {
    number: "02",
    title: "Condomínio",
    description: "Encargos condominiais",
  },
  {
    number: "03",
    title: "IPTU",
    description: "Tributo municipal do imóvel",
  },
  {
    number: "04",
    title: "Taxa de lixo",
    description: "Coleta e serviços públicos",
  },
  {
    number: "05",
    title: "Outros encargos",
    description: "Expressamente previstos na apólice",
  },
]

export function CoveragesSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reducedMotion) return

    const context = gsap.context(() => {
      gsap.fromTo(
        ".coverages-reveal",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
          },
        },
      )
    }, section)

    return () => context.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="coverages-section" id="coberturas" aria-labelledby="coverages-title">
      <div className="coverages-section__inner">
        <div className="coverages-section__layout">
          <div className="coverages-section__intro">
            <span className="coverages-section__pill coverages-reveal">Coberturas</span>
            <h2 id="coverages-title" className="coverages-section__headline coverages-reveal">
              <span>O que está garantido</span>
              <span>
                na <strong>apólice ONE</strong>
              </span>
            </h2>
            <p className="coverages-section__copy coverages-reveal">
              A fiança locatícia cobre os compromissos previstos na apólice, conforme a modalidade contratada.
            </p>
          </div>

          <aside className="coverages-card coverages-reveal" aria-label="Apólice ONE com cobertura ampla">
            <img src="/icons/coverages/apolice.svg" alt="" className="coverages-card__icon" aria-hidden="true" />
            <span className="coverages-card__eyebrow">APÓLICE ONE</span>
            <h3 className="coverages-card__title">Cobertura ampla</h3>
            <p className="coverages-card__description">Compromissos garantidos conforme contratação</p>
          </aside>

          <ol className="coverages-list" aria-label="Coberturas garantidas na apólice ONE">
            {coverages.map((coverage) => (
              <li className="coverages-list__item coverages-reveal" key={coverage.number}>
                <span className="coverages-list__number">{coverage.number}</span>
                <div className="coverages-list__content">
                  <h3>{coverage.title}</h3>
                  <p>{coverage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="coverages-notice coverages-reveal">
          <span className="coverages-notice__icon" aria-hidden="true">
            <img src="/icons/coverages/shield-check.svg" alt="" />
          </span>
          <p>
            As coberturas dependem da modalidade contratada, análise da proposta e condições descritas na apólice. Não
            há aprovação automática nem cobertura fora do contratado.
          </p>
        </div>
      </div>
    </section>
  )
}
