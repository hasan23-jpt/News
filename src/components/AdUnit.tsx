import { useEffect, useRef } from 'react';

const MONETAG_KEY = 'afc020e76024efb29612f744cf9b998b';

interface AdUnitProps {
  zoneId?: string;
  className?: string;
  label?: string;
}

export function AdUnit({ zoneId = MONETAG_KEY, className = '', label = 'Advertisement' }: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoneId || !containerRef.current) return;
    containerRef.current.innerHTML = '';

    const ins = document.createElement('ins');
    ins.className = 'jarossi';
    ins.setAttribute('data-key', zoneId);
    ins.setAttribute('data-zone', zoneId);
    ins.style.display = 'block';
    containerRef.current.appendChild(ins);

    const script = document.createElement('script');
    script.src = `//jarossi.com/pw/waistijkz.js?key=${zoneId}`;
    script.async = true;
    containerRef.current.appendChild(script);
  }, [zoneId]);

  return <div className={`ad-container ${className}`} ref={containerRef} data-label={label} />;
}
