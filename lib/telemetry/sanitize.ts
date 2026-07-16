const boilerplatePatterns = [
  /node_modules[\\/]/i,
  /next[\\/]dist[\\/]/i,
  /react-dom[\\/]/i,
  /internal[\\/](?:process|modules|timers)/i,
  /^\s*at (?:processTicksAndRejections|runMicrotasks)/i,
  /^\s*at async Promise\.all/i,
];

const secretPatterns: Array<[RegExp, string]> = [
  [/(authorization\s*[:=]\s*)(?:bearer\s+)?[^\s,;]+/gi, "$1[REDACTED]"],
  [/(api[_-]?key\s*[:=]\s*)[^\s,;]+/gi, "$1[REDACTED]"],
  [/(password\s*[:=]\s*)[^\s,;]+/gi, "$1[REDACTED]"],
  [/(token\s*[:=]\s*)[^\s,;]+/gi, "$1[REDACTED]"],
  [/(postgres(?:ql)?:\/\/)[^@\s]+@/gi, "$1[REDACTED]@"],
];

function redactSecrets(value: string): string {
  return secretPatterns.reduce(
    (sanitized, [pattern, replacement]) => sanitized.replace(pattern, replacement),
    value,
  );
}

export function sanitizeTelemetryText(value: string): string {
  const normalized = value.replace(/\r\n?/g, "\n").replace(/\u0000/g, "");
  const meaningfulLines = normalized
    .split("\n")
    .filter((line) => !boilerplatePatterns.some((pattern) => pattern.test(line)))
    .slice(0, 120)
    .join("\n")
    .trim();

  return redactSecrets(meaningfulLines).slice(0, 24_000);
}
