import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useCountUp, formatStatNumber } from '../../hooks/useCountUp';
import {
  counterVariant,
  fadeUpVariant,
  staggerContainerVariant,
  useScrollAnimation,
} from '../../hooks/useScrollAnimation';

const DEFAULT_STATS = {
  totalSheetsDelivered: 10000,
  totalProjectsServed: 500,
  yearsLegacy: 15,
  totalBrands: 20,
};

const STAT_ITEMS = [
  {
    key: 'totalSheetsDelivered',
    label: 'SHEETS DELIVERED',
    description: 'Across residential, commercial and hospitality projects',
    showPlus: true,
  },
  {
    key: 'totalProjectsServed',
    label: 'PROJECTS SERVED',
    description: 'Architects, builders and interior designers',
    showPlus: true,
  },
  {
    key: 'yearsLegacy',
    label: 'YEARS LEGACY',
    description: 'Of curated material expertise in India',
    showPlus: true,
  },
  {
    key: 'totalBrands',
    label: 'PREMIUM BRANDS',
    description: 'Authorized and vetted for consistent quality',
    showPlus: true,
  },
];

const StatItem = ({ stat, target, delay, isActive }) => {
  const [shouldCount, setShouldCount] = useState(false);
  const count = useCountUp(target, 2000, shouldCount);

  useEffect(() => {
    if (!isActive) return undefined;
    const timer = setTimeout(() => setShouldCount(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [isActive, delay]);

  return (
    <motion.div
      variants={counterVariant}
      transition={{ delay }}
      className="flex flex-1 flex-col items-center px-4 py-6 text-center sm:border-r sm:border-[#2A3147] sm:py-0 last:sm:border-r-0 max-sm:border-b max-sm:border-[#2A3147] max-sm:last:border-b-0"
    >
      <p className="font-display text-[clamp(3rem,6vw,6.5rem)] font-light leading-none text-[#C9A84C]">
        {formatStatNumber(count, stat.showPlus)}
      </p>
      <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#8A8A7A]">
        {stat.label}
      </p>
      <p className="mt-2 max-w-[200px] font-body text-[0.8rem] font-light text-[#5A5A7A]">
        {stat.description}
      </p>
    </motion.div>
  );
};

const StatsSection = () => {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const { ref: headerRef, controls: headerControls } = useScrollAnimation();
  const { ref: gridRef, controls: gridControls, isInView } = useScrollAnimation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.success && data.data) {
          setStats({
            totalSheetsDelivered: data.data.totalSheetsDelivered ?? DEFAULT_STATS.totalSheetsDelivered,
            totalProjectsServed: data.data.totalProjectsServed ?? DEFAULT_STATS.totalProjectsServed,
            yearsLegacy: data.data.yearsLegacy ?? DEFAULT_STATS.yearsLegacy,
            totalBrands: data.data.totalBrands ?? DEFAULT_STATS.totalBrands,
          });
        }
      } catch {
        /* use defaults */
      }
    };

    fetchSettings();
  }, []);

  return (
    <section
      id="stats"
      className="bg-[#0D1220] px-6 py-[72px] md:px-8 lg:px-12 lg:py-[100px]"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerControls}
          variants={fadeUpVariant}
        >
          <p className="section-label">03 / BY THE NUMBERS</p>
          <h2 className="display-heading mt-4 text-[clamp(2rem,3vw,3.2rem)] italic text-[#F5F0E8]">
            Built on consistency.
          </h2>
          <div className="mt-10 mb-14 h-px w-full bg-[#2A3147]" />
        </motion.div>

        <motion.div
          ref={gridRef}
          initial="hidden"
          animate={gridControls}
          variants={staggerContainerVariant}
          className="grid grid-cols-2 gap-0 sm:flex sm:flex-row"
        >
          {STAT_ITEMS.map((stat, index) => (
            <StatItem
              key={stat.key}
              stat={stat}
              target={stats[stat.key]}
              delay={index * 0.15}
              isActive={isInView}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
