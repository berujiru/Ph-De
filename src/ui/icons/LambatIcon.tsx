import React from 'react';

interface Props extends React.SVGProps<SVGSVGElement> {}

export const LambatIcon: React.FC<Props> = ({ className = '', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      fill="currentColor"
      className={className}
      {...props}
    >
      <defs>
        <radialGradient id="vortexGrad1_icon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d946ef" stopOpacity="1" />
          <stop offset="40%" stopColor="#9333ea" stopOpacity="0.8" />
          <stop offset="80%" stopColor="#4c1d95" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2e1065" stopOpacity="0" />
        </radialGradient>
        
        <radialGradient id="vortexGrad2_icon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="30%" stopColor="#d946ef" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
        </radialGradient>

        <pattern id="netPattern_icon" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M 0 0 L 20 0 L 20 20 L 0 20 Z" fill="none" stroke="#d1d5db" strokeWidth="2" />
          <circle cx="0" cy="0" r="2" fill="#9ca3af" />
          <circle cx="20" cy="0" r="2" fill="#9ca3af" />
          <circle cx="0" cy="20" r="2" fill="#9ca3af" />
          <circle cx="20" cy="20" r="2" fill="#9ca3af" />
        </pattern>
      </defs>

      <circle cx="100" cy="100" r="95" fill="url(#vortexGrad1_icon)" />
      
      <path d="M100 100 Q150 50 180 100 T100 180" fill="none" stroke="url(#vortexGrad2_icon)" strokeWidth="12" strokeLinecap="round" />
      <path d="M100 100 Q50 150 20 100 T100 20" fill="none" stroke="url(#vortexGrad2_icon)" strokeWidth="12" strokeLinecap="round" />
      <path d="M100 100 Q150 150 100 180 T20 100" fill="none" stroke="url(#vortexGrad2_icon)" strokeWidth="8" strokeLinecap="round" />
      <path d="M100 100 Q50 50 100 20 T180 100" fill="none" stroke="url(#vortexGrad2_icon)" strokeWidth="8" strokeLinecap="round" />

      <circle cx="100" cy="100" r="90" fill="url(#netPattern_icon)" />
      
      <circle cx="100" cy="100" r="90" fill="none" stroke="#6b7280" strokeWidth="6" strokeDasharray="8 4" />
    </svg>
  );
};
