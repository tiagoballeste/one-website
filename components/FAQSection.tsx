"use client"

import { KeyboardEvent, useEffect, useId, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type FAQItem = {
  question: string
  answer: string
}

type FAQTab = {
  id: string
  label: string
  items: FAQItem[]
}

const faqTabs: FAQTab[] = [
  {
    id: "sobre_a_fianca",
    label: "Sobre a fiança",
    items: [
      {
        question: "O que é fiança locatícia?",
        answer:
          "É uma garantia utilizada em contratos de aluguel para substituir o fiador tradicional e ajudar a proteger os compromissos previstos na apólice de fiança locatícia.",
      },
      {
        question: "A fiança locatícia substitui o fiador?",
        answer:
          "Sim. A proposta da fiança locatícia é oferecer uma alternativa ao fiador tradicional, facilitando o processo para quem precisa alugar, conforme análise da proposta.",
      },
      {
        question: "A fiança locatícia substitui a caução?",
        answer:
          "Em muitos casos, sim. Ela pode reduzir a necessidade de desembolsar imediatamente um valor alto como caução no início da locação, desde que aceita na negociação e aprovada na análise.",
      },
      {
        question: "Quem pode contratar?",
        answer:
          "A contratação pode ser feita por pessoas físicas ou jurídicas que precisam alugar imóveis residenciais, comerciais, empresariais, industriais ou logísticos, conforme análise e condições da proposta.",
      },
      {
        question: "A ONE atende todo o Brasil?",
        answer: "Sim. A ONE tem atuação nacional e está cadastrando parceiros em todo o Brasil.",
      },
    ],
  },
  {
    id: "contratacao",
    label: "Contratação",
    items: [
      {
        question: "A aprovação é imediata?",
        answer:
          "A ONE realiza avaliação inicial em até 15 minutos, mas isso não significa aprovação automática. A contratação depende da análise das informações, documentação, elegibilidade e condições comerciais vigentes.",
      },
      {
        question: "Qual é a validade da fiança locatícia?",
        answer: "A fiança pode ter validade de 12 meses, conforme as condições da apólice e da contratação.",
      },
      {
        question: "Como é calculado o valor da fiança?",
        answer:
          "O valor é baseado nas condições da locação, incluindo o valor do aluguel e o perfil da proposta, conforme análise e regras comerciais vigentes.",
      },
      {
        question: "Posso pagar à vista ou parcelar?",
        answer:
          "Podem existir condições de pagamento à vista com desconto ou parcelamento no cartão, conforme regras comerciais vigentes.",
      },
      {
        question: "Como faço para solicitar?",
        answer:
          "Você pode entrar em contato com a ONE pelo site, WhatsApp ou formulário de cadastro para iniciar sua avaliação.",
      },
      {
        question: "Serve para imóvel comercial, empresarial ou logístico?",
        answer:
          "Sim. A fiança locatícia pode ser aplicada a imóveis residenciais, comerciais, empresariais, industriais e logísticos, conforme análise e condições contratuais.",
      },
    ],
  },
  {
    id: "cobertura",
    label: "Cobertura",
    items: [
      {
        question: "Quais compromissos podem ser garantidos?",
        answer:
          "A apólice pode envolver aluguel, condomínio, IPTU, taxa de lixo e outros encargos expressamente previstos na contratação, conforme modalidade e análise.",
      },
      {
        question: "Posso incluir condomínio, IPTU e taxa de lixo?",
        answer:
          "Esses encargos podem fazer parte dos compromissos garantidos, desde que estejam previstos na apólice de fiança locatícia.",
      },
      {
        question: "A fiança inclui pintura, danos ao imóvel ou multa por rescisão?",
        answer:
          "Esses itens não devem ser considerados como cobertura padrão. A cobertura válida é sempre aquela descrita na apólice de fiança locatícia. Em caso de dúvida, a equipe da ONE pode orientar o cliente durante o atendimento.",
      },
    ],
  },
]

function FAQIndicator({ isOpen }: { isOpen: boolean }) {
  return (
    <span className="faq-accordion__indicator" aria-hidden="true">
      <span />
      <span className={isOpen ? "faq-accordion__indicator-line--hidden" : undefined} />
    </span>
  )
}

export function FAQSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()
  const reactId = useId()
  const [activeTabId, setActiveTabId] = useState(faqTabs[0].id)
  const [openIndex, setOpenIndex] = useState(0)

  const activeTab = faqTabs.find((tab) => tab.id === activeTabId) ?? faqTabs[0]

  useEffect(() => {
    const section = sectionRef.current
    if (!section || reducedMotion) return

    const context = gsap.context(() => {
      gsap.fromTo(
        ".faq-reveal",
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

  const selectTab = (tabId: string) => {
    setActiveTabId(tabId)
    setOpenIndex(0)
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tabId: string) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return

    event.preventDefault()

    const currentIndex = faqTabs.findIndex((tab) => tab.id === tabId)
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? faqTabs.length - 1
          : event.key === "ArrowRight"
            ? (currentIndex + 1) % faqTabs.length
            : (currentIndex - 1 + faqTabs.length) % faqTabs.length

    const nextTab = faqTabs[nextIndex]
    selectTab(nextTab.id)
    sectionRef.current?.querySelector<HTMLButtonElement>(`[data-faq-tab="${nextTab.id}"]`)?.focus()
  }

  return (
    <section ref={sectionRef} className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-section__inner">
        <div className="faq-section__intro">
          <span className="faq-pill faq-reveal">FAQ</span>
          <h2 id="faq-title" className="faq-headline faq-reveal">
            Perguntas <strong>frequentes</strong>
          </h2>
          <p className="faq-copy faq-reveal">Tire suas dúvidas sobre a fiança locatícia.</p>
        </div>

        <div className="faq-tabs faq-reveal" role="tablist" aria-label="Categorias de perguntas frequentes">
          {faqTabs.map((tab) => {
            const isActive = tab.id === activeTab.id
            return (
              <button
                key={tab.id}
                id={`${reactId}-${tab.id}-tab`}
                className={`faq-tabs__button${isActive ? " faq-tabs__button--active" : ""}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${reactId}-${tab.id}-panel`}
                tabIndex={isActive ? 0 : -1}
                data-faq-tab={tab.id}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div
          key={activeTab.id}
          id={`${reactId}-${activeTab.id}-panel`}
          className="faq-panel faq-reveal"
          role="tabpanel"
          aria-labelledby={`${reactId}-${activeTab.id}-tab`}
        >
          {activeTab.items.map((item, index) => {
            const isOpen = openIndex === index
            const answerId = `${reactId}-${activeTab.id}-answer-${index}`
            return (
              <article className={`faq-accordion${isOpen ? " faq-accordion--open" : ""}`} key={item.question}>
                <h3>
                  <button
                    className="faq-accordion__trigger"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>{item.question}</span>
                    <FAQIndicator isOpen={isOpen} />
                  </button>
                </h3>
                <div id={answerId} className="faq-accordion__answer" aria-hidden={!isOpen}>
                  <div className="faq-accordion__answer-inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
