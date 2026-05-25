"use client"

import { useCallback, useState } from "react"
import { ForWhomSection } from "@/components/ForWhomSection"
import { Hero } from "@/components/Hero"
import { HowItWorksSection } from "@/components/HowItWorksSection"
import { LogoPreloader } from "@/components/LogoPreloader"
import { PositioningSection } from "@/components/PositioningSection"
import { RegistrationModal } from "@/components/RegistrationModal"
import { SiteHeader } from "@/components/SiteHeader"
import { SmoothScroll } from "@/components/SmoothScroll"

export function HomePage() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [isHeroReady, setIsHeroReady] = useState(false)

  const openRegistration = useCallback(() => {
    setIsRegistrationOpen(true)
  }, [])

  const closeRegistration = useCallback(() => {
    setIsRegistrationOpen(false)
  }, [])

  const completeLoader = useCallback(() => {
    setIsHeroReady(true)
  }, [])

  return (
    <>
      <SmoothScroll />
      <LogoPreloader onComplete={completeLoader} />
      <SiteHeader onOpenRegistration={openRegistration} />
      <main>
        <Hero isReady={isHeroReady} onOpenRegistration={openRegistration} />
        <PositioningSection />
        <HowItWorksSection />
        <ForWhomSection />
      </main>
      <RegistrationModal isOpen={isRegistrationOpen} onClose={closeRegistration} />
    </>
  )
}
