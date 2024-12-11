import Header from './landingpage/components/header'
import HeroSection from './landingpage/components/hero-section'
import FeaturesSection from './landingpage/components/features-section'
import TestimonialsSection from './landingpage/components/testimonials-section'
import CTASection from './landingpage/components/cta-section'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}