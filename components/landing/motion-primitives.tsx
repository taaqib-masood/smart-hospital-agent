"use client";

import { animate, motion, useInView, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

/** Subtle fade-up on scroll (fires once). */
export function FadeUp({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Parent wrapper that staggers its <StaggerItem> children on scroll. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.12,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: 0.06 } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-72px" }}
    >
      {children}
    </motion.div>
  );
}

/** Child of <StaggerGroup> — inherits stagger timing. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/** Springy "pop" item for highlighted elements inside a StaggerGroup. */
export const popItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 240, damping: 19 },
  },
};

/** Animated number counter that triggers when scrolled into view. */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.6,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("en-AE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
