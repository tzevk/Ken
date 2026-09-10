"use client";

import { usePathname } from "next/navigation";
import {
  ACCENT_THEMES,
  DASHBOARD_PANELS,
  usePreferencesStore,
  type ColorMode,
} from "@/lib/store/preferencesStore";

const MODE_OPTIONS: { id: ColorMode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export default function CustomizePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const accent = usePreferencesStore((s) => s.accent);
  const setAccent = usePreferencesStore((s) => s.setAccent);
  const colorMode = usePreferencesStore((s) => s.colorMode);
  const setColorMode = usePreferencesStore((s) => s.setColorMode);
  const hiddenPanels = usePreferencesStore((s) => s.hiddenPanels);
  const togglePanel = usePreferencesStore((s) => s.togglePanel);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xs transform overflow-y-auto border-l border-border bg-panel shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Customize appearance"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-sm font-semibold">Customize</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-foreground/50 transition hover:bg-accent-soft hover:text-foreground"
            aria-label="Close customize panel"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8 p-5">
          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">Accent</p>
            <p className="mt-1 text-xs text-foreground/55">The brand palette stays constant — only the accent hue changes.</p>
            <div className="mt-3 flex gap-3">
              {ACCENT_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAccent(t.id)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ring-offset-2 ring-offset-panel transition ${
                    accent === t.id ? "ring-2 ring-foreground" : "ring-1 ring-border"
                  }`}
                  style={{ background: t.swatch }}
                  aria-label={t.label}
                  aria-pressed={accent === t.id}
                  title={t.label}
                />
              ))}
            </div>
          </section>

          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">Appearance</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {MODE_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setColorMode(m.id)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    colorMode === m.id
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-foreground/60 hover:bg-accent-soft/50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </section>

          {pathname === "/dashboard" && (
            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">Dashboard panels</p>
              <p className="mt-1 text-xs text-foreground/55">Show only what matters to you.</p>
              <div className="mt-3 space-y-2">
                {DASHBOARD_PANELS.map((p) => {
                  const visible = !hiddenPanels.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2 text-xs"
                    >
                      <span>{p.label}</span>
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => togglePanel(p.id)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
