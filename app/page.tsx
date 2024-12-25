import Header from "./landingpage/components/header";
import HeroSection from "./landingpage/components/hero-section";
import FeaturesSection from "./landingpage/components/features-section";
import TestimonialsSection from "./landingpage/components/teaminfo-section";
import CTASection from "./landingpage/components/cta-section";
import { Footer } from "./landingpage/components/footer";

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <Header />
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
