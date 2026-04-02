import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ProjectsCarousel from "@/components/ProjectsCarousel";
import About from "@/components/About";
import VideoGallery from "@/components/VideoGallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import QuoteWizard from "@/components/QuoteWizard";
import { useQuote } from "@/hooks/use-quote";

const Index = () => {
  const { isOpen, closeQuote } = useQuote();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Services />
      <ProjectsCarousel />
      <About />
      <VideoGallery />
      <Contact />
      <Footer />
      <ChatBot />
      <QuoteWizard isOpen={isOpen} onClose={closeQuote} />
    </div>
  );
};

export default Index;
