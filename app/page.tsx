import { Hero } from "@/components/Hero"
import { ForWhomSection } from "@/components/ForWhomSection"
import { LogoPreloader } from "@/components/LogoPreloader"
import { PositioningSection } from "@/components/PositioningSection"
import { SiteHeader } from "@/components/SiteHeader"
import { SmoothScroll } from "@/components/SmoothScroll"

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <LogoPreloader />
      <SiteHeader />
      <main>
        <Hero />
        <PositioningSection />
        <ForWhomSection />
      </main>
    </>
  )
}
