/**
 * Custom monoline SVG logo marks for the "trusted by" marquee clinics.
 *
 * Hand-drawn geometric monograms (32×32 viewBox, stroke = currentColor) so the
 * marquee reads like a real SaaS press bar — brand lockups, not icon+label.
 * The whole family shares one visual grammar: 2px monoline strokes, rounded
 * caps/joins, one accent fill per mark at most.
 */

type MarkProps = { className?: string };

/** Nova Medical Center — a "new star": 4-point nova inside an orbit ring. */
export function NovaMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="16" cy="16" r="12.5" stroke="currentColor" />
      <path
        d="M16 8.6l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Gulf Care Clinic — two interleaved sine waves (Gulf waters). */
export function GulfCareMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M4 12.5q3.5-4.5 7 0t7 0t7 0t7 0"
        stroke="currentColor"
      />
      <path
        d="M4 19.5q3.5 4.5 7 0t7 0t7 0t7 0"
        stroke="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

/** Emirates Health Group — a clinical shield with a care cross. */
export function EmiratesHealthMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M16 4.5l9.5 3.5v6.5c0 6.4-4.1 10.6-9.5 13.1-5.4-2.5-9.5-6.7-9.5-13.1V8z"
        stroke="currentColor"
      />
      <path d="M16 12v7M12.5 15.5h7" stroke="currentColor" />
    </svg>
  );
}

/** Prime Medical — rounded-square badge with a "P" monogram. */
export function PrimeMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="5" width="22" height="22" rx="7" stroke="currentColor" />
      <path d="M12.5 23.5V9h5a4.25 4.25 0 0 1 0 8.5h-5" stroke="currentColor" />
    </svg>
  );
}

/** Crescent Care Hospital — the crescent itself. */
export function CrescentMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M18 4A12 12 0 1 0 18 28 17 17 0 0 1 18 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Al Noor Day Surgery — the rub el hizb, two overlapped squares (light). */
export function AlNoorMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9.5" y="9.5" width="13" height="13" stroke="currentColor" />
      <polygon
        points="16,6.8 25.2,16 16,25.2 6.8,16"
        stroke="currentColor"
      />
    </svg>
  );
}
