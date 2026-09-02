import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { CoreOperations } from "@/components/landing/core-operations";
import { TailoredForAloka } from "@/components/landing/tailored";
import { Implementation } from "@/components/landing/implementation";
import { PortalDemo } from "@/components/landing/portal-demo";
import { ChatPlayground } from "@/components/landing/chat-playground";
import { BeforeAfter } from "@/components/landing/before-after";
import { DayTimeline } from "@/components/landing/day-timeline";
import { SectionDots } from "@/components/landing/section-dots";
import { Security } from "@/components/landing/security";
import { Pricing } from "@/components/landing/pricing";
import { SocialProof } from "@/components/landing/social-proof";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { BackToTop } from "@/components/landing/back-to-top";
import { StructuredData } from "@/components/landing/structured-data";
import { MobileCtaBar } from "@/components/landing/mobile-cta-bar";
import { LanguageProvider } from "@/components/landing/language-provider";
import { SkipLink } from "@/components/landing/skip-link";
import { ScrollDepthTracker } from "@/components/landing/scroll-depth";

export default function Home() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-white font-sans">
        <SkipLink />
        <Navbar />
        <main id="main" className="flex-1">
          <Hero />
          <CoreOperations />
          <TailoredForAloka />
          <Implementation />
          <PortalDemo />
          <ChatPlayground />
          <BeforeAfter />
          <DayTimeline />
          <Security />
          <Pricing />
          <SocialProof />
          <Faq />
        </main>
        <Footer />
        <BackToTop />
        <SectionDots />
        <MobileCtaBar />
        <StructuredData />
        <ScrollDepthTracker />
      </div>
    </LanguageProvider>
  );
}
