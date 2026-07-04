import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import Problem from "@/components/landing/Problem";
import ProductPreview from "@/components/landing/ProductPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import WhySolana from "@/components/landing/WhySolana";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Security from "@/components/landing/Security";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <TrustBar />
      <Problem />
      <ProductPreview />
      <HowItWorks />
      <WhySolana />
      <Features />
      <Pricing />
      <Security />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}