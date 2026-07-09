import React from 'react';

interface Props extends React.SVGProps<SVGSVGElement> {}

export const DoughBarrierIcon: React.FC<Props> = ({ className = '', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 120"
      fill="none"
      className={className}
      {...props}
    >
      <defs>
        <radialGradient id="doughGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fde047" /> {/* bright center */}
          <stop offset="60%" stopColor="#f59e0b" /> {/* baked edge */}
          <stop offset="100%" stopColor="#d97706" /> {/* shadow edge */}
        </radialGradient>
        
        <filter id="flourDust">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 0.2 0" in="noise" result="coloredNoise" />
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
          <feBlend mode="screen" in="composite" in2="SourceGraphic" />
        </filter>
      </defs>

      {/* Main Dough Body (Top-Down Oblique Baguette shape) */}
      <path
        d="M 40 75 Q 250 45 460 75 Q 480 85 460 95 Q 250 110 40 95 Q 20 85 40 75 Z"
        fill="url(#doughGradient)"
        filter="url(#flourDust)"
      />
      
      {/* 3D Crust Overlap (Front Face) */}
      <path
        d="M 40 75 Q 250 90 460 75 Q 470 85 460 95 Q 250 110 40 95 Q 30 85 40 75 Z"
        fill="#b45309"
        opacity="0.5"
      />
      
      {/* Dimples / Air bubbles / Cuts */}
      <path d="M 100 65 Q 120 75 140 65" stroke="#b45309" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <path d="M 220 60 Q 250 70 280 60" stroke="#b45309" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <path d="M 360 65 Q 380 75 400 65" stroke="#b45309" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      
      <ellipse cx="120" cy="70" rx="8" ry="4" fill="#b45309" opacity="0.5" />
      <ellipse cx="280" cy="65" rx="10" ry="5" fill="#b45309" opacity="0.4" />
      <ellipse cx="380" cy="70" rx="6" ry="3" fill="#b45309" opacity="0.5" />

      {/* Steam lines */}
      <path d="M 150 45 Q 160 25 155 5" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.6">
        <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite" />
        <animate attributeName="d" values="M 150 45 Q 160 25 155 5; M 150 45 Q 140 25 155 5; M 150 45 Q 160 25 155 5" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M 250 40 Q 240 20 255 0" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="d" values="M 250 40 Q 240 20 255 0; M 250 40 Q 260 20 255 0; M 250 40 Q 240 20 255 0" dur="3.5s" repeatCount="indefinite" />
      </path>
      <path d="M 350 45 Q 360 25 345 5" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5">
        <animate attributeName="opacity" values="0.1;0.7;0.1" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="d" values="M 350 45 Q 360 25 345 5; M 350 45 Q 340 25 345 5; M 350 45 Q 360 25 345 5" dur="2.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
};
