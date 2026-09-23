import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <Logo className="text-sm" />
        <p className="text-xs text-foreground/50">
          Built for The Ken Case Competition 2026. Financial advice should adapt to the life behind the numbers.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/submission" className="text-xs font-medium text-accent hover:underline">
            Design documentation
          </Link>
          <Link href="/onboard" className="text-xs font-medium text-accent hover:underline">
            Talk to the agent
          </Link>
        </div>
      </div>
    </footer>
  );
}
