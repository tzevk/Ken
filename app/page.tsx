import Link from "next/link";
import { DATASET_SIZE } from "@/lib/finance/dataset";

const RAILS = [
  {
    name: "Payments",
    role: "Innovation rail",
    copy:
      "Real-time transaction behaviour lets the agent analyse spending and intervene with contextual feedback exactly at the decision moment — not in a monthly statement review.",
  },
  {
    name: "Logistics",
    role: "Annexation rail",
    copy:
      "Tracks high-value assets from purchase through use to resale, rental, repair or disposal — connecting users to marketplace and service partners when an asset stops earning its keep.",
  },
  {
    name: "Voice",
    role: "Interface rail",
    copy:
      "Sensitive or complex financial situations get discussed naturally, without forcing a person into a rigid form or dashboard to get personalised guidance.",
  },
];

const STEPS = [
  { n: 1, title: "Understand the person", copy: "Income, expenses, and — unlike most apps — the mindset and life plans behind the numbers." },
  { n: 2, title: "Load real financial data", copy: "Link accounts or upload manually; the agent reconciles what you said against what actually happened." },
  { n: 3, title: "Suggest realistic futures", copy: "Multiple goal options sized to actual surplus, not aspiration — so you plan against your data, not a guess." },
  { n: 4, title: "Surface insights", copy: "What your money is actually doing, benchmarked against people who resemble your life stage." },
  { n: 5, title: "Project & benchmark", copy: "Month-by-month net worth trajectory with milestones, checked against peers in the dataset." },
  { n: 6, title: "Live feedback", copy: "Nudges at the moment of a transaction, grounded in your real budget — not generic rules." },
];

export default function LandingPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28">
        <p className="text-sm font-medium tracking-wide text-accent uppercase">The Ken Case Competition 2026</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Financial advice should adapt to the life behind the numbers.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
          Most financial systems categorise people before serving them. Vantage is an agentic co-pilot that starts
          by understanding the person — their family, aspirations, and mindset — before it ever touches a
          transaction. It is built for people whose financial lives don&apos;t fit standard categories: young
          entrepreneurs with poor personal credit, freelancers with irregular income, anyone whose numbers alone
          would mislead a generic advisor.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/onboard"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition hover:opacity-90"
          >
            Talk to the agent
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:bg-accent-soft"
          >
            See the six-step flow
          </Link>
        </div>
        <p className="mt-4 text-xs text-foreground/50">
          Financial profiles simulated against a {DATASET_SIZE.toLocaleString("en-IN")}-record synthetic dataset
          modeled on Kaggle&apos;s Indian Personal Finance and Spending Habits schema. No real bank credentials
          required for this demo.
        </p>
      </section>

      <section className="border-y border-border bg-panel/60">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-base leading-relaxed">
            <span className="font-semibold">The customer insight:</span> personal finance is not a problem of data
            and tech — it&apos;s a problem of understanding, knowledge, and the practice of good decisions. Plenty
            of apps gather data and produce insights. The crux is human behaviour, spending mentality, and a
            person&apos;s relationship with money.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight">How the agent works, in six steps</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-contrast">
                  {s.n}
                </span>
                <h3 className="font-semibold">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">{s.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-panel/60">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Which rails this agent touches</h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground/70">
            We innovate on payments — turning transactions from a historical record into a real-time,
            context-aware intervention point — and annex financial education, teaching users through their own
            decisions rather than generic lessons.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {RAILS.map((r) => (
              <div key={r.name} className="card p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-amber">{r.role}</p>
                <h3 className="mt-1 font-semibold">{r.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">{r.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">The goal is not dependence. It&apos;s independence.</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-foreground/70">
          We&apos;re not trying to make you rely on an assistant forever — we&apos;re trying to make you
          financially smarter, so eventually you need us less.
        </p>
        <Link
          href="/onboard"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition hover:opacity-90"
        >
          Start the six-step flow
        </Link>
      </section>
    </main>
  );
}
