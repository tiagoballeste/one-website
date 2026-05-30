"use client"

import { useCallback, useRef, useState } from "react"
import { BrokerRegistrationModal } from "@/components/BrokerRegistrationModal"
import { CoveragesSection } from "@/components/CoveragesSection"
import { DocumentationSection } from "@/components/DocumentationSection"
import { FAQSection } from "@/components/FAQSection"
import { FinalCTASection } from "@/components/FinalCTASection"
import { ForWhomSection } from "@/components/ForWhomSection"
import { Hero } from "@/components/Hero"
import { HowItWorksSection } from "@/components/HowItWorksSection"
import { LogoPreloader } from "@/components/LogoPreloader"
import { PartnerTypeSelectionModal } from "@/components/PartnerTypeSelectionModal"
import { PartnershipSection } from "@/components/PartnershipSection"
import { PositioningSection } from "@/components/PositioningSection"
import { ProductsSection } from "@/components/ProductsSection"
import { RegistrationModal } from "@/components/RegistrationModal"
import { SiteHeader } from "@/components/SiteHeader"
import { SmoothScroll } from "@/components/SmoothScroll"
import { TrustSection } from "@/components/TrustSection"

export function HomePage() {
  const [isPartnerSelectionOpen, setIsPartnerSelectionOpen] = useState(false)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [isBrokerRegistrationOpen, setIsBrokerRegistrationOpen] = useState(false)
  const [isHeroReady, setIsHeroReady] = useState(false)
  const registrationTriggerRef = useRef<HTMLElement | null>(null)

  const openPartnerSelection = useCallback(() => {
    registrationTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setIsRegistrationOpen(false)
    setIsBrokerRegistrationOpen(false)
    setIsPartnerSelectionOpen(true)
  }, [])

  const closePartnerSelection = useCallback(() => {
    setIsPartnerSelectionOpen(false)
    requestAnimationFrame(() => registrationTriggerRef.current?.focus())
  }, [])

  const closeRegistration = useCallback(() => {
    setIsRegistrationOpen(false)
    requestAnimationFrame(() => registrationTriggerRef.current?.focus())
  }, [])

  const closeBrokerRegistration = useCallback(() => {
    setIsBrokerRegistrationOpen(false)
    requestAnimationFrame(() => registrationTriggerRef.current?.focus())
  }, [])

  const completeLoader = useCallback(() => {
    setIsHeroReady(true)
  }, [])

  const continuePartnerSelection = useCallback(
    (type: "imobiliaria" | "corretor") => {
      setIsPartnerSelectionOpen(false)
      if (type === "corretor") {
        setIsRegistrationOpen(false)
        setIsBrokerRegistrationOpen(true)
        return
      }
      setIsBrokerRegistrationOpen(false)
      setIsRegistrationOpen(true)
    },
    [],
  )

  return (
    <>
      <SmoothScroll />
      <LogoPreloader onComplete={completeLoader} />
      <SiteHeader onOpenRegistration={openPartnerSelection} />
      <main>
        <Hero isReady={isHeroReady} />
        <PositioningSection />
        <HowItWorksSection />
        <ForWhomSection />
        <ProductsSection />
        <CoveragesSection />
        <TrustSection />
        <PartnershipSection onOpenRegistration={openPartnerSelection} />
        <DocumentationSection />
        <FAQSection />
        <FinalCTASection onOpenRegistration={openPartnerSelection} />
      </main>
      <PartnerTypeSelectionModal
        isOpen={isPartnerSelectionOpen}
        onClose={closePartnerSelection}
        onContinue={continuePartnerSelection}
      />
      <RegistrationModal isOpen={isRegistrationOpen} onClose={closeRegistration} />
      <BrokerRegistrationModal isOpen={isBrokerRegistrationOpen} onClose={closeBrokerRegistration} />
    </>
  )
}
