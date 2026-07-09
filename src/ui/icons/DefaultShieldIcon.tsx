import React from 'react';

interface Props extends React.SVGProps<SVGSVGElement> {}

export const DefaultShieldIcon: React.FC<Props> = ({ className = '', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 120"
      fill="none"
      className={className}
      {...props}
    >
      <defs>
        <radialGradient id="coreGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="1" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id="scanline" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0" />
          <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
        </linearGradient>

        <pattern id="hexGrid" width="20" height="34.64" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
          <path d="M10,0 L20,5.77 L20,17.32 L10,23.09 L0,17.32 L0,5.77 Z" fill="none" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.2" />
          <path d="M10,34.64 L20,28.87 L20,17.32 L10,23.09 L0,17.32 L0,28.87 Z" fill="none" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.2" />
        </pattern>
        
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient background bloom */}
      <path
        d="M 20 80 Q 250 60 480 80 Q 460 110 250 110 Q 40 110 20 80 Z"
        fill="url(#coreGlow)"
        filter="blur(10px)"
      />

      {/* Main energy wall (curved polygon to represent thickness) */}
      <path
        d="M 40 75 Q 250 55 460 75 L 450 95 Q 250 80 50 95 Z"
        fill="url(#coreGlow)"
      />

      {/* Hex grid texture mapping onto the wall */}
      <path
        d="M 40 75 Q 250 55 460 75 L 450 95 Q 250 80 50 95 Z"
        fill="url(#hexGrid)"
      />

      {/* Bright leading edge (top of the shield facing enemies) */}
      <path
        d="M 40 75 Q 250 55 460 75"
        stroke="url(#edgeGlow)"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#neonGlow)"
      />

      {/* Secondary bright line for intensity */}
      <path
        d="M 50 77 Q 250 58 450 77"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Scanning laser line effect */}
      <path
        d="M 60 85 Q 250 68 440 85"
        stroke="url(#scanline)"
        strokeWidth="4"
        strokeLinecap="round"
      >
        <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-dasharray" values="0,500;500,0" dur="1.5s" repeatCount="indefinite" />
      </path>

      {/* Base projectors at the ends */}
      <g stroke="#0369a1" strokeWidth="2" fill="#0f172a">
        <circle cx="40" cy="75" r="8" filter="url(#neonGlow)" />
        <circle cx="40" cy="75" r="4" fill="#38bdf8" stroke="none" />
        
        <circle cx="460" cy="75" r="8" filter="url(#neonGlow)" />
        <circle cx="460" cy="75" r="4" fill="#38bdf8" stroke="none" />
      </g>
    </svg>
  );
};
