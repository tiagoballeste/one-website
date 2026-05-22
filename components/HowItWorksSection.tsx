"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const processSteps = [
  {
    number: "01",
    title: "Solicitação",
    description: "O interessado entra em contato com a ONE ou inicia seu cadastro pelo site.",
    icon: "/icons/how-it-works/solicitacao.svg",
  },
  {
    number: "02",
    title: "Envio das informações",
    description:
      "São informados os dados do solicitante, dados do imóvel, valor do aluguel e informações necessárias para a análise.",
    icon: "/icons/how-it-works/envio-informacoes.svg",
  },
  {
    number: "03",
    title: "Avaliação em até 15 minutos",
    description: "A ONE realiza a avaliação inicial com rapidez, tecnologia e atendimento humano quando necessário.",
    icon: "/icons/how-it-works/avaliacao-15-minutos.svg",
  },
  {
    number: "04",
    title: "Proposta",
    description:
      "A ONE apresenta as condições da fiança locatícia de acordo com o perfil da locação e as condições comerciais vigentes.",
    icon: "/icons/how-it-works/proposta.svg",
  },
  {
    number: "05",
    title: "Emissão da apólice",
    description: "Com a aprovação e a contratação, é emitida a apólice de fiança locatícia.",
    icon: "/icons/how-it-works/emissao-apolice.svg",
  },
  {
    number: "06",
    title: "Locação com mais segurança",
    description:
      "Inquilino, proprietário e imobiliária seguem com mais tranquilidade durante a vigência contratual, conforme as condições descritas na apólice.",
    icon: "/icons/how-it-works/locacao-seguranca.svg",
  },
]

const journeyPath =
  "M 500 40 C 210 130 205 255 430 325 C 680 405 820 420 805 565 C 790 705 570 720 455 795 C 310 890 245 995 405 1085 C 540 1160 715 1145 700 1300 C 686 1448 440 1412 410 1560 C 390 1665 500 1698 500 1760"

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.7 5.3 20.4 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.6l-4.3-4.3 1.4-1.4Z" />
    </svg>
  )
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    const path = pathRef.current

    if (!section || !path) return

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const revealBlocks = gsap.utils.toArray<HTMLElement>(".how-it-works-reveal")
      const pathLength = path.getTotalLength()

      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: reduceMotion ? 0 : pathLength,
      })

      if (!reduceMotion) {
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".how-it-works__journey",
            start: "top 78%",
            end: "bottom 42%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        })

        revealBlocks.forEach((block) => {
          gsap.fromTo(
            block,
            {
              autoAlpha: 0,
              y: 32,
              scale: 0.96,
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: {
                trigger: block,
                start: "top 86%",
                toggleActions: "play none none reverse",
              },
            },
          )
        })
      } else {
        gsap.set(revealBlocks, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        })
      }

      requestAnimationFrame(() => ScrollTrigger.refresh())
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="how-it-works" id="como-funciona" aria-label="Como funciona a fiança locatícia da ONE">
      <div className="how-it-works__inner">
        <div className="how-it-works__intro">
          <span className="how-it-works__pill how-it-works-reveal">Como funciona?</span>
          <h2 className="how-it-works__headline how-it-works-reveal">
            <span>Como funciona a</span>
            <strong>fiança locatícia da ONE?</strong>
          </h2>
          <p className="how-it-works__copy how-it-works-reveal">
            A fiança locatícia da ONE ajuda a viabilizar contratos de aluguel por meio de uma análise rápida e da
            emissão de uma apólice de fiança locatícia, quando a proposta é aprovada.
          </p>
        </div>

        <div className="how-it-works__journey">
          <svg className="how-it-works__path" viewBox="0 0 1000 1800" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="how-path-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1B4DFE" />
                <stop offset="42%" stopColor="#7C5BFF" />
                <stop offset="74%" stopColor="#EFBF04" />
                <stop offset="100%" stopColor="#1B4DFE" />
              </linearGradient>
              <filter id="how-path-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="0 0 0 0 0.11 0 0 0 0 0.3 0 0 0 0 0.99 0 0 0 0.72 0"
                />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path className="how-it-works__path-base" d={journeyPath} />
            <path ref={pathRef} className="how-it-works__path-progress" d={journeyPath} />
          </svg>

          <div className="how-it-works__steps">
            {processSteps.map((step, index) => (
              <article
                className={`how-it-works-step how-it-works-step--${index % 2 === 0 ? "left" : "right"} how-it-works-reveal`}
                key={step.title}
              >
                <div className="how-it-works-step__marker" aria-hidden="true">
                  <img src={step.icon} alt="" />
                </div>
                <div className="how-it-works-step__card">
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="how-it-works__closing how-it-works-reveal">
          <img src="/ONE_SHIELD.svg" alt="" aria-hidden="true" />
          <p>Em poucos passos, a ONE ajuda você a substituir o fiador tradicional e avançar no contrato de aluguel com mais agilidade.</p>
          <a href="https://wa.me/5511970309686" target="_blank" rel="noopener noreferrer">
            Fale com um especialista
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}
