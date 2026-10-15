/** Types de retour proposés aux lecteurs (partagé entre le formulaire, les pages et le serveur). */
export const FEEDBACK_KIND_OPTIONS = [
  { id: "suggestion", label: "Suggestion", hint: "Une amélioration, un réglage" },
  { id: "bug", label: "Un problème", hint: "Quelque chose ne marche pas" },
  { id: "idee", label: "Une idée", hint: "Une envie, une nouveauté" },
  { id: "avis", label: "Mon avis", hint: "Ce que vous aimez (ou pas)" },
  { id: "autre", label: "Autre", hint: "Tout le reste" },
] as const;

export function isFeedbackKindId(value: unknown): value is (typeof FEEDBACK_KIND_OPTIONS)[number]["id"] {
  return FEEDBACK_KIND_OPTIONS.some((kind) => kind.id === value);
}
