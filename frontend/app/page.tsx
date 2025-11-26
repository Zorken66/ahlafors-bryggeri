import Hero from "@/components/Hero";
import About from "@/components/About";
import FeaturedProducts from "@/components/FeaturedProducts";
import NewsSection from "@/components/NewsSection";
import Services from "@/components/Services";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <FeaturedProducts />
      <NewsSection />
      <Services />
      <CallToAction />
    </div>
  );
}
