import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="DevPulse AI home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && (
        <span className="brand-name">
          DevPulse <em>AI</em>
        </span>
      )}
    </Link>
  );
}
