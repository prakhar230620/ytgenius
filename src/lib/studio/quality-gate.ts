import type { QualityFinding } from "./types";

const BLOCKING_SEVERITIES = new Set(["error", "critical"]);

export function canAdvancePastQualityGate(findings: QualityFinding[]): boolean {
  return !findings.some((finding) => BLOCKING_SEVERITIES.has(finding.severity));
}

export function getRepairableFindings(findings: QualityFinding[]): QualityFinding[] {
  return findings.filter(
    (finding) =>
      (finding.severity === "error" || finding.severity === "critical") &&
      Boolean(finding.repairHint || finding.sceneId || finding.startMs !== undefined),
  );
}

export function shouldEscalateAfterRepairs(attempt: number, maxAttempts: number): boolean {
  return attempt >= maxAttempts;
}
