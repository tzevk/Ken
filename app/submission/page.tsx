import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

const DOCS: {
  question: string;
  title: string;
  summary: string;
  href: string;
}[] = [
  {
    question: "Question 3",
    title: "Vantage's runtime state machine",
    summary:
      "The full audit behind the states-and-flows answer: the generic model attacked and discarded, a two-machine design (an event lifecycle gated by an autonomy governor), seventeen distinct unhappy paths with separate recoveries, red-team findings, and the final submission answer with diagrams and a transition table.",
    href: "/submission/question-3",
  },
];

export default function SubmissionPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-10">
        <Stagger>
          <StaggerItem>
            <p className="text-sm font-medium tracking-wide text-accent uppercase">The Ken Case Competition 2026</p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Design documentation
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/75">
              The working documents behind Vantage&apos;s answers to the competition&apos;s design questions: what
              got attacked and discarded, what evidence changed the architecture, and the human decisions made
              along the way. This page will grow as more questions get written up.
            </p>
          </StaggerItem>
        </Stagger>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="flex flex-col gap-5">
          {DOCS.map((doc, i) => (
            <Reveal key={doc.question} delay={i * 0.06}>
              <Link href={doc.href} className="card block p-6 transition hover:-translate-y-0.5 hover:shadow-md sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber">{doc.question}</p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{doc.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">{doc.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  <FileText size={15} strokeWidth={2} aria-hidden />
                  Read the full document
                  <ArrowRight size={14} strokeWidth={2} aria-hidden />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10">
          <p className="text-sm text-foreground/60">
            Looking for the product itself?{" "}
            <Link href="/onboard" className="font-medium text-accent hover:underline">
              Try the six-step flow
            </Link>
            .
          </p>
        </Reveal>
      </section>
    </main>
  );
}
