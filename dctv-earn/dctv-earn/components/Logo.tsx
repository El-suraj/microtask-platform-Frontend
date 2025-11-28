
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export const Logo = ({ className = "h-10 w-auto", variant = 'default' }: LogoProps) => {
  // Colors based on the provided reference image
  const primaryColor = variant === 'white' ? '#ffffff' : '#0a6f37'; // Green or White
  const secondaryColor = variant === 'white' ? '#e2e8f0' : '#881337'; // Dark Red for "AFRICA" text
  const meshColor = '#ffffff'; // White dots/lines inside the map

  return (
    <svg 
      viewBox="0 0 240 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="DCTV Africa Logo"
    >
      {/* --- Map Graphic --- */}
      <g transform="translate(10, 5) scale(0.85)">
        {/* Simplified Africa Map Shape */}
        <path 
          d="M35 10 C 45 5, 55 5, 65 15 C 75 15, 85 25, 80 35 C 85 40, 85 50, 75 60 C 65 70, 55 85, 50 95 C 45 85, 35 75, 25 65 C 15 55, 10 45, 10 35 C 10 25, 20 15, 35 10 Z" 
          fill={primaryColor} 
        />
        
        {/* Network Mesh (Dots) */}
        <circle cx="35" cy="35" r="1.5" fill={meshColor} />
        <circle cx="55" cy="25" r="1.5" fill={meshColor} />
        <circle cx="65" cy="45" r="1.5" fill={meshColor} />
        <circle cx="45" cy="55" r="1.5" fill={meshColor} />
        <circle cx="50" cy="75" r="1.5" fill={meshColor} />
        
        {/* Network Mesh (Lines) */}
        <path d="M35 35 L55 25" stroke={meshColor} strokeWidth="0.5" opacity="0.7" />
        <path d="M55 25 L65 45" stroke={meshColor} strokeWidth="0.5" opacity="0.7" />
        <path d="M65 45 L45 55" stroke={meshColor} strokeWidth="0.5" opacity="0.7" />
        <path d="M45 55 L35 35" stroke={meshColor} strokeWidth="0.5" opacity="0.7" />
        <path d="M45 55 L50 75" stroke={meshColor} strokeWidth="0.5" opacity="0.7" />
      </g>

      {/* --- Text: DCTV --- */}
      <text 
        x="90" 
        y="65" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontWeight="900" 
        fontSize="52" 
        fill={primaryColor}
        style={{ letterSpacing: '-2px' }}
      >
        DCTV
      </text>

      {/* --- Subtext: AFRICA --- */}
      <g transform="translate(92, 82)">
        {/* Left Line */}
        <rect x="0" y="5" width="20" height="1" fill={secondaryColor} />
        
        {/* Text */}
        <text 
          x="26" 
          y="10" 
          fontFamily="Arial, Helvetica, sans-serif" 
          fontWeight="bold" 
          fontSize="12" 
          fill={secondaryColor}
          style={{ letterSpacing: '3px' }}
        >
          AFRICA
        </text>
        
        {/* Right Line */}
        <rect x="108" y="5" width="20" height="1" fill={secondaryColor} />
      </g>
    </svg>
  );
};
