import React from 'react';

interface SocotuLogoProps {
  className?: string;
  variant?: 'color' | 'white';
}

export const SocotuLogo: React.FC<SocotuLogoProps> = ({
  className = 'h-14 w-auto',
  variant = 'color'
}) => {
  const blueColor = variant === 'white' ? '#ffffff' : '#009fe3';
  const slitColor = variant === 'white' ? '#0f2c59' : '#ffffff';

  return (
    <div className={`inline-flex flex-col items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 120 135"
        className="h-full w-auto max-h-full block"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SOCOTU Logo"
      >
        {/* Circle with Stylized 'S' */}
        <g id="socotu-symbol">
          {/* Main Blue Circle */}
          <circle cx="60" cy="48" r="44" fill={blueColor} />

          {/* Top Slit: from right boundary to center */}
          <rect
            x="57.5"
            y="36"
            width="50"
            height="7"
            rx="3.5"
            ry="3.5"
            fill={slitColor}
          />

          {/* Bottom Slit: from left boundary to center */}
          <rect
            x="12.5"
            y="52"
            width="50"
            height="7"
            rx="3.5"
            ry="3.5"
            fill={slitColor}
          />
        </g>

        {/* Text: SOCOTU */}
        <text
          x="60"
          y="126"
          textAnchor="middle"
          fill={blueColor}
          fontFamily="system-ui, -apple-system, 'Arial Black', Impact, 'Segoe UI Black', sans-serif"
          fontWeight="900"
          fontSize="28"
          letterSpacing="0.5px"
        >
          SOCOTU
        </text>
      </svg>
    </div>
  );
};
