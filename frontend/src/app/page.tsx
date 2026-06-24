import Navbar       from '@/components/layout/Navbar';
import Footer        from '@/components/layout/Footer';
import HeroSection   from '@/components/sections/Hero';
import VisionSection from '@/components/sections/Vision';
import MissionSection from '@/components/sections/Mission';
import AboutSection  from '@/components/sections/AboutOffice';
import CaseHighlightSection from '@/components/sections/CaseHighlights';
import PartnersSection from '@/components/sections/Partners';
import ServicesSection from '@/components/sections/Services';
import ClientSection from '@/components/sections/Client';
import ChatButton    from '@/components/chat/ChatButton';
import ChatPanel     from '@/components/chat/ChatPanel';

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />

        {/* Gold rule separator */}
        <div className="gold-rule-full" />

        <VisionSection />

        <div className="gold-rule-full" />

        <MissionSection />

        <div className="gold-rule-full" />

        <AboutSection />

        <div className="gold-rule-full" />

        <PartnersSection />

        <div className="gold-rule-full" />

        <ServicesSection />

        <div className="gold-rule-full" />

        <CaseHighlightSection />
        
        <div className="gold-rule-full" />

        <ClientSection />
      </main>

      <Footer />

      {/* Floating chat */}
      <ChatButton />
      <ChatPanel />
    </>
  );
}
