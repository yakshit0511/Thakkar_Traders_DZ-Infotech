import { Helmet } from 'react-helmet-async';
import HeroSection from '../../components/public/HeroSection';
import AboutSection from '../../components/public/AboutSection';
import ProductsSection from '../../components/public/ProductsSection';
import BrandsSection from '../../components/public/BrandsSection';
import HeritageBanner from '../../components/public/HeritageBanner';
import StatsSection from '../../components/public/StatsSection';
import ProjectsSection from '../../components/public/ProjectsSection';
import PlantTransitionSection from '../../components/public/PlantTransitionSection';
import GallerySection from '../../components/public/GallerySection';
import ServicesSection from '../../components/public/ServicesSection';
import TestimonialsSection from '../../components/public/TestimonialsSection';
import QuoteFormSection from '../../components/public/QuoteFormSection';
import ContactSection from '../../components/public/ContactSection';

const HomePage = () => (
  <>
    <Helmet>
      <title>Thakkar Traders | Premium Interior Building Materials — Surat</title>
      <meta
        name="description"
        content="Authorized distributors of premium plywood, laminates, veneers, MDF, HDHMR boards, flush doors, and hardware in Surat, Gujarat."
      />
    </Helmet>

    <HeroSection />
    <AboutSection />
    <ProductsSection />
    <BrandsSection />
    <HeritageBanner />
    <StatsSection />
    <ProjectsSection />
    <PlantTransitionSection />
    <GallerySection />
    <ServicesSection />
    <TestimonialsSection />
    <QuoteFormSection />
    <ContactSection />
  </>
);

export default HomePage;
