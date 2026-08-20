export function normalizeVersion(raw: string): string {
  return String(raw || "")
    .trim()
    .replace(/^v/i, "");
}

function splitVersion(raw: string): { parts: number[]; pre: string } {
  const normalized = normalizeVersion(raw);
  const dash = normalized.indexOf("-");
  const core = dash === -1 ? normalized : normalized.slice(0, dash);
  const pre = dash === -1 ? "" : normalized.slice(dash + 1).toLowerCase();
  const parts = core.split(".").map((n) => {
    const v = parseInt(n, 10);
    return Number.isFinite(v) ? v : 0;
  });
  while (parts.length < 3) parts.push(0);
  return { parts: parts.slice(0, 3), pre };
}

export function compareVersions(a: string, b: string): number {
  const left = splitVersion(a);
  const right = splitVersion(b);
  for (let i = 0; i < 3; i++) {
    if (left.parts[i] !== right.parts[i]) return left.parts[i] - right.parts[i];
  }
  if (!left.pre && right.pre) return 1;
  if (left.pre && !right.pre) return -1;
  return left.pre.localeCompare(right.pre);
}

export function isNewerVersion(remote: string, local: string): boolean {
  return compareVersions(remote, local) > 0;
}

export function isBetaVersion(version: string, releaseName?: string): boolean {
  const text = `${normalizeVersion(version)} ${releaseName || ""}`.toLowerCase();
  return /\b(alpha|beta|rc|pre|preview|canary|nightly)\b/.test(text);
}

export function daysSince(iso: string): number {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, (Date.now() - ms) / 86400000);
}
