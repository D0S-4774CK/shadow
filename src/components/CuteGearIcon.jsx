import React from 'react';

/**
 * Cute 3D gear illustration component matching the reference screenshot design.
 */
export default function CuteGearIcon({ color = '#FFB6C1', size = 64, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cute-gear-icon ${className}`}
      style={{ filter: 'drop-shadow(2px 3px 0px rgba(0,0,0,0.25))' }}
    >
      <defs>
        <radialGradient id={`gearGrad-${color}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="40%" stopColor={color} />
          <stop offset="100%" stopColor="#8A6BA3" />
        </radialGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Outer Gear Teeth */}
      <path
        d="M50 10
           L56 16 L65 13 L68 22 L77 23 L76 32 L84 37 L79 45 L85 52 
           L77 57 L79 66 L70 68 L66 77 L57 75 L50 82 L43 75 L34 77 
           L30 68 L21 66 L23 57 L15 52 L21 45 L16 37 L24 32 L23 23 
           L32 22 L35 13 L44 16 Z"
        fill={`url(#gearGrad-${color})`}
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner Cute Center Circle */}
      <circle cx="50" cy="50" r="18" fill="#E8DAFF" stroke="#1A1A1A" strokeWidth="3" />
      <circle cx="50" cy="50" r="10" fill="#FFFFFF" opacity="0.9" />

      {/* Playful Sparkles */}
      <path d="M78 20 L80 14 L82 20 L88 22 L82 24 L80 30 L78 24 L72 22 Z" fill="#FFFDE7" stroke="#1A1A1A" strokeWidth="1.5" />
    </svg>
  );
}
