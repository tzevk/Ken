"use client";

import type { ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-foreground/55">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft";

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" className={inputClass} {...props} />;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className={inputClass} {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} min-h-[84px] resize-y`} {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />;
}
