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
    featuredImageUrl: '',
  },
  {
    _id: 'default-2',
    name: 'Marine Plywood',
    description: 'BWP and BWR grade engineering for moisture-prone and structural use',
    featuredImageUrl: '',
  },
  {
    _id: 'default-3',
    name: 'Designer Laminates',
    description: 'Acrylic, charcoal, matte and high-gloss surfaces from global brands',
    featuredImageUrl: '',
  },
  {
    _id: 'default-4',
    name: 'MDF and HDHMR Boards',
    description: 'High density moisture resistant boards for modular furniture and interiors',
    featuredImageUrl: '',
  },
  {
    _id: 'default-5',
    name: 'Flush and Designer Doors',
    description: 'Factory-finished and skin doors for residential and commercial projects',
    featuredImageUrl: '',
  },
  {
    _id: 'default-6',
    name: 'Hardware and Adhesives',
    description: 'Hinges, channels, handles and adhesives from trusted hardware brands',
    featuredImageUrl: '',
  },
];

const NOISE_PATTERN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`;

const ProductCard = ({ product, index }) => (
  <motion.article
    variants={fadeUpVariant}
    className="product-card group relative flex min-h-[320px] flex-col overflow-hidden border-r border-[#2A3147] bg-[#12192B] transition-[border-color] duration-300 hover:border-[rgba(201,168,76,0.3)] lg:min-h-[480px]"
  >
    {/* Hover image */}
    {product.featuredImageUrl ? (
      <div
        className="product-card-image absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      >
        <img
          src={product.featuredImageUrl}
          alt=""
          className="h-full w-full scale-[1.06] object-cover transition-transform duration-[600ms] ease-out group-hover:scale-100"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,15,30,0.1) 0%, rgba(10,15,30,0.75) 100%)',
          }}
        />
      </div>
    ) : (
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          backgroundColor: '#1A2035',
          backgroundImage: NOISE_PATTERN,
        }}
        aria-hidden="true"
      />
    )}

    <span className="relative z-10 block p-6 font-mono text-[0.65rem] text-[#8A8A7A]">
      {String(index + 1).padStart(2, '0')}
    </span>

    <div className="relative z-10 mt-auto flex flex-col p-6 pt-0">
      <h3 className="font-display text-[1.4rem] font-normal text-[#F5F0E8] transition-[color,font-size] duration-300 group-hover:text-white group-hover:text-[1.45rem]">
        {product.name}
      </h3>
      <p className="mt-2 font-body text-[0.8rem] font-light leading-relaxed text-[#8A8A7A]">
        {product.description}
      </p>
      <span className="product-card-explore mt-3 inline-block translate-y-2.5 font-mono text-[0.65rem] tracking-[0.15em] text-[#C9A84C] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        EXPLORE →
      </span>
    </div>
  </motion.article>
);

const ProductSkeleton = () => (
  <div className="min-h-[320px] animate-pulse border-r border-[#2A3147] bg-[#12192B] lg:min-h-[480px]">
    <div className="p-6">
      <div className="h-3 w-8 rounded bg-[#2A3147]" />
    </div>
    <div className="mt-auto p-6 pt-0">
      <div className="mb-3 h-6 w-3/4 rounded bg-[#2A3147]" />
      <div className="h-4 w-full rounded bg-[#2A3147]" />
      <div className="mt-2 h-4 w-2/3 rounded bg-[#2A3147]" />
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
        if (data.success && data.data?.length > 0) {
          setProducts(data.data);
        } else {
          setProducts(DEFAULT_PRODUCTS);
        }
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
      className="bg-[#0A0F1E] px-6 py-[60px] md:px-8 md:py-20 lg:px-12 lg:py-[120px]"
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
            <p className="section-label">02 / COLLECTION</p>
            <h2 className="display-heading mt-4 text-[clamp(2rem,3.5vw,3.5rem)] leading-[1.1] text-[#F5F0E8]">
              Curated Material
              <br />
              <span className="font-display italic">Selection</span>
            </h2>
          </div>

          <Link
            to="/products"
            className="group inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.15em] text-[#8A8A7A] no-underline transition-colors duration-300 hover:text-[#C9A84C]"
          >
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              VIEW ALL CATEGORIES
            </span>
            <span className="inline-block -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              →
            </span>
          </Link>
        </motion.div>

        <motion.div
          ref={gridRef}
          initial="hidden"
          animate={gridControls}
          variants={staggerContainerVariant}
          className="mt-16 grid grid-cols-2 gap-0.5 sm:grid-cols-2 md:grid-cols-3 md:gap-0 lg:grid-cols-6 lg:gap-0"
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
