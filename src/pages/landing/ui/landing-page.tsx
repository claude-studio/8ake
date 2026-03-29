import {
  BottomCtaSection,
  FeaturesSection,
  HeroSection,
  LandingFooter,
  LandingNav,
  StepsSection,
  WhySection,
} from '@/widgets/landing'

export function LandingPage() {
  return (
    <div>
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StepsSection />
        <WhySection />
        <BottomCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
