"use client";

import { motion } from "framer-motion";

/**
 * A custom, on-brand illustration (no stock photography) that shows the
 * product's core idea at a glance: a steady path, and the stronger path a
 * single decision (the What if? simulator) opens up. Soft glow blobs give
 * it depth instead of sitting on flat white space, and the lines draw
 * themselves in once, on scroll into view.
 */
export default function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 300" fill="none" className={className} role="presentation">
      <defs>
        <linearGradient id="hero-today-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-whatif-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hero-glow-accent" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-glow-amber" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="90" cy="90" r="130" fill="url(#hero-glow-accent)" />
      <circle cx="400" cy="70" r="150" fill="url(#hero-glow-amber)" />

      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={i}
          x1="16"
          x2="464"
          y1={16 + i * 52}
          y2={16 + i * 52}
          stroke="var(--border)"
          strokeDasharray="1 8"
          strokeLinecap="round"
        />
      ))}

      <path
        d="M16 232 C 100 236, 170 214, 224 188 C 278 162, 330 178, 464 214 L 464 268 L 16 268 Z"
        fill="url(#hero-today-fill)"
      />
      <path
        d="M16 232 C 100 236, 170 214, 224 188 C 300 148, 360 108, 464 40 L 464 268 L 16 268 Z"
        fill="url(#hero-whatif-fill)"
      />

      <motion.path
        d="M16 232 C 100 236, 170 214, 224 188 C 278 162, 330 178, 464 214"
        stroke="var(--foreground)"
        strokeOpacity="0.4"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M224 188 C 300 148, 360 108, 464 40"
        stroke="var(--amber)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <circle cx="224" cy="188" r="5" fill="var(--background)" stroke="var(--foreground)" strokeOpacity="0.5" strokeWidth="2" />
      <motion.circle
        cx="464"
        cy="40"
        r="6"
        fill="var(--amber)"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 1.3 }}
      />

      <text x="16" y="292" fontSize="11" fill="var(--foreground)" fillOpacity="0.4">
        Now
      </text>
      <text x="464" y="292" textAnchor="end" fontSize="11" fill="var(--foreground)" fillOpacity="0.4">
        In 5 years
      </text>
    </svg>
  );
}
