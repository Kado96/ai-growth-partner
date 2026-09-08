import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ProjectsCarousel from "@/components/ProjectsCarousel";
import About from "@/components/About";
import PresentationPlayer from "@/components/PresentationPlayer";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Services />
      <ProjectsCarousel />
      <About />
      <PresentationPlayer />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
