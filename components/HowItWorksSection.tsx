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

    let pathMatchMedia: ReturnType<typeof gsap.matchMedia> | null = null

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const revealBlocks = gsap.utils.toArray<HTMLElement>(".how-it-works-reveal")
      const stepBlocks = gsap.utils.toArray<HTMLElement>(".how-it-works-step")
      const nonStepRevealBlocks = revealBlocks.filter((block) => !block.classList.contains("how-it-works-step"))
      const stepMarkers = stepBlocks
        .map((step) => step.querySelector<HTMLElement>(".how-it-works-step__marker"))
        .filter((marker): marker is HTMLElement => Boolean(marker))
      let pathLength = path.getTotalLength()
      let renderedPathPoints: Array<{ x: number; y: number; progress: number }> = []

      const getRenderedPathMetrics = () => {
        const svg = path.ownerSVGElement
        const viewBox = svg?.viewBox.baseVal
        const rawLength = path.getTotalLength()

        if (!svg || !viewBox || viewBox.width === 0 || viewBox.height === 0) {
          return { length: rawLength, points: [] }
        }

        const scaleX = svg.clientWidth / viewBox.width
        const scaleY = svg.clientHeight / viewBox.height

        if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY) || scaleX === 0 || scaleY === 0) {
          return { length: rawLength, points: [] }
        }

        let renderedLength = 0
        let previousPoint = path.getPointAtLength(0)
        const samples = 220
        const points = [{ x: previousPoint.x * scaleX, y: previousPoint.y * scaleY, distance: 0, progress: 0 }]

        for (let index = 1; index <= samples; index += 1) {
          const point = path.getPointAtLength((rawLength * index) / samples)
          const x = point.x * scaleX
          const y = point.y * scaleY
          renderedLength += Math.hypot(x - previousPoint.x * scaleX, y - previousPoint.y * scaleY)
          points.push({ x, y, distance: renderedLength, progress: 0 })
          previousPoint = point
        }

        const length = renderedLength || rawLength
        return {
          length,
          points: points.map((point) => ({
            x: point.x,
            y: point.y,
            progress: point.distance / length,
          })),
        }
      }

      const setPathDashMetrics = () => {
        const metrics = getRenderedPathMetrics()
        pathLength = metrics.length
        renderedPathPoints = metrics.points
        gsap.set(path, {
          strokeDasharray: pathLength,
          strokeDashoffset: reduceMotion ? 0 : pathLength,
        })
      }

      setPathDashMetrics()

      if (!reduceMotion) {
        const matchMedia = gsap.matchMedia()
        pathMatchMedia = matchMedia
        const journey = section.querySelector<HTMLElement>(".how-it-works__journey")
        const clamp = (value: number) => Math.min(1, Math.max(0, value))
        const getLayoutTop = (element: HTMLElement) => {
          let top = 0
          let current: HTMLElement | null = element

          while (current) {
            top += current.offsetTop
            current = current.offsetParent as HTMLElement | null
          }

          return top
        }
        const getLayoutLeft = (element: HTMLElement) => {
          let left = 0
          let current: HTMLElement | null = element

          while (current) {
            left += current.offsetLeft
            current = current.offsetParent as HTMLElement | null
          }

          return left
        }
        const getPathProgressAtMarker = (marker: HTMLElement) => {
          const svg = path.ownerSVGElement

          if (!svg || renderedPathPoints.length === 0) {
            return 0
          }

          const svgRect = svg.getBoundingClientRect()
          const svgLeft = svgRect.left + window.scrollX
          const svgTop = svgRect.top + window.scrollY
          const targetX = getLayoutLeft(marker) + marker.offsetWidth / 2 - svgLeft
          const targetY = getLayoutTop(marker) + marker.offsetHeight / 2 - svgTop
          let closestProgress = renderedPathPoints[0].progress
          let closestDistance = Number.POSITIVE_INFINITY

          renderedPathPoints.forEach((point) => {
            const distance = (point.x - targetX) ** 2 + (point.y - targetY) ** 2

            if (distance < closestDistance) {
              closestDistance = distance
              closestProgress = point.progress
            }
          })

          return clamp(closestProgress)
        }

        const createPathSync = ({
          activationRatio,
          leadInRatio,
          finalScrollRatio,
          holdUntilFirstAnchor = false,
          resolveWaypoints,
          waypoints,
        }: {
          activationRatio: number
          leadInRatio: number
          finalScrollRatio: number
          holdUntilFirstAnchor?: boolean
          resolveWaypoints?: () => number[]
          waypoints: number[]
        }) => {
          if (!journey || stepBlocks.length === 0) return undefined

          let scrollAnchors: number[] = []
          let leadInStart = 0
          let pathMilestones = [...waypoints.slice(0, stepBlocks.length), 1]

          const refreshPositions = () => {
            setPathDashMetrics()
            const resolvedWaypoints = resolveWaypoints?.() ?? waypoints
            pathMilestones = [...resolvedWaypoints.slice(0, stepBlocks.length), 1]
            const journeyTop = getLayoutTop(journey)
            const sectionBottom = getLayoutTop(section) + section.offsetHeight
            const activationLineOffset = window.innerHeight * activationRatio

            scrollAnchors = stepBlocks.map((step) => getLayoutTop(step) - activationLineOffset)

            const lastStepAnchor = scrollAnchors[scrollAnchors.length - 1]
            const preferredFinalAnchor = lastStepAnchor + window.innerHeight * finalScrollRatio
            const availableFinalAnchor = sectionBottom - window.innerHeight * 0.36
            const finalAnchor = Math.max(lastStepAnchor + window.innerHeight * 0.24, Math.min(preferredFinalAnchor, availableFinalAnchor))

            scrollAnchors = [...scrollAnchors, finalAnchor]
            leadInStart = Math.min(journeyTop, scrollAnchors[0] - window.innerHeight * leadInRatio)
          }

          const progressForScroll = (scrollY: number) => {
            if (!scrollAnchors.length || !pathMilestones.length) return 0

            if (holdUntilFirstAnchor && scrollY < scrollAnchors[0]) {
              return 0
            }

            if (scrollY <= scrollAnchors[0]) {
              const range = Math.max(1, scrollAnchors[0] - leadInStart)
              return clamp((scrollY - leadInStart) / range) * pathMilestones[0]
            }

            for (let index = 1; index < scrollAnchors.length; index += 1) {
              const previousAnchor = scrollAnchors[index - 1]
              const nextAnchor = scrollAnchors[index]

              if (scrollY <= nextAnchor) {
                const segmentProgress = clamp((scrollY - previousAnchor) / Math.max(1, nextAnchor - previousAnchor))
                return pathMilestones[index - 1] + (pathMilestones[index] - pathMilestones[index - 1]) * segmentProgress
              }
            }

            return 1
          }

          const renderPath = () => {
            const progress = progressForScroll(window.scrollY)
            const resolvedProgress = progress >= 0.985 ? 1 : progress
            path.style.strokeDashoffset = `${pathLength * (1 - resolvedProgress)}`
          }

          const trigger = ScrollTrigger.create({
            trigger: journey,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
            onRefresh: () => {
              refreshPositions()
              renderPath()
            },
            onUpdate: renderPath,
          })

          requestAnimationFrame(() => {
            refreshPositions()
            renderPath()
            ScrollTrigger.refresh()
          })

          document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined)

          const imageCleanups = Array.from(section.querySelectorAll("img"))
            .filter((image) => !image.complete)
            .map((image) => {
              const refreshOnAssetLoad = () => ScrollTrigger.refresh()

              image.addEventListener("load", refreshOnAssetLoad, { once: true })
              image.addEventListener("error", refreshOnAssetLoad, { once: true })

              return () => {
                image.removeEventListener("load", refreshOnAssetLoad)
                image.removeEventListener("error", refreshOnAssetLoad)
              }
            })

          return () => {
            imageCleanups.forEach((cleanup) => cleanup())
            trigger.kill()
          }
        }

        const createStepRevealAnimations = (activationPercent: number) => {
          const animations = stepBlocks.map((step) =>
            gsap.fromTo(
              step,
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
                  trigger: step,
                  start: `top ${activationPercent}%`,
                  toggleActions: "play none none reverse",
                },
              },
            ),
          )

          return () => {
            animations.forEach((animation) => {
              animation.scrollTrigger?.kill()
              animation.kill()
            })
          }
        }

        matchMedia.add("(min-width: 761px)", () => {
          const cleanupPath = createPathSync({
            activationRatio: 0.84,
            leadInRatio: 0.28,
            finalScrollRatio: 0.56,
            waypoints: [0.1, 0.27, 0.43, 0.6, 0.76, 0.88],
          })
          const cleanupSteps = createStepRevealAnimations(84)

          return () => {
            cleanupPath?.()
            cleanupSteps()
          }
        })
        matchMedia.add("(max-width: 760px)", () => {
          const cleanupPath = createPathSync({
            activationRatio: 0.8,
            leadInRatio: 0.26,
            finalScrollRatio: 0.72,
            holdUntilFirstAnchor: true,
            resolveWaypoints: () => stepMarkers.map((marker) => getPathProgressAtMarker(marker)),
            waypoints: [0.08, 0.2, 0.34, 0.5, 0.68, 0.84],
          })
          const cleanupSteps = createStepRevealAnimations(80)

          return () => {
            cleanupPath?.()
            cleanupSteps()
          }
        })

        nonStepRevealBlocks.forEach((block) => {
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

    return () => {
      pathMatchMedia?.revert()
      ctx.revert()
    }
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
