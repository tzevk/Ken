/**
 * The Vantage mark: two strokes meeting at a low point, the right arm
 * finishing higher than the left arm starts. It reads as a "V" and as an
 * ascending line at the same time, the same idea as the net worth chart
 * the product is built around. Drawn on a 32x32 grid, stroke=currentColor
 * so it inherits the accent/contrast tokens wherever it's placed.
 */
export function LogoMark({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M7 9L16 23L25 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="7" r="2.1" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, iconSize = 20, wordmark = true }: { className?: string; iconSize?: number; wordmark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span
        className="flex shrink-0 items-center justify-center rounded-lg bg-accent text-accent-contrast"
        style={{ width: iconSize + 12, height: iconSize + 12 }}
      >
        <LogoMark size={iconSize} />
      </span>
      {wordmark && <span className="font-semibold tracking-tight">Vantage</span>}
    </span>
  );
}
