import { Outlet } from 'react-router-dom';
import IntroLoader from '../components/shared/IntroLoader';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const PublicLayout = () => (
  <IntroLoader>
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </IntroLoader>
);

export default PublicLayout;
