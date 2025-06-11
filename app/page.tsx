import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import Stats from "@/components/home/stats";
import Pricing from "@/components/home/pricing";
import FAQ from "@/components/home/faq";
import Contact from "@/components/home/contact";
import LogoCloud from "@/components/home/logocloud";
import { NovelGenerator } from "@/components/product/novel-generator";

export default async function Home() {
  return (
    <div className="flex flex-col gap-8 md:gap-12 lg:gap-24">
      <Hero /> 
      <section id="novel-generator" className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI创作工具
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            让AI帮您创作精彩的职场爽文故事
          </p>
        </div>
        <NovelGenerator />
      </section>
      <LogoCloud />
      <Features />
      <Stats />
      <Pricing />
      <FAQ />
      <Contact />
    </div>
  );
}
