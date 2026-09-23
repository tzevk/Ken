import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import MermaidDiagram from "@/components/submission/MermaidDiagram";

const TOC = [
  { id: "h-recap", label: "H1–H9 recap" },
  { id: "p1", label: "1 · Attack the generic model" },
  { id: "p2", label: "2 · What counts as a state" },
  { id: "p3", label: "3 · Two machines" },
  { id: "p4", label: "4 · Happy flow" },
  { id: "p5", label: "5 · Unhappy flow" },
  { id: "p6", label: "6 · Abstain" },
  { id: "p7", label: "7 · Confidence, operational" },
  { id: "p8", label: "8 · Failure taxonomy" },
  { id: "p9", label: "9 · Resumability" },
  { id: "p10", label: "10 · Invariants" },
  { id: "p11", label: "11 · Transition table" },
  { id: "p12", label: "12 · Diagrams" },
  { id: "p13", label: "13 · Scenario traces" },
  { id: "p14", label: "14 · Red-team" },
  { id: "p15", label: "15 · Originality test" },
  { id: "p16", label: "16 · Final response" },
  { id: "ledger", label: "Capability ledger" },
  { id: "log", label: "Decision log" },
];

function Section({ id, num, title, children }: { id: string; num: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-24 border-t border-border pt-10 mt-10 first:mt-0 first:border-t-0 first:pt-0">
        <h2 className="flex items-baseline gap-2.5 text-xl font-semibold tracking-tight sm:text-2xl">
          <span className="font-mono text-sm font-medium text-accent">{num}</span>
          {title}
        </h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground/80 sm:text-[15px]">{children}</div>
      </section>
    </Reveal>
  );
}

function Callout({ tone = "accent", children }: { tone?: "accent" | "danger"; children: React.ReactNode }) {
  const border = tone === "danger" ? "border-l-red-500" : "border-l-accent";
  return <div className={`card border-l-[3px] ${border} p-4 sm:p-5`}>{children}</div>;
}

