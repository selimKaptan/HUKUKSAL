"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GaugeChartProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function GaugeChart({ value, size = 280, strokeWidth = 24 }: GaugeChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const halfSize = size / 2;

  const getColor = (val: number) => {
    if (val >= 70) return { stroke: "#10b981", bg: "from-emerald-50 to-emerald-100", text: "text-emerald-600" };
    if (val >= 45) return { stroke: "#f59e0b", bg: "from-amber-50 to-amber-100", text: "text-amber-600" };
    return { stroke: "#ef4444", bg: "from-red-50 to-red-100", text: "text-red-600" };
  };

  const color = getColor(animatedValue);
  const progress = (animatedValue / 100) * circumference;

  const getLabel = (val: number) => {
    if (val >= 70) return "Yüksek İhtimal";
    if (val >= 45) return "Orta İhtimal";
    return "Düşük İhtimal";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        <svg
          width={size}
          height={size * 0.65}
          viewBox={`0 0 ${size} ${size * 0.65}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${halfSize * 0.95} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${halfSize * 0.95}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Animated progress arc */}
          <motion.path
            d={`M ${strokeWidth / 2} ${halfSize * 0.95} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${halfSize * 0.95}`}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.span
            className={`text-6xl font-black ${color.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            %{animatedValue}
          </motion.span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className={`text-lg font-semibold ${color.text}`}
      >
        {getLabel(animatedValue)}
      </motion.div>
    </div>
  );
}
