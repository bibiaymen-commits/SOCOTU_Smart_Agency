import React from 'react';

interface AfaqLogoProps {
  className?: string;
}

export const AfaqLogo: React.FC<AfaqLogoProps> = ({
  className = 'h-14 w-auto'
}) => {
  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 160 120"
        className="h-full w-auto max-h-full block shadow-2xs rounded"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AFAQ ISO 9001 Qualité"
      >
        <defs>
          <linearGradient id="afaqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#481062" />
            <stop offset="100%" stopColor="#300843" />
          </linearGradient>
          <filter id="badgeShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer badge background with subtle polygon tilt like official AFNOR / AFAQ logo */}
        <path
          d="M 16 6 
             C 40 4, 120 4, 144 8 
             L 154 112 
             C 120 115, 40 115, 8 112 
             Z"
          fill="url(#afaqGrad)"
          filter="url(#badgeShadow)"
          rx="6"
        />

        {/* AFAQ lettering stylized */}
        <g id="afaq-letters" fill="#ffffff" transform="translate(18, 16)">
          {/* Stylized 'afaq' */}
          <text
            x="62"
            y="35"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="36"
            letterSpacing="-1px"
          >
            afaq
          </text>
        </g>

        {/* ISO 9001 White Box */}
        <rect
          x="16"
          y="62"
          width="128"
          height="28"
          rx="3"
          fill="#ffffff"
        />
        <text
          x="80"
          y="82"
          textAnchor="middle"
          fill="#3b0754"
          fontFamily="system-ui, -apple-system, 'Arial Black', Impact, sans-serif"
          fontWeight="900"
          fontSize="18"
          letterSpacing="1px"
        >
          ISO 9001
        </text>

        {/* Qualité text */}
        <text
          x="80"
          y="106"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif"
          fontWeight="700"
          fontSize="12.5"
          letterSpacing="2.5px"
        >
          Qualité
        </text>
      </svg>
    </div>
  );
};
