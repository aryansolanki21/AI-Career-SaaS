import { useAppData } from "../context/useAppData";
import HeroSection from "../components/home/HeroSection";
import ToolsSection from "../components/home/ToolsSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import FAQSection from "../components/home/FAQSection";
import CTASection from "../components/home/CTASection";
import FooterSection from "../components/home/FooterSection";
import PricingSection from "../components/home/PricingSection";

const Home = () => {
  const { isAuth } = useAppData();

  const primaryTo = isAuth ? "/analyse" : "/register";
  const primaryLabel = isAuth ? "Analyse a resume" : "Upload your resume";

  return (
    <>
      <main>
        <HeroSection
          primaryTo={primaryTo}
          primaryLabel={primaryLabel}
          isAuth={isAuth}
        />

        <ToolsSection />

        <HowItWorksSection />

        <PricingSection />

        <FAQSection />

        <CTASection primaryTo={primaryTo} primaryLabel={primaryLabel} />
      </main>

      <FooterSection />
    </>
  );
};

export default Home;
