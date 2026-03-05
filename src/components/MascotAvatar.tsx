"use client";

import React from "react";

import { IMascotConfig, DEFAULT_MASCOT_CONFIG } from "@/types/mascot";

interface MascotAvatarProps {
  config?: Partial<IMascotConfig>;
  size?: number;
  className?: string;
  svgRef?: React.RefObject<SVGSVGElement>;
}

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  config: configProp,
  size = 80,
  className,
  svgRef,
}) => {
  const config: IMascotConfig = { ...DEFAULT_MASCOT_CONFIG, ...configProp };
  const { bodyColor, eyeType, hairType, clothingType, accessoryType } = config;

  const eyes: Record<string, React.ReactNode> = {
    default: (
      <g id="eyes-default">
        <ellipse cx="72" cy="98" rx="9" ry="10" fill="rgba(0,0,0,0.05)" />
        <ellipse cx="128" cy="98" rx="9" ry="10" fill="rgba(0,0,0,0.05)" />
        <circle cx="72" cy="98" r="7" fill="#1C1C1E" />
        <circle cx="128" cy="98" r="7" fill="#1C1C1E" />
        <circle cx="70" cy="95" r="2.5" fill="white" opacity="0.8" />
        <circle cx="126" cy="95" r="2.5" fill="white" opacity="0.8" />
        <circle cx="74" cy="100" r="1" fill="white" opacity="0.3" />
        <circle cx="130" cy="100" r="1" fill="white" opacity="0.3" />
      </g>
    ),
    anime: (
      <g id="eyes-anime">
        <rect x="65" y="90" width="15" height="20" rx="7" fill="#1C1C1E" />
        <rect x="120" y="90" width="15" height="20" rx="7" fill="#1C1C1E" />
        <rect x="68" y="92" width="6" height="10" rx="3" fill="white" opacity="0.9" />
        <rect x="123" y="92" width="6" height="10" rx="3" fill="white" opacity="0.9" />
      </g>
    ),
    star: (
      <g id="eyes-star" fill="#FFD60A">
        <path
          d="M72,88 L75,95 L82,95 L77,100 L79,107 L72,103 L65,107 L67,100 L62,95 L69,95 Z"
          filter="url(#glow)"
        />
        <path
          d="M128,88 L131,95 L138,95 L133,100 L135,107 L128,103 L121,107 L123,100 L118,95 L125,95 Z"
          filter="url(#glow)"
        />
      </g>
    ),
  };

  const hair: Record<string, React.ReactNode> = {
    none: null,
    cap: (
      <path
        d="M50,80 Q45,30 100,30 Q155,30 150,80 Q130,60 100,60 Q70,60 50,80"
        fill="url(#hairGradient)"
        filter="url(#softShadow)"
      />
    ),
    bandage: (
      <g filter="url(#softShadow)">
        <path d="M50,70 Q100,30 150,70 L155,85 Q100,50 45,85 Z" fill="#323232" />
        <path d="M40,85 L160,85 L165,95 L35,95 Z" fill="#1C1C1E" />
        <rect x="90" y="55" width="20" height="10" fill="#FFD60A" rx="2" />
      </g>
    ),
  };

  const clothing: Record<string, React.ReactNode> = {
    none: null,
    raincoat: (
      <g filter="url(#softShadow)">
        <path d="M50,145 Q100,135 150,145 L165,200 H35 Z" fill="#1C1C1E" />
        <path d="M100,145 L85,200 H115 Z" fill="#3A3A3C" />
        <circle cx="85" cy="165" r="3" fill="#32D74B" filter="url(#glow)" />
        <path d="M130,155 L145,185" stroke="white" strokeWidth="2" opacity="0.2" />
      </g>
    ),
    kimono: (
      <g filter="url(#softShadow)">
        <path d="M50,145 Q100,135 150,145 L160,200 H40 Z" fill="#64D2FF" />
        <path d="M100,145 L60,200 M100,145 L140,200" stroke="white" strokeWidth="8" />
        <rect x="70" y="165" width="60" height="15" fill="#FF375F" />
      </g>
    ),
  };

  const accessories: Record<string, React.ReactNode> = {
    none: null,
    antenna: (
      <g>
        <rect x="98" y="25" width="4" height="25" fill="url(#metalGradient)" />
        <circle cx="100" cy="18" r="9" fill="url(#orbGradient)" filter="url(#glow)" />
        <circle cx="97" cy="15" r="3" fill="white" opacity="0.5" />
      </g>
    ),
    anon: (
      <g filter="url(#softShadow)">
        <rect x="55" y="85" width="90" height="25" rx="5" fill="#1C1C1E" />
        <path d="M60,90 H140" stroke="#0A84FF" strokeWidth="2" filter="url(#glow)" />
      </g>
    ),
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ overflow: "visible" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="0" dy="6" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <radialGradient id="skinBase" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="60%" stopColor={bodyColor} stopOpacity="1" />
          <stop offset="100%" stopColor="black" stopOpacity="0.15" />
        </radialGradient>
        <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8E8E93" />
          <stop offset="50%" stopColor="#D1D1D6" />
          <stop offset="100%" stopColor="#8E8E93" />
        </linearGradient>
        <radialGradient id="orbGradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FF9F0A" />
          <stop offset="100%" stopColor="#FF375F" />
        </radialGradient>
        <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5856D6" />
          <stop offset="100%" stopColor="#2C2C2E" />
        </linearGradient>
      </defs>

      {/* Legs */}
      <g filter="url(#softShadow)">
        <rect x="72" y="175" width="22" height="20" rx="11" fill={bodyColor} />
        <rect x="106" y="175" width="22" height="20" rx="11" fill={bodyColor} />
      </g>

      {/* Ears */}
      <g id="ears">
        <path d="M40,90 Q25,90 25,70 Q25,50 45,60" fill={bodyColor} stroke="rgba(0,0,0,0.05)" />
        <path d="M38,85 Q30,85 30,72 Q30,60 42,65" fill="black" opacity="0.05" />
        <path
          d="M160,90 Q175,90 175,70 Q175,50 155,60"
          fill={bodyColor}
          stroke="rgba(0,0,0,0.05)"
        />
        <path d="M162,85 Q170,85 170,72 Q170,60 158,65" fill="black" opacity="0.05" />
      </g>

      {/* Body */}
      <g filter="url(#softShadow)">
        <path
          d="M100,45 C60,45 45,70 45,100 C45,135 60,150 100,150 C140,150 155,135 155,100 C155,70 140,45 100,45 Z"
          fill={bodyColor}
        />
        <path
          d="M100,45 C60,45 45,70 45,100 C45,135 60,150 100,150 C140,150 155,135 155,100 C155,70 140,45 100,45 Z"
          fill="url(#skinBase)"
        />
        <ellipse cx="100" cy="55" rx="30" ry="8" fill="white" opacity="0.3" filter="url(#glow)" />
      </g>

      {/* Dynamic layers */}
      {clothing[clothingType]}
      {eyes[eyeType]}
      {hair[hairType]}
      {accessories[accessoryType]}
    </svg>
  );
};
