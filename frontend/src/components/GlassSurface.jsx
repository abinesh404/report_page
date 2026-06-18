import React, { useId, memo } from 'react';

export const GlassSurface = memo(({
  children,
  width = '100%',
  height = 'auto',
  borderRadius = 28,
  className = '',
  displace = 1,
  distortionScale = -100,
  redOffset = 0,
  greenOffset = 0,
  blueOffset = 0,
  brightness = 100,
  opacity = 1,
  blur = 10000,
  mixBlendMode = 'normal',
  style = {},
  ...props
}) => {
  const baseId = useId();
  const filterId = `glass-distortion-${baseId.replace(/:/g, '')}`;

  const finalRedScale = (distortionScale + redOffset) * displace;
  const finalGreenScale = (distortionScale + greenOffset) * displace;
  const finalBlueScale = (distortionScale + blueOffset) * displace;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        height,
        borderRadius: `${borderRadius}px`,
        opacity,
        ...style
      }}
      {...props}
    >
      {/* SVG filter container for displacement and chromatic aberration */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            {/* Generate low-frequency noise for smooth glass lens refraction */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.003 0.003"
              numOctaves="1"
              seed="42"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="5.0" result="blurredNoise" />

            {/* Red Channel Displacement */}
            <feColorMatrix in="SourceGraphic" type="matrix" values="
              1 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0" result="redChannel" />
            <feDisplacementMap
              in="redChannel"
              in2="blurredNoise"
              scale={finalRedScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacedRed"
            />

            {/* Green Channel Displacement */}
            <feColorMatrix in="SourceGraphic" type="matrix" values="
              0 0 0 0 0
              0 1 0 0 0
              0 0 0 0 0
              0 0 0 1 0" result="greenChannel" />
            <feDisplacementMap
              in="greenChannel"
              in2="blurredNoise"
              scale={finalGreenScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacedGreen"
            />

            {/* Blue Channel Displacement */}
            <feColorMatrix in="SourceGraphic" type="matrix" values="
              0 0 0 0 0
              0 0 0 0 0
              0 0 1 0 0
              0 0 0 1 0" result="blueChannel" />
            <feDisplacementMap
              in="blueChannel"
              in2="blurredNoise"
              scale={finalBlueScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacedBlue"
            />

            {/* Recombine channels with screen blend */}
            <feBlend in="displacedRed" in2="displacedGreen" mode="screen" result="rgBlend" />
            <feBlend in="rgBlend" in2="displacedBlue" mode="screen" result="rgbBlend" />

            {/* Apply brightness/contrast transfer */}
            <feComponentTransfer in="rgbBlend">
              <feFuncR type="linear" slope={brightness / 100} />
              <feFuncG type="linear" slope={brightness / 100} />
              <feFuncB type="linear" slope={brightness / 100} />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Refracted frosted glass backdrop layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backdropFilter: `blur(${blur}px) saturate(1.8) brightness(1.05)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(1.8) brightness(1.05)`,
          background: 'rgba(255, 255, 255, 0.05)',
          filter: `url(#${filterId})`,
          mixBlendMode,
          pointerEvents: 'none',
          borderRadius: 'inherit'
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
});

export default GlassSurface;
