'use client';

import React from 'react';

interface KinjarIconProps {
  className?: string;
  size?: number;
}

export function KinjarIcon({ className = '', size = 40 }: KinjarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Jar/Container shape */}
      <path
        d="M30 20 L70 20 L75 30 L75 80 Q75 90 65 90 L35 90 Q25 90 25 80 L25 30 Z"
        fill="currentColor"
        opacity="0.2"
      />
      
      {/* Lid */}
      <rect
        x="28"
        y="15"
        width="44"
        height="8"
        rx="2"
        fill="currentColor"
      />
      
      {/* Heart/Family symbol inside */}
      <path
        d="M50 60 L42 50 Q40 46 40 43 Q40 38 43 36 Q46 34 50 38 Q54 34 57 36 Q60 38 60 43 Q60 46 58 50 Z"
        fill="currentColor"
      />
      
      {/* Small circles representing family members */}
      <circle cx="35" cy="60" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="65" cy="60" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="50" cy="72" r="3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
