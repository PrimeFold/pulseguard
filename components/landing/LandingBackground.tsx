"use client";

import dynamic from "next/dynamic";

const AcidSquares = dynamic(() => import("@/components/AcidSquares"), { ssr: false });

export function LandingBackground() {
  return (
    <AcidSquares
      color1="#000000"
      color2="#b8b8b8"
      color3="#888888"
      detail="medium"
      speed={0.7}
      waveDepth={0.6}
      zoom={1.35}
      density={8.5}
      glow={0.75}
      exposure={2350}
      spread={0.3}
      stepSize={0.002}
      colorShift={0}
      contrast={1}
      brightness={1}
      opacity={0.6}
      mouseInteraction
      mouseStrength={0.1}
      mouseRadius={0.39}
      blur={0}
      grain
      grainIntensity={0.1}
    />
  );
}