function Table({ head, rows }: { head: string[]; rows: (React.ReactNode[])[] }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap border-b border-border bg-panel-muted px-3 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-foreground/55"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {r.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 align-top text-foreground/80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const mono = "font-mono text-accent";

export default function QuestionThreePage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 pt-14 pb-8">
        <Link href="/submission" className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/55 hover:text-accent">
          <ArrowLeft size={14} strokeWidth={2} aria-hidden />
          Design documentation
        </Link>
        <p className="mt-5 text-sm font-medium uppercase tracking-wide text-accent">Question 3 — states</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Vantage&apos;s runtime state machine
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/75">
          A full audit before an answer: the generic model attacked and discarded, a two-machine design tested on
          its merits, seventeen distinct unhappy paths given seventeen distinct recoveries, then red-teamed and
          checked for originality before being written up for judges.
        </p>

        <div className="mt-7 flex flex-wrap gap-1.5">
          {TOC.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-foreground/60 transition hover:border-accent hover:text-accent"
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-28">
        <Section id="h-recap" num="H1–H9" title="Preserved design decisions">
          <p>Carried forward unchanged from Questions 1 and 2. Everything below is built to hold these, not reinterpret them.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["H1", "Deterministic financial truth. The LLM never performs authoritative arithmetic."],
              ["H2", "Agentic reasoning belongs at the decision moment, not primarily in chat."],
              ["H3", "Consequence, not judgment. Vantage says what changes, never good/bad."],
              ["H4", "Silence is a valid action. Not maximizing interventions is a legitimate outcome."],
              ["H5", "Declining dependency: fewer unnecessary interventions over time, without worse alignment."],
              ["H6", "Accountable for understanding a consequence before commitment, not the user's choice."],
              ["H7", "Conservative L3: bounded autonomy over the attention process, not financial authority."],
              ["H8", "Execution boundary: money movement, debt, goal changes always need explicit human authority."],
              ["H9", "Dynamic autonomy governor: Aₜ = f(P, Cₜ, Rₜ, Dₜ). Permission is a ceiling, never an instruction to act."],
            ].map(([id, text]) => (
              <div key={id} className="rounded-xl border border-border bg-panel-muted/60 p-3.5">
                <p className={`text-xs font-semibold ${mono}`}>{id}</p>
                <p className="mt-1 text-[13px] leading-snug text-foreground/70">{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="p1" num="Part 1" title="Attacking the generic state machine">
          <p>The default shape most teams reach for:</p>
          <Callout>
            <p className={`text-[13px] ${mono}`}>
              USER INPUT → FETCH DATA → ANALYZE → RECOMMEND → USER APPROVES → ACTION → SUCCESS / FAILURE
            </p>
          </Callout>
          <p>Discarded outright, not improved. Six specific reasons it cannot represent Vantage:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li><strong className="text-foreground">No terminal state for correct silence.</strong> Every cycle funnels toward a recommendation — H4 has nowhere to live. &quot;Nothing happened&quot; isn&apos;t a state here; it&apos;s an absence, unauditable later.</li>
            <li><strong className="text-foreground">&quot;ANALYZE&quot; collapses the one boundary the product exists to preserve.</strong> H1 separates deterministic arithmetic from agentic judgment; one box hides that line entirely.</li>
            <li><strong className="text-foreground">&quot;RECOMMEND → APPROVES → ACTION&quot; is the L2 shape</strong>, not conservative L3 (H7). Most events should never generate a proposal at all.</li>
            <li><strong className="text-foreground">No representation of evidence quality.</strong> Directly contradicts H9&apos;s premise that missing data must never silently produce false confidence.</li>
            <li><strong className="text-foreground">SUCCESS/FAILURE is too coarse for H3/H6.</strong> A user proceeding after ASK can be a success; there&apos;s no room for that, nor for ABSTAIN as a third outcome.</li>
            <li><strong className="text-foreground">It&apos;s linear and single-machine.</strong> It can&apos;t express the same stage behaving differently under different evidence conditions — the actual content of H9.</li>
          </ol>
        </Section>

        <Section id="p2" num="Part 2" title="What counts as a state">
          <p>
            A state is a condition where entering it changes at least one of: what Vantage is <em>waiting for</em>,
            what it&apos;s <em>permitted</em> to do, what it <em>believes it knows</em>, what <em>human authority</em>{" "}
            is required, what <em>transition</em> can happen next, or what must be <em>recorded</em>.
          </p>
          <p>
            <strong className="text-foreground">Explicitly not states:</strong> a tool call (implementation detail
            inside a state), a single deterministic calculation (unless its output changes one of the six), a UI
            screen (presentation, not runtime condition), a raw API response (only the validated result can trigger
            a transition), an action (the output of entering a state, not the state itself).
          </p>
          <p>
            This is why &quot;memory updated&quot; — offered as a hypothesis — isn&apos;t modeled as a visited state
            below: nothing ever waits there. It&apos;s an atomic write performed while transitioning into{" "}
            <code className={mono}>CLOSED</code>.
          </p>
        </Section>

        <Section id="p3" num="Part 3" title="Two interconnected machines">
          <p>
            Two machines, not one — and not independent. <strong className="text-foreground">Machine B gates Machine A&apos;s transition guards.</strong>
          </p>
          <h3 className="pt-1 text-sm font-semibold text-foreground">Machine A — Financial Decision Lifecycle</h3>
          <p>
            Per-event, ephemeral: <code className={mono}>OBSERVED → CONTEXT_ASSEMBLED → CONSEQUENCE_COMPUTED → RELEVANCE_ASSESSED → {"{ SILENT | INFORMED | AWAITING_HUMAN_DECISION | ESCALATED | ABSTAINED }"} → CLOSED</code>,
            with <code className={mono}>PENDING_EVIDENCE</code> as a recoverable hold, <code className={mono}>POST_HOC</code> as the late-arrival branch, and <code className={mono}>CORRECTED</code> as a post-closure amendment.
          </p>
          <p>
            The prompt&apos;s &quot;user decision&quot; and &quot;outcome observed&quot; are merged into{" "}
            <code className={mono}>AWAITING_HUMAN_DECISION</code>&apos;s resolution — at this design stage, Vantage has
            no execution power, so the human&apos;s response <em>is</em> the outcome.
          </p>
          <h3 className="pt-1 text-sm font-semibold text-foreground">Machine B — Autonomy Governor</h3>
          <p>
            <strong className="text-foreground">Not an independently-persisted, transitioning machine.</strong>{" "}
            <strong>P</strong> (the standing mandate) is real persisted state, changed only by explicit user action.{" "}
            <strong>Cₜ, Rₜ, Dₜ</strong> are computed fresh at each checkpoint — there&apos;s no history to recover,
            because they aren&apos;t stored, they&apos;re recalculated.
          </p>
          <p>Machine B&apos;s output — what Machine A&apos;s guards actually read — is one of four operating envelopes:</p>
          <Table
            head={["Envelope", "Meaning"]}
            rows={[
              [<span key="a" className={mono}>FULL_ENVELOPE</span>, "Ceiling P fully usable"],
              [<span key="b" className={mono}>CONTRACTED_ENVELOPE</span>, "Governor voluntarily restricts below P — forces INFORM over SILENT, or ASK over autonomous handling"],
              [<span key="c" className={mono}>ABSTAIN_REQUIRED</span>, "Evidence too poor to exercise any of P safely"],
              [<span key="d" className={mono}>MANDATE_EXCEEDED</span>, "The needed action sits outside P entirely, regardless of evidence quality"],
            ]}
          />
          <p>This directly implements H9: P alone never causes an action; the governor decides how much of P is currently earned.</p>
        </Section>

        <Section id="p4" num="Part 4" title="Happy flow — three legitimate successes">
          <h3 className="text-sm font-semibold text-foreground">A · Correct silence</h3>
          <p>
            <strong>Entry</strong> <code className={mono}>OBSERVED</code>, deduplicated by transaction id.{" "}
            <strong>Evidence</strong>: budget position, buffer, at-risk goals, intervention history — all complete,
            fresh, corroborated. <strong>Calculation</strong>: no goal delta crosses the material threshold; buffer
            floor holds with margin. <strong>Reasoning</strong>: governor = FULL_ENVELOPE, not material.{" "}
            <strong>Trigger</strong> → <code className={mono}>SILENT</code>. <strong>Logged</strong>: an Intervention
            record with the trigger facts and evidence snapshot — an auditable non-event, not a missed one.{" "}
            <strong>Why no interaction</strong>: H4 — declining to interrupt <em>is</em> the success here.{" "}
            <strong>Later verification</strong>: a subsequent goal divergence tracing back to this transaction
            unflagged is revisited through the correction protocol (U12).
          </p>
          <h3 className="pt-1 text-sm font-semibold text-foreground">B · Useful information, no friction</h3>
          <p>
            Same through <code className={mono}>CONSEQUENCE_COMPUTED</code>; delta is material but not critical →
            autonomous <code className={mono}>INFORMED</code>. A consequence statement is generated and shown — a
            date shift, not a verdict — with nothing to approve. No acknowledgment required, by design (H4). Closes
            on delivery, not on being read.
          </p>
          <h3 className="pt-1 text-sm font-semibold text-foreground">C · Human decision at the boundary</h3>
          <p>
            Same through <code className={mono}>CONSEQUENCE_COMPUTED</code>; a deterministic protected-floor or
            committed-obligation guardrail fires <em>independent of the softer classifier</em>, forcing{" "}
            <code className={mono}>AWAITING_HUMAN_DECISION</code> regardless of how good the evidence otherwise is.
            Vantage may show the computed consequence and which priority is at risk — never whether the purchase is
            good or bad (H3), and never withhold the transaction itself (H8). Options: continue or reconsider.
            Continue → <code className={mono}>CLOSED</code>, <strong>recorded as success if disclosure was accurate
            and timely</strong>, exactly as H6 requires. Never writes to a standing preference on its own — only a
            separate, explicit user action does that (U10).
          </p>
        </Section>

        <Section id="p5" num="Part 5" title="Unhappy flow — seventeen distinct failures">
          <p>Different failures, different semantics, different recovery. No single generic ERROR state anywhere.</p>
          <Table
            head={["Case", "Distinction", "Transition rule"]}
            rows={[
              [<span key="1" className={mono}>U1 Missing</span>, "Fact absent, required for this compute", "→ ABSTAIN_REQUIRED, resolves per downside"],
              [<span key="2" className={mono}>U2 Stale</span>, "Fact exists, past freshness threshold", "→ CONTRACTED_ENVELOPE; SILENT unavailable even if numbers support it"],
              [<span key="3" className={mono}>U3 Conflicting</span>, "Sources disagree beyond tolerance", "Quarantine field; unaffected calcs proceed; affected → PENDING_EVIDENCE or ABSTAINED"],
              [<span key="4" className={mono}>U4 Rail down</span>, "Capability, not epistemic", "Context/consequence unaffected; only an execution-linked offer becomes unavailable"],
              [<span key="5" className={mono}>U5 Outside mandate</span>, "Authority, independent of confidence", "→ MANDATE_EXCEEDED regardless of Cₜ"],
              [<span key="6" className={mono}>U6 High conf./high stakes</span>, "Confidence ≠ permission", "Protected-boundary hit forces human control even at full confidence"],
              [<span key="7" className={mono}>U7 Low conf./low stakes</span>, "Bothering the user is itself a cost", "Low Dₜ → silent-logged abstention, not a clarification request"],
              [<span key="8" className={mono}>U8 Ignored INFORM</span>, "Silence ≠ disagreement", "Recorded as no_acknowledgment; never used to infer anything"],
              [<span key="9" className={mono}>U9 Proceeds after ASK</span>, "Not automatically a failure", "= Happy Path C, restated"],
              [<span key="10" className={mono}>U10 Repeated overrides</span>, "Observed ≠ explicit ≠ inferred preference", "Pattern → a single explicit meta-ASK, never a silent threshold change"],
              [<span key="11" className={mono}>U11 Goal changes</span>, "Legitimate trigger, not a failure", "Invalidates cached consequence for open instances only"],
              [<span key="12" className={mono}>U12 Prior wrong</span>, "Needs a correction protocol", "New linked CORRECTED record; source reliability downgraded"],
              [<span key="13" className={mono}>U13 Malformed output</span>, "Technical ≠ financial uncertainty", "Never becomes a fact; bounded retry, then ABSTAINED (technical-fault)"],
              [<span key="14" className={mono}>U14 Duplicate</span>, "Idempotency", "Dedup key checked at entry; no second instance or effect"],
              [<span key="15" className={mono}>U15 Post-commit</span>, "A fourth failure kind — see Part 8", "→ POST_HOC; never counted as an H6 success"],
              [<span key="16" className={mono}>U16 Permission revoked</span>, "P changes immediately", "Autonomous tier narrows going forward; history retained"],
              [<span key="17" className={mono}>U17 Obligation at risk</span>, "Scope, not a new state", "ASK if this transaction is proximate cause; ESCALATE if standing pattern"],
            ]}
          />
        </Section>

        <Section id="p6" num="Part 6" title="Abstain, as a first-class outcome">
          <p>
            Confirmed necessary (U1, U7, U13). Not one state — <strong className="text-foreground">a reason code
            attached to either SILENT or a visible ABSTAINED state, gated by downside</strong>, reusing the same
            governor logic rather than inventing new machinery:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-foreground">Silent-logged abstention</strong> (low Dₜ) — outwardly identical to SILENT, but the record carries <code className={mono}>reason: insufficient_evidence</code> instead of <code className={mono}>reason: not_material</code>.</li>
            <li><strong className="text-foreground">ABSTAINED_WITH_REASON</strong> (mid/high Dₜ) — Vantage states plainly it cannot answer, and why, rather than a number it can&apos;t stand behind.</li>
          </ul>
          <p>
            <strong className="text-foreground">Neither success nor failure</strong>: a successful safety behavior
            under H1/H9, but not an H6 accountability success, since no consequence was actually delivered. Tracked
            as its own KPI — abstention rate.
          </p>
        </Section>

        <Section id="p7" num="Part 7" title="Making confidence operational — no invented score">
          <p>No numeric &quot;AI confidence.&quot; A deterministic rule table over five observable, per-fact factors:</p>
          <Table
            head={["Factor", "Values"]}
            rows={[
              [<span key="a" className={mono}>source_verified</span>, "bool — linked/verified vs. self-reported"],
              [<span key="b" className={mono}>freshness_hours</span>, "time since refresh vs. a per-fact-type threshold"],
              [<span key="c" className={mono}>completeness</span>, "complete / partial / absent"],
              [<span key="d" className={mono}>cross_source_agreement</span>, "agree / disagree / single_source — reuses the existing reconciliation-delta pattern already in the codebase"],
              [<span key="e" className={mono}>rail_availability</span>, "available / degraded / unavailable — capability-dependent actions only"],
            ]}
          />
          <p>
            <strong className="text-foreground">Precedence</strong> — an ordered, short-circuiting cascade, not a
            weighted blend (fixed after the engineer red-team, Part 14): (1) mandate check, always first and
            independent; (2) required-fact-absent; (3) staleness; (4) disagreement; (5)
            protected-boundary/magnitude. First match wins.
          </p>
          <p>
            <strong className="text-foreground">Reversibility</strong>: whether the decision window is still open —
            reusing the Q2 finding that a pre-auth cancel is &quot;reversible for the rail, irreversible for the
            moment.&quot; <strong className="text-foreground">Downside</strong>: protected-boundary proximity (high
            by definition) plus the consequence engine&apos;s own magnitude output.
          </p>
        </Section>

        <Section id="p8" num="Part 8" title="The failure taxonomy, tested for completeness">
          <Table
            head={["Category", "Cases", "Recovery"]}
            rows={[
              ["Epistemic — “we don’t know enough”", "U1, U2, U3, U7", "obtain / verify information"],
              ["Capability — “a rail/tool can’t do it”", "U4, U13", "degrade / fallback / retry"],
              ["Authority — “not permitted”", "U5, U6, U16", "return control to the human"],
            ]}
          />
          <p><strong className="text-foreground">Not a failure at all</strong>, correctly outside the taxonomy: U8, U9, U10, U11, U17.</p>
          <Callout tone="danger">
            <p>
              <strong className="text-foreground">The taxonomy is incomplete.</strong> U15 fits none of the three:
              data can be perfect, the rail fully up, the action inside mandate — and Vantage still misses H6&apos;s
              &quot;before commitment&quot; promise, because the <em>window</em>, not evidence or permission, is
              what failed. A fourth category: <strong className="text-foreground">accountability-window (timing)
              failure</strong>. Recovery is neither obtain-information, degrade, nor escalate — it&apos;s honest
              relabeling: still useful, never counted as a pre-commitment success.
            </p>
          </Callout>
        </Section>

        <Section id="p9" num="Part 9" title="Resumability — no restart from scratch">
          <Table
            head={["Recoverable condition", "Resume point", "Preserved"]}
            rows={[
              ["U2 stale, refresh succeeds", <span key="a" className={mono}>CONTEXT_ASSEMBLED</span>, "event id, facts, non-stale context"],
              ["U4 rail down, retry succeeds", "the specific pending capability check", "whether consequence calc already succeeded independent of the rail"],
              ["U3/U10 clarified", <span key="b" className={mono}>CONSEQUENCE_COMPUTED / RELEVANCE_ASSESSED</span>, "new input plus everything already valid"],
              ["U16 mandate expanded", "only the pending blocked action", "governor re-check only, not the full pipeline"],
            ]}
          />
          <p>Every open/pending instance persists: event id, raw facts, which context calls already succeeded plus values and timestamps, the exact blocking field, and the governor&apos;s last envelope with reason.</p>
        </Section>

        <Section id="p10" num="Part 10" title="Invariants">
          <p>The ten given, held as written, plus three found necessary during construction, and one from red-teaming.</p>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>No authoritative financial consequence from known-invalid inputs.</li>
            <li>The LLM never becomes the source of financial arithmetic.</li>
            <li>No financial execution beyond the current authority ceiling.</li>
            <li>User silence is never approval for a money-moving action.</li>
            <li>Proceeding against Vantage&apos;s information never auto-modifies a standing preference.</li>
            <li>Missing data never silently becomes zero.</li>
            <li>Duplicate events never create duplicate financial effects.</li>
            <li>A post-commitment consequence is never logged as a successful pre-decision intervention.</li>
            <li>High confidence never overrides an authority boundary.</li>
            <li>An explicit instruction overrides an inferred preference.</li>
            <li><strong className="text-foreground">A CLOSED record is immutable; corrections append, never edit history.</strong></li>
            <li><strong className="text-foreground">A field classified absent or unresolved-disagree is never treated as adequate merely because retries were attempted.</strong></li>
            <li><strong className="text-foreground">Every autonomous SILENT/INFORM decision persists the evidence snapshot that justified it.</strong></li>
            <li><strong className="text-foreground">The reasoning step is hard-gated to never exceed the governor&apos;s precomputed ceiling.</strong></li>
          </ol>
        </Section>

        <Section id="p11" num="Part 11" title="Transition table">
          <Table
            head={["Current", "Trigger", "Guard", "Next", "Human?"]}
            rows={[
              ["—", "new event", "not a duplicate", <span key="1" className={mono}>OBSERVED</span>, "No"],
              [<span key="a" className={mono}>OBSERVED</span>, "dedup check", "duplicate key found", <span key="2" className={mono}>CLOSED (no-op)</span>, "No"],
              [<span key="b" className={mono}>OBSERVED</span>, "context fetch", "—", <span key="3" className={mono}>CONTEXT_ASSEMBLED</span>, "No"],
              [<span key="c" className={mono}>CONTEXT_ASSEMBLED</span>, "evidence check", "required fact absent", <span key="4" className={mono}>ABSTAINED</span>, "Maybe"],
              [<span key="d" className={mono}>CONTEXT_ASSEMBLED</span>, "evidence check", "fact stale beyond threshold", <span key="5" className={mono}>PENDING_EVIDENCE</span>, "No"],
              [<span key="e" className={mono}>CONTEXT_ASSEMBLED</span>, "evidence check", "sources disagree", <span key="6" className={mono}>PENDING_EVIDENCE / ABSTAINED</span>, "Maybe"],
              [<span key="f" className={mono}>CONTEXT_ASSEMBLED</span>, "evidence sound", "—", <span key="7" className={mono}>CONSEQUENCE_COMPUTED</span>, "No"],
              [<span key="g" className={mono}>CONSEQUENCE_COMPUTED</span>, "governor", "FULL_ENVELOPE, not material", <span key="8" className={mono}>SILENT</span>, "No"],
              [<span key="h" className={mono}>CONSEQUENCE_COMPUTED</span>, "governor", "FULL_ENVELOPE, material-non-critical", <span key="9" className={mono}>INFORMED</span>, "No"],
              [<span key="i" className={mono}>CONSEQUENCE_COMPUTED</span>, "governor", "protected-floor / obligation hit", <span key="10" className={mono}>AWAITING_HUMAN_DECISION</span>, "Yes"],
              [<span key="j" className={mono}>CONSEQUENCE_COMPUTED</span>, "governor", "MANDATE_EXCEEDED", <span key="11" className={mono}>AWAITING_HUMAN_DECISION</span>, "Yes"],
              [<span key="k" className={mono}>CONSEQUENCE_COMPUTED</span>, "governor", "ABSTAIN_REQUIRED, high Dₜ", <span key="12" className={mono}>ABSTAINED</span>, "No"],
              [<span key="l" className={mono}>CONSEQUENCE_COMPUTED</span>, "governor", "ABSTAIN_REQUIRED, low Dₜ", <span key="13" className={mono}>SILENT (uncertain)</span>, "No"],
              [<span key="m" className={mono}>CONSEQUENCE_COMPUTED</span>, "standing risk pattern", "pattern across cycles", <span key="14" className={mono}>ESCALATED</span>, "Eventually"],
              [<span key="n" className={mono}>AWAITING_HUMAN_DECISION</span>, "user responds", "continue / reconsider", <span key="15" className={mono}>CLOSED</span>, "Yes"],
              [<span key="o" className={mono}>PENDING_EVIDENCE</span>, "refresh/answer", "resolves the block", <span key="16" className={mono}>resume checkpoint</span>, "Maybe"],
              [<span key="q" className={mono}>ABSTAINED (open)</span>, "new evidence in time", "fact now available", <span key="17" className={mono}>CONTEXT_ASSEMBLED</span>, "No"],
              ["any open state", "window closes unmet", "commitment already happened", <span key="18" className={mono}>POST_HOC → CLOSED</span>, "No"],
              [<span key="r" className={mono}>CLOSED</span>, "correction discovered", "—", <span key="19" className={mono}>CORRECTED</span>, "Maybe"],
              ["any state", "mandate revoked", "—", "recomputed next event", "No"],
              ["any open state", "goal changes", "—", <span key="20" className={mono}>CONSEQUENCE_COMPUTED</span>, "No"],
            ]}
          />
        </Section>

        <Section id="p12" num="Part 12" title="Diagrams">
          <h3 className="text-sm font-semibold text-foreground">Judge-facing — readable in ~30 seconds</h3>
          <MermaidDiagram
            caption="Observe → understand → one of four honest endings. Silence, information, and abstention are drawn as equally valid closures; only a protected boundary returns control to a person — and proceeding anyway still closes the loop."
            chart={`stateDiagram-v2
    [*] --> Observed: financial event
    Observed --> Understanding: gather context + compute consequence
    Understanding --> Silent: not material
    Understanding --> Inform: meaningful, not urgent
    Understanding --> Abstain: not enough trustworthy evidence
    Understanding --> HumanDecision: protected boundary at risk
    Silent --> [*]: CLOSED, successful non-event
    Inform --> [*]: CLOSED, informed
    Abstain --> [*]: CLOSED, safety not a verdict
    HumanDecision --> Proceeded: continues
    HumanDecision --> Reconsidered: reconsiders
    Proceeded --> [*]: CLOSED, success if accurate
    Reconsidered --> [*]: CLOSED`}
          />
          <h3 className="pt-2 text-sm font-semibold text-foreground">Detailed engineering diagram</h3>
          <MermaidDiagram
            chart={`stateDiagram-v2
    [*] --> OBSERVED
    OBSERVED --> OBSERVED: duplicate id
    OBSERVED --> CONTEXT_ASSEMBLED
    CONTEXT_ASSEMBLED --> PENDING_EVIDENCE: stale/conflicting
    CONTEXT_ASSEMBLED --> ABSTAINED: fact absent
    CONTEXT_ASSEMBLED --> CONSEQUENCE_COMPUTED: evidence usable
    PENDING_EVIDENCE --> CONTEXT_ASSEMBLED: resolved
    PENDING_EVIDENCE --> ABSTAINED: window closes unresolved
    CONSEQUENCE_COMPUTED --> RELEVANCE_ASSESSED
    state RELEVANCE_ASSESSED {
        [*] --> GovernorCheck
        GovernorCheck --> FullEnvelope
        GovernorCheck --> Contracted
        GovernorCheck --> MandateExceeded
        GovernorCheck --> AbstainRequired
    }
    RELEVANCE_ASSESSED --> SILENT: not material
    RELEVANCE_ASSESSED --> SILENT: abstain + low downside
    RELEVANCE_ASSESSED --> INFORMED: material-non-critical
    RELEVANCE_ASSESSED --> ABSTAINED: abstain + high downside
    RELEVANCE_ASSESSED --> AWAITING_HUMAN_DECISION: protected boundary
    RELEVANCE_ASSESSED --> AWAITING_HUMAN_DECISION: mandate exceeded
    RELEVANCE_ASSESSED --> ESCALATED: standing risk pattern
    AWAITING_HUMAN_DECISION --> CLOSED: continues
    AWAITING_HUMAN_DECISION --> CLOSED: reconsiders
    SILENT --> CLOSED
    INFORMED --> CLOSED
    ABSTAINED --> CLOSED: window closes
    ABSTAINED --> CONTEXT_ASSEMBLED: new evidence in time
    ESCALATED --> CLOSED
    CLOSED --> POST_HOC: arrived after commitment
    CLOSED --> CORRECTED: prior record found wrong
    POST_HOC --> [*]
    CORRECTED --> [*]`}
          />
        </Section>

        <Section id="p13" num="Part 13" title="Six scenario traces">
          <Table
            head={["#", "Scenario", "Trace"]}
            rows={[
              ["1", "₹900 coffee, comfortably ahead, verified data", <span key="a" className={`${mono} text-[12px]`}>OBSERVED → CONTEXT_ASSEMBLED(Full) → CONSEQUENCE_COMPUTED(Δ≈0) → SILENT → CLOSED</span>],
              ["2", "₹18,000 discretionary, verified, within mandate", <span key="b" className="text-[13px]">…→ RELEVANCE_ASSESSED → <span className={mono}>INFORMED</span> (material tier) <em>or</em> <span className={mono}>AWAITING_HUMAN_DECISION</span> (crosses user&apos;s &quot;major&quot; line) → CLOSED</span>],
              ["3", "Same ₹18,000, stale account data", <span key="c" className="text-[13px]">…→ CONTRACTED_ENVELOPE → PENDING_EVIDENCE → refresh succeeds → Scenario 2; or fails → qualified INFORMED / AWAITING_HUMAN_DECISION</span>],
              ["4", "₹3,000, materially conflicting sources", <span key="d" className="text-[13px]">…→ quarantine field → ABSTAIN_REQUIRED, low Dₜ → <span className={mono}>SILENT</span> (insufficient_evidence) → CLOSED</span>],
              ["5", "Large txn, high confidence, requires moving money", <span key="e" className="text-[13px]">…→ mandate check (independent of Cₜ) → <span className={mono}>AWAITING_HUMAN_DECISION</span> (authority, not evidence) → CLOSED</span>],
              ["6", "Informed of a goal delay; user knowingly proceeds", <span key="f" className="text-[13px]">…→ AWAITING_HUMAN_DECISION → continue → CLOSED (SUCCESS)</span>],
            ]}
          />
          <p>
            <strong className="text-foreground">On &quot;identical states = too generic&quot;:</strong> Scenarios 1
            and 4 both end SILENT → CLOSED — deliberately; the external behavior is correctly identical since
            bothering the user isn&apos;t warranted either way. What differs, and must, is the internal reason code.
            Scenarios 2 and 3 show what a model that fails this test would look like: the same transaction taking
            the same outward path regardless of data quality. This one doesn&apos;t.
          </p>
        </Section>

        <Section id="p14" num="Part 14" title="Red-team">
          <div className="space-y-3">
            {[
              ["Engineer", "“Precedence is under-specified when multiple conditions fire at once.” Fixed: an ordered, short-circuiting cascade, not a weighted blend."],
              ["Product manager", "“Isn’t this three if-statements with ceremony?” The common case genuinely collapses to a fast early-exit through FULL_ENVELOPE. Machinery is spent only where a flat rule would silently produce a wrong answer. Not modified."],
              ["Financial-risk reviewer", "“Can the LLM grant itself authority it doesn’t have?” The sharpest hit — nothing stopped the reasoning step from exceeding the governor’s ceiling. Fixed, now Invariant 14: the governor runs as deterministic code before reasoning is invoked."],
              ["User", "“Will this constantly interrupt me?” Fair, and not fully answerable by a state machine — thresholds need real usage data. Structurally biased toward silence in the low-stakes/low-confidence case. Not modified."],
              ["Competition judge", "“Agent, or budgeting workflow with agent vocabulary?” Honest answer: the governor is deterministic by design (H1 requires this). Genuine reasoning is confined to RELEVANCE_ASSESSED, only once the governor has already granted an envelope."],
            ].map(([who, text]) => (
              <div key={who} className="rounded-xl border border-border bg-panel-muted/50 p-4">
                <p className="text-xs font-semibold text-accent">{who}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/75">{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="p15" num="Part 15" title="Originality test">
          <p>
            Honest answer: <strong className="text-foreground">the basic skeleton — observe, assemble, compute,
            decide, act/inform/ask — is not itself unusual.</strong> Three competent teams likely converge on that
            shape. What would not survive independent reproduction:
          </p>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>The governor as a ceiling, not an instruction — four explicit envelopes, permission checked first and independently of evidence.</li>
            <li>Silent-logged vs. visible abstention, gated specifically by downside.</li>
            <li>The discovered fourth failure category — found only by stress-testing the given taxonomy.</li>
            <li>The hard gate: reasoning can only select among governor-permitted options, never exceed the ceiling.</li>
            <li>SILENT&apos;s own audit trail, making &quot;fewer unnecessary interventions&quot; falsifiable rather than a slogan.</li>
          </ol>
        </Section>

        <Section id="p16" num="Part 16" title="Final competition response">
          <blockquote className="card space-y-3 border-l-[3px] border-l-amber p-5 text-[15px] italic leading-relaxed text-foreground/85">
            <p>
              Vantage moves through one lifecycle per financial event it observes: assemble the relevant context,
              compute the deterministic consequence to the user&apos;s own stated goals, then decide how much
              attention the moment deserves. That decision has four honest endings, and only one of them looks
              like a notification.
            </p>
            <p>
              If a transaction doesn&apos;t materially change the user&apos;s goal trajectory, Vantage closes the
              event silently — logged and auditable, treated as a successful outcome, not a missed chance to speak.
              If it&apos;s meaningful but not urgent, Vantage informs: a plain statement of what changed, a date
              shift rather than a verdict, with nothing to approve. If it touches a boundary the user set
              themselves — a minimum emergency buffer, a committed obligation — Vantage&apos;s autonomy contracts
              by rule, not by how confident it feels, and control returns to the person: continue or reconsider,
              with the consequence shown plainly first. A person who sees an accurate consequence and proceeds
              anyway is a success, not a failure — Vantage is accountable for the understanding, never for the
              choice.
            </p>
            <p>
              Before any of that, Vantage checks what it actually knows. If a fact it needs is missing, stale, or
              its sources disagree, its usable autonomy shrinks automatically — permission is a ceiling on what
              Vantage is allowed to do, never an instruction to act regardless of evidence. For something small,
              this usually means Vantage quietly notes its own uncertainty and says nothing, rather than pestering
              the user over a trivial amount. For something consequential, it can instead say so out loud: that it
              doesn&apos;t have enough trustworthy information to tell the user what this decision does to their
              goal, rather than offering a number it can&apos;t stand behind. That is correct safety behavior, not
              a malfunction.
            </p>
            <p>
              Nothing in this design moves money, cancels a payment, or changes a goal on its own. Even where a
              supported payment flow could technically hold a transaction pending confirmation, that step always
              requires the person&apos;s explicit go-ahead in the moment — high confidence in the data never
              substitutes for that authority. When evidence, permission, or timing are ambiguous, the system&apos;s
              default is to say less, not more, and to hand control back to the person rather than guess on their
              behalf.
            </p>
          </blockquote>

          <h3 className="pt-3 text-sm font-semibold text-foreground">Three design insights the state machine exposed</h3>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Silence needed its own audit trail to be a real claim, not a slogan.</li>
            <li>Permission and evidence are genuinely separate axes, not one confidence score.</li>
            <li>The given failure taxonomy was incomplete — the timing/accountability-window gap is the one case where Vantage can be right about everything and still fail H6.</li>
          </ol>

          <h3 className="pt-3 text-sm font-semibold text-foreground">Three claims to avoid making</h3>
          <div className="space-y-2">
            {[
              "Do not claim Vantage can autonomously hold, cancel, or capture a payment through any rail.",
              "Do not claim the standing-mandate/intervention-preference mechanism is live — it is specified here, not built.",
              "Do not claim or imply a numeric AI confidence score exists anywhere in this system.",
            ].map((t, i) => (
              <div key={i} className="rounded-xl border border-red-500/25 bg-red-500/5 p-3.5">
                <p className="text-[13px] leading-relaxed text-foreground/80">
                  <span className="font-mono text-[11px] font-semibold text-red-500">0{i + 1}</span> — {t}
                </p>
              </div>
            ))}
          </div>

          <h3 className="pt-3 text-sm font-semibold text-foreground">Capability gap discovered while constructing the states</h3>
          <p>
            The governor&apos;s precedence logic — mandate check strictly first, and the LLM hard-gated to never
            exceed what the governor permits — has no analogue anywhere in the current codebase.{" "}
            <code className={mono}>evaluateTransaction</code> in <code className={mono}>alerts.ts</code> is flat
            threshold logic with no such gate, no idempotency check, no freshness tracking, and no correction
            protocol. A new build item, not a refinement of something partially built.
          </p>
        </Section>

        <Section id="ledger" num="Ledger" title="Updated Capability Gap Ledger">
          <Table
            head={["Component", "Specified here", "Actual in codebase", "Gap"]}
            rows={[
              ["Financial Decision Lifecycle", "Full 13-state lifecycle, resumable checkpoints", <code key="a" className="text-[12px]">evaluateTransaction</code>, "Entire state machine unbuilt"],
              ["Autonomy Governor", "P/Cₜ/Rₜ/Dₜ → 4 envelopes, deterministic cascade", "No evidence-quality tracking, no mandate table", "Entire governor unbuilt"],
              ["Idempotency", "Dedup key at OBSERVED", "No dedup logic", "New requirement"],
              ["Abstention", "First-class, silent vs. visible, downside-gated", "Does not exist", "New requirement"],
              ["Correction protocol", "CLOSED immutable, append-linked corrections", "No versioning concept", "New requirement"],
              ["LLM authority ceiling", "Reasoning hard-gated below the governor’s ceiling", "No such gate anywhere", "New requirement"],
            ]}
          />
        </Section>

        <Section id="log" num="Log" title="Updated Decision Log">
          <Table
            head={["#", "Decision", "Source"]}
            rows={[
              ["20", "Generic linear model rejected — no silence terminal, no evidence representation", "This phase, Part 1"],
              ["21", "Two-machine design: Machine A gated by Machine B, B modeled as computed output", "This phase, Part 3"],
              ["22", "Machine B output = four envelopes, not raw evidence-quality labels", "This phase, Part 3/7"],
              ["23", "Evidence model built from five observable factors — no invented confidence score", "This phase, Part 7"],
              ["24", "Three-way taxonomy found incomplete; fourth category added, evidenced by U15", "This phase, Part 8"],
              ["25", "ABSTAIN modeled as a downside-gated reason code, not a generic error state", "This phase, Part 6"],
              ["26", "Governor precedence fixed as an ordered cascade after engineering red-team", "This phase, Part 14"],
              ["27", "Recommended, pending ratification: LLM hard-gated below the governor’s ceiling — proposed as H10", "This phase, Part 14"],
            ]}
          />
          <p className="pt-1 text-xs text-foreground/50">Not proceeding to Question 4.</p>
        </Section>
      </div>
    </main>
  );
}
