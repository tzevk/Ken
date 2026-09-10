/**
 * Wordmark-first, on purpose: a rounded-square badge with a thin abstract
 * arrow/checkmark inside is the single most overused "generated fintech
 * logo" pattern there is. Vantage instead just sets its own name with
 * confident tracking and a small square full-stop, the way Wise, Monzo and
 * most serious consumer-finance brands actually do it. The favicon-only
 * mark (public app icon, browser tab) is a separate, bolder geometric V,
 * not this wordmark shrunk down.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-semibold tracking-tight text-foreground ${className ?? ""}`}>
      Vantage
      <span className="ml-[3px] inline-block h-[0.22em] w-[0.22em] shrink-0 translate-y-[-0.62em] bg-amber" aria-hidden />
    </span>
  );
}
