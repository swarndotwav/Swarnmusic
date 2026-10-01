import React, { useEffect, useRef } from 'react';

/**
 * High-Performance 60FPS Click Animation Provider
 * Spawns an ultra-smooth GPU-composited liquid acoustic shockwave ripple
 * on every single click anywhere across the interface.
 * Uses only translate3d, scale, and opacity for zero layout shifts and locked 60fps.
 */
export const ClickAnimationProvider: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      } else {
        return;
      }

      if (!containerRef.current) return;

      // Create primary liquid ripple element
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple-particle';
      ripple.style.left = `${clientX}px`;
      ripple.style.top = `${clientY}px`;
      ripple.style.width = '36px';
      ripple.style.height = '36px';

      // Create secondary acoustic droplet ring for authentic liquid glass depth
      const droplet = document.createElement('div');
      droplet.className = 'click-droplet-particle';
      droplet.style.left = `${clientX}px`;
      droplet.style.top = `${clientY}px`;
      droplet.style.width = '16px';
      droplet.style.height = '16px';

      containerRef.current.appendChild(ripple);
      containerRef.current.appendChild(droplet);

      // Clean up DOM after animation completes (450ms)
      setTimeout(() => {
        ripple.remove();
        droplet.remove();
      }, 460);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-[99999]"
      aria-hidden="true"
    />
  );
};
