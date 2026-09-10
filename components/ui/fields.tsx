"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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
  "w-full rounded-lg border border-border bg-panel-muted px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft";

/**
 * A fully-controlled `value={number}` input fights the user mid-edit: the
 * moment the field is cleared, `Number("")` resolves to `0`, so React snaps
 * the display straight back to "0" before the next keystroke lands, and
 * typing "5" becomes "05" forever. This tracks its own display text and
 * only re-syncs from the parent's numeric value when the field isn't
 * focused, so typing behaves normally while the field still always reports
 * a real number to the parent on every change.
 */
export function NumberInput({
  value,
  onChange,
  onBlur,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [text, setText] = useState(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);

  return (
    <input
      type="number"
      inputMode="numeric"
      className={inputClass}
      value={text}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={(e) => {
        focused.current = false;
        setText(String(value));
        onBlur?.(e);
      }}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e);
      }}
      {...rest}
    />
  );
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
