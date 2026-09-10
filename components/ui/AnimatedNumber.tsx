"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

/** Smoothly tweens between values whenever `value` changes, instead of snapping. */
export default function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("en-IN"),
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {prefix}
      {format(display)}
      {suffix}
    </span>
  );
}
