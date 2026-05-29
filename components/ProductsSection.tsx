"use client"

import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"

gsap.registerPlugin(ScrollTrigger)

type Product = {
  id: string
  title: string
  description: string
  image: string
  mobileImage: string
  alt: string
}

const products: Product[] = [
  {
    id: "residencial",
    title: "Residencial",
    description: "Para quem quer alugar casa ou apartamento com mais praticidade, sem depender do fiador tradicional.",
    image: "/images/products/residencial.png",
    mobileImage: "/images/products/residencial-mobile.png",
    alt: "Edifício residencial iluminado à noite",
  },
  {
    id: "comercial",
    title: "Comercial",
    description:
      "Para profissionais, lojas, consultórios, escritórios, salões e pequenos negócios que precisam viabilizar um ponto comercial.",
    image: "/images/products/comercial.png",
    mobileImage: "/images/products/comercial-mobile.png",
    alt: "Fachada comercial iluminada à noite",
  },
  {
    id: "empresarial",
    title: "Empresarial",
    description: "Para empresas que precisam locar imóveis corporativos, unidades administrativas ou espaços de operação.",
    image: "/images/products/empresarial.png",
    mobileImage: "/images/products/empresarial-mobile.png",
    alt: "Torre empresarial iluminada à noite",
  },
  {
    id: "logistico",
    title: "Logístico",
    description:
      "Para galpões, armazéns, centros logísticos, áreas operacionais e imóveis com estrutura voltada à operação empresarial.",
    image: "/images/products/logistico.png",
    mobileImage: "/images/products/logistico-mobile.png",
    alt: "Centro logístico com caminhões à noite",
  },
]

function ProductStackCard({
  index,
  product,
  reduceMotion,
  scrollYProgress,
  total,
}: {
  index: number
  product: Product
  reduceMotion: boolean
  scrollYProgress: MotionValue<number>
  total: number
}) {
  const rangeStart = index / total
  const targetScale = Math.max(0.88, 1 - (total - index - 1) * 0.04)
  const scale = useTransform(scrollYProgress, [rangeStart, 1], [1, targetScale])

  return (
    <div
      className="products-card-sticky"
      style={
        {
          "--stack-index": index,
          "--stack-z": total + index,
        } as CSSProperties
      }
    >
      <motion.article
        className="products-card"
        style={{ scale: reduceMotion ? 1 : scale }}
        aria-labelledby={`product-card-${product.id}`}
      >
        <picture className="products-card__media">
          <source media="(max-width: 760px)" srcSet={product.mobileImage} />
          <img src={product.image} alt={product.alt} loading={index === 0 ? "eager" : "lazy"} />
        </picture>
        <div className="products-card__content">
          <h3 id={`product-card-${product.id}`}>{product.title}</h3>
          <p>{product.description}</p>
        </div>
      </motion.article>
    </div>
  )
}

export function ProductsSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stackRef = useRef<HTMLDivElement | null>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  })

  useEffect(() => {
    const section = sectionRef.current

    if (!section) return

    const ctx = gsap.context(() => {
      const revealBlocks = gsap.utils.toArray<HTMLElement>(".products-reveal")

      if (reduceMotion) {
        gsap.set(revealBlocks, {
          autoAlpha: 1,
          y: 0,
        })
        return
      }

      revealBlocks.forEach((block) => {
        gsap.fromTo(
          block,
          {
            autoAlpha: 0,
            y: 32,
          },
          {
            autoAlpha: 1,
            y: 0,
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

      requestAnimationFrame(() => ScrollTrigger.refresh())
    }, section)

    return () => ctx.revert()
  }, [reduceMotion])

  return (
    <section ref={sectionRef} className="products-section" id="produtos" aria-labelledby="products-title">
      <div className="products-section__inner">
        <header className="products-section__intro">
          <span className="products-section__pill products-reveal">Produtos</span>
          <h2 className="products-section__headline products-reveal" id="products-title">
            <span>Soluções para diferentes </span>
            <span>
              tipos de <strong>imóveis e operações</strong>
            </span>
          </h2>
          <p className="products-section__copy products-reveal">
            Fiança locatícia para contratos residenciais, comerciais, empresariais, industriais e logísticos, conforme a
            necessidade do cliente e as condições de análise.
          </p>
        </header>

        <div
          ref={stackRef}
          className="products-stack"
          aria-label="Catálogo de produtos"
          style={{ "--products-count": products.length } as CSSProperties}
        >
          {products.map((product, index) => (
            <ProductStackCard
              index={index}
              key={product.id}
              product={product}
              reduceMotion={reduceMotion}
              scrollYProgress={scrollYProgress}
              total={products.length}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
