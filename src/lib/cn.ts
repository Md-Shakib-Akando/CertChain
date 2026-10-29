/** Minimal className joiner (no external dependency). Falsy values are dropped. */
export function cn(...parts: Array<string | false | null | undefined | 0 | 0n>): string {
  return parts.filter(Boolean).join(' ');
}
