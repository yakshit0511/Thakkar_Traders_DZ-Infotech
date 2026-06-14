import { useState, useEffect, useRef } from 'react';

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

export const useCountUp = (target, duration = 2000, isActive = false) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isActive || hasAnimated.current) return;

    hasAnimated.current = true;
    let startTime = null;
    let frameId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setCount(Math.round(eased * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target, duration, isActive]);

  return count;
};

export const formatStatNumber = (value, showPlus = true) => {
  const formatted = value.toLocaleString('en-IN');
  return showPlus ? `${formatted}+` : formatted;
};
