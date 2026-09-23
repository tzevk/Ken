"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Renders a Mermaid state diagram client-side. Loaded and initialized lazily
 * so the (fairly large) mermaid bundle never ships on pages that don't use it.
 */
export default function MermaidDiagram({ chart, caption }: { chart: string; caption?: string }) {
  const id = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "neutral",
          securityLevel: "strict",
          fontFamily: "var(--font-sans), sans-serif",
        });
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled) setError("Diagram failed to render.");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  return (
    <figure className="my-5">
      <div className="card overflow-x-auto p-5">
        {error ? (
          <p className="text-sm text-foreground/50">{error}</p>
        ) : (
          <div ref={containerRef} className="flex min-h-[80px] items-center justify-center [&_svg]:mx-auto" />
        )}
      </div>
      {caption && <figcaption className="mt-2 max-w-[70ch] text-xs leading-relaxed text-foreground/55">{caption}</figcaption>}
    </figure>
  );
}
