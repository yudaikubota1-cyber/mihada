import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport is >= breakpoint px wide.
 * Updates reactively on window resize.
 */
export function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isDesktop;
}
