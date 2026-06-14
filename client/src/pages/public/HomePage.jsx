import { Helmet } from 'react-helmet-async';
import HeroSection from '../../components/public/HeroSection';
import AboutSection from '../../components/public/AboutSection';
import ProductsSection from '../../components/public/ProductsSection';
import StatsSection from '../../components/public/StatsSection';
import ProjectsSection from '../../components/public/ProjectsSection';
import BrandsSection from '../../components/public/BrandsSection';
import GallerySection from '../../components/public/GallerySection';
import QuoteFormSection from '../../components/public/QuoteFormSection';

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
    <StatsSection />
    <ProjectsSection />
    <BrandsSection />
    <GallerySection />
    <QuoteFormSection />
  </>
);

export default HomePage;
