import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../../assets/thakkar-logo.png';

const LOADER_KEY = 'thakkar_loader_shown';

const wordVariants = (direction) => ({
  hidden: {
    x: direction === 'left' ? -120 : 120,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0, 0, 0.2, 1],
    },
  },
});

const IntroLoader = ({ children }) => {
  const [skipLoader] = useState(() => sessionStorage.getItem(LOADER_KEY) === 'true');
  const [showOverlay, setShowOverlay] = useState(!skipLoader);
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    if (skipLoader) return;

    const wordTimer = setTimeout(() => setPhase('words'), 300);
    const lineTimer = setTimeout(() => setPhase('line'), 1700);
    const exitTimer = setTimeout(() => setPhase('exit'), 2500);

    return () => {
      clearTimeout(wordTimer);
      clearTimeout(lineTimer);
      clearTimeout(exitTimer);
    };
  }, [skipLoader]);

  const handleExitComplete = () => {
    sessionStorage.setItem(LOADER_KEY, 'true');
    setShowOverlay(false);
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
            initial={{ y: 0 }}
            animate={phase === 'exit' ? { y: '-100vh' } : { y: 0 }}
            transition={
              phase === 'exit'
                ? { duration: 0.7, ease: [0.4, 0, 1, 1] }
                : { duration: 0 }
            }
            onAnimationComplete={() => {
              if (phase === 'exit') handleExitComplete();
            }}
          >
            <div className="flex flex-col items-center">
              <motion.img
                src={logoImage}
                alt="Thakkar Traders"
                className="mb-8 h-24 w-auto object-contain lg:h-32"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={phase !== 'idle' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
              />
              <div className="flex items-center">
                <motion.span
                  className="font-display uppercase tracking-[0.12em] text-[#F5F0E8]"
                  style={{
                    fontSize: 'clamp(3rem, 8vw, 7rem)',
                    fontWeight: 300,
                  }}
                  variants={wordVariants('left')}
                  initial="hidden"
                  animate={phase !== 'idle' ? 'visible' : 'hidden'}
                >
                  THAKKAR
                </motion.span>
                <span className="inline-block w-[0.3em]" aria-hidden="true" />
                <motion.span
                  className="font-display italic uppercase tracking-[0.12em] text-[#C9A84C]"
                  style={{
                    fontSize: 'clamp(3rem, 8vw, 7rem)',
                    fontWeight: 300,
                  }}
                  variants={wordVariants('right')}
                  initial="hidden"
                  animate={phase !== 'idle' ? 'visible' : 'hidden'}
                >
                  TRADERS
                </motion.span>
              </div>

              <motion.div
                className="mt-4 h-px origin-center bg-[#C9A84C]"
                initial={{ scaleX: 0, width: 200 }}
                animate={
                  phase === 'line' || phase === 'exit'
                    ? { scaleX: 1, width: 200 }
                    : { scaleX: 0, width: 200 }
                }
                transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IntroLoader;
