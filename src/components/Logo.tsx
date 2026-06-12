/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  hideTagline?: boolean;
}

export default function Logo({ className = "", width = "100%", height = "auto", hideTagline = false }: LogoProps) {
  return (
    <svg
      viewBox={hideTagline ? "0 0 250 68" : "0 0 252 88"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      style={{ width, height }}
      id="wavora-vector-logo"
    >
      <defs>
        {/* Gradients for Soundwave Pills */}
        <linearGradient id="pill-grad-2" x1="0" y1="33" x2="0" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="pill-grad-3" x1="0" y1="26" x2="0" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id="pill-grad-4" x1="0" y1="31" x2="0" y2="57" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Gradients for the Tagline Lines */}
        <linearGradient id="left-line-grad" x1="20" y1="70" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
        <linearGradient id="right-line-grad" x1="123" y1="70" x2="173" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* --- WAVORA WORDMARK (Stylized, geometric paths) --- */}
      <g id="wordmark-letters">
        {/* W - Stylized with double-intersecting slants */}
        <path
          d="M 6,32 L 17,56 L 27.5,33.5"
          stroke="#FFFFFF"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 15.5,33.5 L 26,56 L 37,32"
          stroke="#FFFFFF"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* A - Stylish lambda-like caret (no crossbar) */}
        <path
          d="M 45,56 L 56,32 L 67,56"
          stroke="#FFFFFF"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* V */}
        <path
          d="M 75,32 L 86,56 L 97,32"
          stroke="#FFFFFF"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* O - Perfect geometric circle */}
        <circle
          cx="116"
          cy="44"
          r="10.5"
          stroke="#FFFFFF"
          strokeWidth="3.8"
        />

        {/* R */}
        <path
          d="M 134.5,56 L 134.5,32 L 146,32 C 151.5,32 155.5,35.5 155.5,39.5 C 155.5,43.5 151.5,46.5 146,46.5 L 134.5,46.5"
          stroke="#FFFFFF"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 144.5,46.5 L 155.5,56"
          stroke="#FFFFFF"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* A - Stylish lambda-like caret */}
        <path
          d="M 163,56 L 174,32 L 185,56"
          stroke="#FFFFFF"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* --- SOUNDWAVE VISUALIZER ICON --- */}
      <g id="soundwave-icon">
        {/* Pill 1 */}
        <rect
          x="199"
          y="39"
          width="4"
          height="10"
          rx="2"
          fill="#8B5CF6"
        />
        {/* Pill 2 */}
        <rect
          x="207"
          y="31"
          width="4.2"
          height="26"
          rx="2.1"
          fill="url(#pill-grad-2)"
        />
        {/* Pill 3 (Center High-Impact Pill) */}
        <rect
          x="215"
          y="23"
          width="4.5"
          height="42"
          rx="2.25"
          fill="url(#pill-grad-3)"
        />
        {/* Pill 4 */}
        <rect
          x="223"
          y="29"
          width="4.2"
          height="30"
          rx="2.1"
          fill="url(#pill-grad-4)"
        />
        {/* Pill 5 */}
        <rect
          x="231"
          y="39"
          width="4"
          height="10"
          rx="2"
          fill="#06B6D4"
        />
      </g>

      {/* --- LIVE TAGLINE (Glow-infused text & horizontal line metrics) --- */}
      {!hideTagline && (
        <g id="tagline-live">
          {/* Left decorative line */}
          <line
            x1="22"
            y1="70"
            x2="68"
            y2="70"
            stroke="url(#left-line-grad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Centered LIVE word */}
          <text
            x="96.5"
            y="74.5"
            textAnchor="middle"
            fill="#529BFF"
            fontSize="11.5"
            fontWeight="bold"
            fontFamily="monospace, system-ui, sans-serif"
            letterSpacing="5.5"
          >
            LIVE
          </text>

          {/* Right decorative line */}
          <line
            x1="125"
            y1="70"
            x2="171"
            y2="70"
            stroke="url(#right-line-grad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
