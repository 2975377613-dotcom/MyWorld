"use client";

import { useEffect, useRef, useState } from "react";

import { useAppSettings } from "@/components/providers/settings-provider";

const PARTICLES = [
  { x: 8, y: 18, size: 5, delay: 0, duration: 18 },
  { x: 14, y: 58, size: 3, delay: 2, duration: 12 },
  { x: 19, y: 37, size: 2, delay: 1, duration: 15 },
  { x: 28, y: 72, size: 4, delay: 5, duration: 17 },
  { x: 31, y: 24, size: 6, delay: 4, duration: 20 },
  { x: 42, y: 16, size: 3, delay: 7, duration: 14 },
  { x: 48, y: 42, size: 2, delay: 0.5, duration: 11 },
  { x: 54, y: 68, size: 5, delay: 3, duration: 19 },
  { x: 61, y: 28, size: 3, delay: 1.5, duration: 16 },
  { x: 66, y: 79, size: 2, delay: 6, duration: 13 },
  { x: 73, y: 36, size: 4, delay: 2.5, duration: 18 },
  { x: 82, y: 19, size: 6, delay: 4.5, duration: 21 },
  { x: 87, y: 55, size: 3, delay: 1.2, duration: 15 },
  { x: 91, y: 74, size: 4, delay: 5.5, duration: 17 },
];

function getParticleCount(level: "off" | "low" | "normal" | "high") {
  switch (level) {
    case "off":
      return 0;
    case "low":
      return 6;
    case "high":
      return PARTICLES.length;
    default:
      return 10;
  }
}

function getGlowOpacity(level: "off" | "low" | "normal" | "high") {
  switch (level) {
    case "off":
      return 0.16;
    case "low":
      return 0.22;
    case "high":
      return 0.38;
    default:
      return 0.28;
  }
}

export function InteractiveBackground() {
  const { uiSettings } = useAppSettings();
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 50, y: 18 });
  const [pointer, setPointer] = useState({ x: 50, y: 18 });

  useEffect(() => {
    if (uiSettings.motionLevel === "off") {
      return;
    }

    const updatePointer = () => {
      setPointer((current) => {
        const nextX = current.x + (targetRef.current.x - current.x) * 0.08;
        const nextY = current.y + (targetRef.current.y - current.y) * 0.08;
        return { x: nextX, y: nextY };
      });

      frameRef.current = window.requestAnimationFrame(updatePointer);
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetRef.current = {
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      };
    };

    frameRef.current = window.requestAnimationFrame(updatePointer);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [uiSettings.motionLevel]);

  const displayPointer =
    uiSettings.motionLevel === "off" ? { x: 50, y: 18 } : pointer;
  const visibleParticles = PARTICLES.slice(0, getParticleCount(uiSettings.motionLevel));
  const glowOpacity = getGlowOpacity(uiSettings.motionLevel);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${displayPointer.x}% ${displayPointer.y}%, rgba(137, 205, 255, ${glowOpacity}), transparent 24%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(110,169,219,0.08)_1px,transparent_1px),linear-gradient(rgba(110,169,219,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/35 to-transparent" />
      <div className="absolute inset-y-0 left-8 w-px bg-gradient-to-b from-sky-300/0 via-sky-300/20 to-sky-300/0" />
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${(displayPointer.x - 50) * 0.18}px, ${(displayPointer.y - 50) * 0.12}px, 0)`,
        }}
      >
        {visibleParticles.map((particle, index) => (
          <span
            key={`${particle.x}-${particle.y}-${index}`}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: `translate3d(${(displayPointer.x - 50) * 0.08 * (index % 3 + 1)}px, ${(displayPointer.y - 50) * 0.06 * ((index % 4) + 1)}px, 0)`,
            }}
          >
            <span
              className="particle-float block rounded-full bg-sky-200/80 shadow-[0_0_18px_rgba(132,201,255,0.28)]"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          </span>
        ))}
      </div>
      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-sky-300/18 blur-3xl" />
      <div className="absolute right-[-7rem] top-1/3 h-96 w-96 rounded-full bg-blue-300/16 blur-3xl" />
    </div>
  );
}
