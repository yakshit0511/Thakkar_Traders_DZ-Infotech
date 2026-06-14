import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import '../../styles/admin.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    const lettersThakkar = "THAKKAR".split("");
    const lettersTraders = "TRADERS".split("");

    const containerVariants = {
      animate: {
        transition: {
          staggerChildren: 0.08,
        },
      },
    };

    const letterVariants = {
      initial: { opacity: 0, y: 15 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.2, 0.65, 0.3, 0.9],
        },
      },
    };

    return (
      <div className="admin-theme">
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--admin-bg-deep)] text-[var(--admin-text-primary)]">
          <div className="w-full max-w-md px-6 text-center">
            {/* Elegant Monogram / Mark */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 flex justify-center"
            >
              <div className="w-16 h-16 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-card)] flex items-center justify-center shadow-lg shadow-black/40">
                <span className="text-2xl font-bold tracking-widest text-[var(--admin-accent)] font-sans">TT</span>
              </div>
            </motion.div>

            {/* Letter reveal */}
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-2 mb-8 select-none"
            >
              <div className="flex justify-center gap-1.5 text-2xl font-bold tracking-[0.2em] text-[var(--admin-text-primary)]">
                {lettersThakkar.map((char, index) => (
                  <motion.span key={`thakkar-${index}`} variants={letterVariants}>
                    {char}
                  </motion.span>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 text-xs font-semibold tracking-[0.5em] text-[var(--admin-accent)] uppercase pl-[0.5em]">
                {lettersTraders.map((char, index) => (
                  <motion.span key={`traders-${index}`} variants={letterVariants}>
                    {char}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Glowing progress bar */}
            <div className="w-full h-1 bg-[var(--admin-bg-elevated)] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[var(--admin-accent)] to-transparent"
              />
            </div>
            
            <p className="mt-4 text-xs text-[var(--admin-text-secondary)] tracking-wider">
              Initializing Secure Workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default PrivateRoute;

