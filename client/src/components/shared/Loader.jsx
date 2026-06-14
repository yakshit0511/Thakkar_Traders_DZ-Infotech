import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = false }) => {
  const spinner = (
    <Loader2 className="h-8 w-8 animate-spin text-accent-gold" />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default Loader;
