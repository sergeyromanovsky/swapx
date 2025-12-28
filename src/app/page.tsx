import { SwapForm } from "@/features/swap";
import { BackgroundDecorations, Hero, Stats } from "@/components/home";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <BackgroundDecorations />
        <Hero />
        <SwapForm />
        <Stats />
      </main>
    </div>
  );
}
