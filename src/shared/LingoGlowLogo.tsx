import React from 'react';

interface LingoGlowLogoProps {
  size?: number;
}

export const LingoGlowLogo: React.FC<LingoGlowLogoProps> = ({ size = 36 }) => {
  const radius = Math.round(size * 0.32);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'var(--clay-accent-gradient)',
        boxShadow: 'var(--clay-accent-shadow)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        width={Math.round(size * 0.68)}
        height={Math.round(size * 0.68)}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Text / speech pill */}
        <rect
          x="3"
          y="10.5"
          width="19"
          height="9"
          rx="4.5"
          fill="rgba(255, 255, 255, 0.94)"
        />
        {/* Glowing golden-yellow highlighter stroke */}
        <path
          d="M8.5 21.5L17.5 8.5"
          stroke="#FACC15"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        {/* Translation sparkle */}
        <path
          d="M22.5 3.5L23.4 5.9L25.8 6.8L23.4 7.7L22.5 10.1L21.6 7.7L19.2 6.8L21.6 5.9L22.5 3.5Z"
          fill="#FEF08A"
        />
      </svg>
    </div>
  );
};
