import {
  BottomCtaSection,
  FeaturesSection,
  HeroSection,
  LandingFooter,
  LandingNav,
  WhySection,
} from '@/widgets/landing'

export function LandingPage() {
  return (
    <div>
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WhySection />
        <BottomCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
