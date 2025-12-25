import { SwapContainer } from "@/app/(home)/components/SwapContainer";
import BackgroundDecorations from "./(home)/components/BackgroundDecorations";
import Hero from "./(home)/components/Hero";
import StatsSection from "./(home)/components/Stats";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <BackgroundDecorations />
        <Hero />
        <SwapContainer />
        <StatsSection />
      </main>
    </div>
  );
}
