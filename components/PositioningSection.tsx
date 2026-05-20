"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import GradientText from "./GradientText"

gsap.registerPlugin(ScrollTrigger)

const positioningCards = [
  {
    title: "Sem fiador tradicional",
    description: "Substitua o fiador tradicional, conforme análise da proposta.",
    icon: "/icons/positioning/fiador.svg",
  },
  {
    title: "Menos barreiras com caução",
    description: "Evite desembolsos elevados quando a fiança for aceita na negociação.",
    icon: "/icons/positioning/caucao.svg",
  },
  {
    title: "Avaliação em até 15 minutos",
    description: "Análise inicial rápida, sujeita à documentação e condições vigentes.",
    icon: "/icons/positioning/15-minutos.svg",
  },
  {
    title: "Atendimento humano",
    description: "Tecnologia com suporte humano sempre que precisar de orientação.",
    icon: "/icons/positioning/atendimento.svg",
  },
  {
    title: "Atuação nacional",
    description: "Atendimento para clientes e parceiros em todo o Brasil.",
    icon: "/icons/positioning/atuacao-nacional.svg",
  },
  {
    title: "Mais segurança",
    description: "Cobertura dos compromissos garantidos conforme as condições contratadas.",
    icon: "/icons/positioning/seguranca.svg",
  },
]

export function PositioningSection() {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".positioning-section__inner",
          { y: 86 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top 42%",
              scrub: true,
            },
          },
        )

        gsap.fromTo(
          ".positioning-card",
          { autoAlpha: 0.74, y: 42, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: ".positioning-section__cards",
              start: "top 90%",
              end: "center 68%",
              scrub: true,
            },
          },
        )

        gsap.fromTo(
          ".positioning-card__icon",
          { autoAlpha: 0.8, scale: 0.92, y: 10 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: ".positioning-section__cards",
              start: "top 86%",
              end: "center 64%",
              scrub: true,
            },
          },
        )
      })

      return () => mm.revert()
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="positioning-section" id="sobre" aria-label="Fiança locatícia ONE">
      <div className="positioning-section__inner">
        <div className="positioning-section__intro">
          <h2 className="positioning-section__headline">
            <span className="positioning-section__headline-line">A fiança locatícia que</span>
            <GradientText
              colors={["#1B4DFE", "#C9CDE6", "#1B4DFE"]}
              animationSpeed={2.5}
              showBorder={false}
              direction="horizontal"
              pauseOnHover={false}
              yoyo={true}
              className="positioning-section__gradient-line"
            >
              facilita sua jornada de aluguel
            </GradientText>
          </h2>

          <p className="positioning-section__copy">
            Encontrar um fiador ou imobilizar dinheiro com caução pode tornar o aluguel mais difícil,
            lento e burocrático. A ONE nasceu para simplificar esse processo, oferecendo uma alternativa
            moderna e segura para viabilizar contratos de locação com mais agilidade.
          </p>
        </div>

        <div className="positioning-section__cards" aria-label="Benefícios da ONE">
          {positioningCards.map((card) => (
            <article className="positioning-card" key={card.title}>
              <img className="positioning-card__icon" src={card.icon} alt="" aria-hidden="true" />
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
