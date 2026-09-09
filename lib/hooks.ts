"use client";

import { useState, useEffect } from "react";

/**
 * Shared animated number count-up hook using requestAnimationFrame
 */
export function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, duration]);

  return val;
}
