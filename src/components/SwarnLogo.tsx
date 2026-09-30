import React from 'react';

interface SwarnLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtext?: boolean;
  className?: string;
  withPaperSeal?: boolean;
}

export const SwarnLogo: React.FC<SwarnLogoProps> = ({
  size = 'md',
  showSubtext = false,
  className = '',
  withPaperSeal = false,
}) => {
  // Dimension definitions
  const dimensions = {
    sm: { width: 110, height: 38, textClass: 'text-2xl', subtextClass: 'text-[9px]' },
    md: { width: 150, height: 50, textClass: 'text-3xl', subtextClass: 'text-[11px]' },
    lg: { width: 220, height: 75, textClass: 'text-5xl', subtextClass: 'text-xs' },
    hero: { width: 340, height: 115, textClass: 'text-7xl', subtextClass: 'text-sm' },
  }[size];

  // SVG representation faithfully reproducing the exact glyph composition of the image:
  // Traditional calligraphy wordmark inspired by the brand seal with shirorekha (headline), Sa, w, and Rna
  const LogoSVG = (
    <svg
      viewBox="0 0 380 130"
      className="w-full h-auto drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="swarnmusic logo - Swarn"
    >
      <defs>
        {/* Rich cinnabar crimson watercolor gradient */}
        <linearGradient id="swarnInkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#700D16" />
          <stop offset="35%" stopColor="#8C1620" />
          <stop offset="70%" stopColor="#7A131B" />
          <stop offset="100%" stopColor="#55080E" />
        </linearGradient>

        {/* Paper grain filter for authentic tactile feel */}
        <filter id="swarnPaperTexture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.08  0 0 0 0 0.1  0 0 0 0.25 0" />
          <feComposite in2="SourceGraphic" in="glint" operator="atop" />
        </filter>

        <pattern id="inkTexture" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="url(#swarnInkGrad)" />
          <circle cx="12" cy="15" r="1.5" fill="#50080E" opacity="0.3" />
          <circle cx="38" cy="42" r="1.8" fill="#951B25" opacity="0.4" />
          <circle cx="48" cy="18" r="1.2" fill="#50080E" opacity="0.25" />
          <circle cx="20" cy="50" r="1.4" fill="#951B25" opacity="0.3" />
        </pattern>
      </defs>

      <g fill="url(#swarnInkGrad)">
        {/* Continuous Devanagari Headline (Shirorekha) */}
        <rect x="35" y="44" width="310" height="15" rx="1.5" />

        {/* --- GLYPH 1: Sa --- */}
        {/* Vertical backbone stem */}
        <rect x="110" y="44" width="17" height="62" rx="1" />
        {/* Horizontal crossbar connecting arch to stem */}
        <rect x="80" y="74" width="34" height="13" rx="1" />
        {/* Left curve loop/hook */}
        <path
          d="M86 57 H55 C44 57 41 68 47 75 L74 106 H53 L38 88 L52 74 C42 70 41 57 54 48 C62 44 76 44 86 44 Z"
          fillRule="evenodd"
        />
        {/* Inner negative space cut */}
        <rect x="58" y="57" width="28" height="17" rx="3" />

        {/* --- GLYPH 2: Latin 'w' (seamlessly emerging under the headline) --- */}
        <path
          d="M148 57 L168 106 H179 L195 69 L211 106 H222 L242 57 H228 L217 92 L202 57 H189 L174 92 L163 57 H148 Z"
        />
        {/* Serifed apex caps for 'w' matching the reference artwork */}
        <path
          d="M145 52 H160 L174 96 L189 57 H201 L216 96 L230 52 H245 L227 106 H214 L195 68 L176 106 H163 Z"
        />

        {/* --- GLYPH 3: Rna with upper Repha arc --- */}
        {/* Upper Repha arch curling above the headline */}
        <path
          d="M312 44 C312 30 316 16 329 11 C337 7 348 10 351 17 C353 23 345 28 338 27 C330 26 324 33 325 44 Z"
        />
        <path
          d="M312 44 C311 26 322 13 336 8 C344 6 352 10 352 17 C352 23 344 26 339 24 C330 22 325 32 325 44 Z"
          opacity="0.8"
        />

        {/* Right vertical stem */}
        <rect x="315" y="44" width="17" height="62" rx="1" />

        {/* Loop of letter */}
        <path
          d="M252 44 H268 V80 C268 94 278 101 289 101 C300 101 310 94 310 80 V44 H294 V79 C294 85 291 89 288 89 C285 89 282 85 282 79 V44 H252 Z"
        />
      </g>
    </svg>
  );

  // If withPaperSeal is true, render with the full deckled parchment seal backing as in the picture
  if (withPaperSeal) {
    return (
      <div
        className={`relative inline-flex flex-col items-center justify-center p-6 sm:p-8 rounded-lg bg-[#FAF6F0] border border-[#E4D9C8] paper-deckle transition-transform duration-300 hover:scale-[1.01] ${className}`}
        style={{
          boxShadow: '0 4px 20px -2px rgba(122, 19, 27, 0.12), inset 0 0 30px rgba(122, 19, 27, 0.03)',
        }}
      >
        <div style={{ width: dimensions.width }}>{LogoSVG}</div>
        {showSubtext && (
          <div className="mt-3 flex items-center gap-2 text-stone-700 tracking-widest uppercase font-classical text-xs">
            <span>swarnmusic</span>
            <span>·</span>
            <span className="text-[#8C1620] font-semibold">Artist Community</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div style={{ width: dimensions.width }}>{LogoSVG}</div>
      {showSubtext && (
        <span
          className={`tracking-widest uppercase font-classical font-medium text-stone-600 ${dimensions.subtextClass} mt-0.5`}
        >
          swarnmusic
        </span>
      )}
    </div>
  );
};
