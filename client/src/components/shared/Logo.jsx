import { Link } from 'react-router-dom';

const Logo = ({ className = '' }) => (
  <Link
    to="/"
    className={`inline-flex shrink-0 items-center no-underline ${className}`}
    aria-label="Thakkar Traders — Home"
  >
    <img
      src="/thakkar-logo-transparent.png"
      className="h-[68px] sm:h-[74px] lg:h-[80px] w-auto object-contain"
      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.12)) brightness(1.05)' }}
      alt="Thakkar Traders Logo"
    />
  </Link>
);

export default Logo;
