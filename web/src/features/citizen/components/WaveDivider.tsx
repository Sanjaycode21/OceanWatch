import React from "react";

interface WaveDividerProps {
  className?: string;
  fill?: string;
  inverted?: boolean;
}

export default function WaveDivider({ className = "", fill = "#F8FAFC", inverted = false }: WaveDividerProps) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className} ${inverted ? "rotate-180" : ""}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-full h-[40px] md:h-[60px]"
      >
        <path
          d="M0,96 C150,72 350,120 500,96 C650,72 850,12 1000,48 C1150,84 1200,96 1200,96 L1200,120 L0,120 Z"
          fill={fill}
          opacity="0.8"
        />
        <path
          d="M0,60 C300,110 400,30 750,70 C1000,95 1100,50 1200,80 L1200,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
