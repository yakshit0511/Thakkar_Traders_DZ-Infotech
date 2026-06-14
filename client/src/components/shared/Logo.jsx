import { Link } from 'react-router-dom';
import logoImage from '../../assets/thakkar-logo.png';

const Logo = ({ className = '', imageClassName = 'h-11 w-auto lg:h-[52px]' }) => (
  <Link to="/" className={`inline-flex shrink-0 items-center no-underline ${className}`} aria-label="Thakkar Traders — Home">
    <img
      src={logoImage}
      alt="Thakkar Traders"
      className={`${imageClassName} object-contain`}
    />
  </Link>
);

export default Logo;
