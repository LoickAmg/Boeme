export const REPORT_REASON_LABELS = {
  plagiat: "Plagiat ou poème copié",
  illegal: "Contenu illégal",
  haineux: "Propos haineux ou harcèlement",
  spam: "Publicité ou spam",
  autre: "Autre raison",
} as const;

export type ReportReason = keyof typeof REPORT_REASON_LABELS;

export function isReportReason(value: unknown): value is ReportReason {
  return typeof value === "string" && value in REPORT_REASON_LABELS;
}
