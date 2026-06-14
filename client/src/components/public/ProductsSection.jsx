import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import {
  fadeUpVariant,
  staggerContainerVariant,
  useScrollAnimation,
} from '../../hooks/useScrollAnimation';

const DEFAULT_PRODUCTS = [
  {
    _id: 'default-1',
    name: 'Exotic Veneers',
    description: 'Natural and reconstituted veneers for bespoke furniture and feature walls',
    featuredImageUrl: '/images/wood_closeup.png',
  },
  {
    _id: 'default-2',
    name: 'Marine Plywood',
    description: 'BWP and BWR grade engineering for moisture-prone and structural use',
    featuredImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80&auto=format&fit=crop',
  },
  {
    _id: 'default-3',
    name: 'Designer Laminates',
    description: 'Acrylic, charcoal, matte and high-gloss surfaces from global brands',
    featuredImageUrl: '/images/wardrobe.png',
  },
  {
    _id: 'default-4',
    name: 'MDF and HDHMR Boards',
    description: 'High density moisture resistant boards for modular furniture and interiors',
    featuredImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop',
  },
  {
    _id: 'default-5',
    name: 'Flush and Designer Doors',
    description: 'Factory-finished and skin doors for residential and commercial projects',
    featuredImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop',
  },
  {
    _id: 'default-6',
    name: 'Hardware and Adhesives',
    description: 'Hinges, channels, handles and adhesives from trusted hardware brands',
    featuredImageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop',
  },
];

const ProductCard = ({ product, index }) => (
  <motion.article
    variants={fadeUpVariant}
    className="product-card group relative flex flex-col overflow-hidden bg-[#FEFCF8] border border-[#DED8CC] transition-all duration-400 hover:border-[#C89B4A]/45 hover:shadow-[0_20px_52px_rgba(200,155,74,0.13)] hover:-translate-y-2"
  >
    {/* Image container */}
    <div className="relative w-full h-[260px] overflow-hidden bg-[#ECE6DC]">
      {product.featuredImageUrl ? (
        <img
          src={product.featuredImageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[0.64rem] text-[#9A9A8C]">NO IMAGE</span>
        </div>
      )}
      {/* Index badge */}
      <span className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center border border-[#C89B4A]/60 bg-black/30 font-mono text-[0.62rem] text-white backdrop-blur-sm">
        {String(index + 1).padStart(2, '0')}
      </span>
      {/* Gold bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#2F2F2F]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
    </div>

    {/* Content */}
    <div className="flex flex-1 flex-col p-7">
      <h3 className="font-display text-[1.3rem] font-normal text-[#2F2F2F] transition-colors duration-300 group-hover:text-[#C89B4A] m-0 leading-tight">
        {product.name}
      </h3>
      <p className="mt-3 font-body text-[0.85rem] font-light leading-[1.75] text-[#6B6B6B] flex-1">
        {product.description}
      </p>
      <div className="mt-5 flex items-center gap-2">
        <span className="h-px w-5 bg-[#C89B4A] transition-all duration-300 group-hover:w-8" />
        <span className="font-mono text-[0.64rem] tracking-[0.16em] text-[#C89B4A] transition-transform duration-300 group-hover:translate-x-1">
          EXPLORE
        </span>
      </div>
    </div>
  </motion.article>
);

const ProductSkeleton = () => (
  <div className="flex flex-col overflow-hidden border border-[#DED8CC] bg-[#FEFCF8] min-h-[420px]">
    <div className="w-full h-[260px] bg-[#ECE6DC] animate-pulse" />
    <div className="p-7 flex-1 flex flex-col gap-3">
      <div className="h-6 w-3/4 rounded bg-[#ECE6DC] animate-pulse" />
      <div className="h-4 w-full rounded bg-[#ECE6DC] animate-pulse" />
      <div className="h-4 w-2/3 rounded bg-[#ECE6DC] animate-pulse" />
    </div>
  </div>
);

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref: headerRef, controls: headerControls } = useScrollAnimation();
  const { ref: gridRef, controls: gridControls } = useScrollAnimation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        if (data.success && data.data?.length > 0) setProducts(data.data);
        else setProducts(DEFAULT_PRODUCTS);
      } catch {
        setProducts(DEFAULT_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const displayProducts = products.length > 0 ? products : DEFAULT_PRODUCTS;

  return (
    <section
      id="products"
      className="bg-[#ECE6DC] px-6 py-[72px] md:px-8 md:py-20 lg:px-12 lg:py-[128px]"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerControls}
          variants={fadeUpVariant}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p className="section-label text-[#C89B4A]">02 / COLLECTION</p>
            <h2 className="display-heading mt-4 text-[clamp(2.2rem,3.8vw,4rem)] leading-[1.08] text-[#2F2F2F]">
              Curated Material
              <br />
              <span className="font-display italic text-[#C89B4A]">Selection</span>
            </h2>
          </div>

          <Link
            to="/products"
            className="group inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.16em] text-[#6B6B6B] no-underline transition-colors duration-300 hover:text-[#C89B4A]"
          >
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              VIEW ALL CATEGORIES
            </span>
            <span className="inline-block opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              →
            </span>
          </Link>
        </motion.div>

        <motion.div
          ref={gridRef}
          initial="hidden"
          animate={gridControls}
          variants={staggerContainerVariant}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
            : displayProducts.slice(0, 6).map((product, index) => (
              <ProductCard key={product._id || index} product={product} index={index} />
            ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;
