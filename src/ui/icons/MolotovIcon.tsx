import React from 'react';

interface Props extends React.SVGProps<SVGSVGElement> {}

export const MolotovIcon: React.FC<Props> = ({ className = '', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      {/* Flame */}
      <path
        fill="#f97316"
        d="M11.9 0c-1.3 2.1-3.6 4.3-3.6 7 0 1.9 1 3.5 2.5 4.5l.3-.4c-.6-.7-.8-1.5-.7-2.3 1 1 2.3 1.2 3.2.7.5-.3.9-.9 1.2-1.6 0 .8.2 1.6.8 2.2l.4.4c1.3-.9 2.2-2.3 2.2-4 0-2.6-2.2-4.9-3.5-7-1.1-.9-1.9-1.5-2.8.5z"
      />
      {/* Rag */}
      <path
        fill="#e5e5e5"
        d="M11.5 8h1v3h-1zM10.5 9h3v1h-3z"
      />
      {/* Bottle Neck */}
      <path
        fill="#a3e635"
        d="M10 11h4v4h-4z"
      />
      {/* Bottle Body */}
      <path
        fill="#84cc16"
        d="M8 15c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2H8zm2 2h4v5h-4v-5z"
      />
    </svg>
  );
};
