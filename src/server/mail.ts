import { site } from "@/config/site";

/**
 * Envoi d'e-mails par SMTP (Gmail avec un mot de passe d'application, Brevo, Outlook…).
 * Configuration par variables d'environnement :
 *   SMTP_HOST, SMTP_PORT (465 = TLS direct, 587 = STARTTLS), SMTP_USER, SMTP_PASS, MAIL_FROM.
 * Sans SMTP_HOST, aucun e-mail ne part : en développement, le message est écrit dans la console.
 */
export function mailConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.SMTP_HOST?.trim() && env.SMTP_USER?.trim() && env.SMTP_PASS?.trim());
}

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail(mail: Mail): Promise<boolean> {
  if (!mailConfigured()) {
    if (process.env.NODE_ENV !== "production") console.info(`[e-mail non envoyé : SMTP non configuré]\nÀ : ${mail.to}\nObjet : ${mail.subject}\n\n${mail.text}`);
    return false;
  }
  const { createTransport } = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT ?? 465);
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const from = process.env.MAIL_FROM?.trim() || `${site.name} <${process.env.SMTP_USER}>`;
  await transport.sendMail({ from, to: mail.to, subject: mail.subject, text: mail.text, html: mail.html });
  return true;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

export function passwordResetMail(input: { to: string; name: string; link: string; minutes: number }): Mail {
  const text = [
    `Bonjour ${input.name},`,
    "",
    `Vous avez demandé à changer le mot de passe de votre compte ${site.name}. Ouvrez ce lien pour en choisir un nouveau (valable ${input.minutes} minutes, une seule fois) :`,
    "",
    input.link,
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste valable.",
    "",
    `— ${site.name}`,
  ].join("\n");
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f8f3ec;padding:32px 16px;font-family:Georgia,serif;color:#3a332d">
<div style="max-width:520px;margin:0 auto;background:#fffaf2;border:1px solid #ddccae;border-radius:18px;padding:32px">
<p style="margin:0 0 4px;font-size:28px;font-style:italic">${site.name}</p>
<p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7f5551">Mot de passe</p>
<p style="font-size:17px;line-height:1.6">Bonjour ${escapeHtml(input.name)},</p>
<p style="font-size:17px;line-height:1.6">Vous avez demandé à changer le mot de passe de votre compte. Ce lien est valable ${input.minutes} minutes et ne sert qu'une fois.</p>
<p style="margin:28px 0"><a href="${escapeHtml(input.link)}" style="display:inline-block;background:#3a332d;color:#f8f3ec;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:14px;padding:14px 26px;border-radius:999px">Choisir un nouveau mot de passe</a></p>
<p style="font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#675e58">Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste valable.</p>
</div></body></html>`;
  return { to: input.to, subject: `${site.name} — choisir un nouveau mot de passe`, text, html };
}

export function verificationMail(input: { to: string; name: string; link: string; hours: number }): Mail {
  const text = [
    `Bonjour ${input.name},`,
    "",
    `Bienvenue sur ${site.name}. Confirmez votre adresse e-mail en ouvrant ce lien (valable ${input.hours} heures) :`,
    "",
    input.link,
    "",
    "Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.",
    "",
    `— ${site.name}`,
  ].join("\n");
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f8f3ec;padding:32px 16px;font-family:Georgia,serif;color:#3a332d">
<div style="max-width:520px;margin:0 auto;background:#fffaf2;border:1px solid #ddccae;border-radius:18px;padding:32px">
<p style="margin:0 0 4px;font-size:28px;font-style:italic">${site.name}</p>
<p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7f5551">Bienvenue</p>
<p style="font-size:17px;line-height:1.6">Bonjour ${escapeHtml(input.name)},</p>
<p style="font-size:17px;line-height:1.6">Confirmez votre adresse e-mail pour profiter de ${site.name}. Ce lien est valable ${input.hours} heures.</p>
<p style="margin:28px 0"><a href="${escapeHtml(input.link)}" style="display:inline-block;background:#3a332d;color:#f8f3ec;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:14px;padding:14px 26px;border-radius:999px">Confirmer mon adresse</a></p>
<p style="font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#675e58">Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.</p>
</div></body></html>`;
  return { to: input.to, subject: `${site.name} — confirmez votre adresse e-mail`, text, html };
}

/** Prévient l'administrateur d'un nouveau retour (texte brut + HTML sobre). */
export function feedbackMail(input: { to: string; kind: string; message: string; page: string; from: string; contact: string; adminUrl: string }): Mail {
  const lines = [
    `Nouveau retour sur ${site.name} : ${input.kind}`,
    "",
    input.message,
    "",
    `De : ${input.from || "visiteur anonyme"}${input.contact ? ` (${input.contact})` : ""}`,
    `Page : ${input.page || "inconnue"}`,
    "",
    `Tous les retours : ${input.adminUrl}`,
  ];
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f8f3ec;padding:28px 16px;font-family:Georgia,serif;color:#3a332d">
<div style="max-width:560px;margin:0 auto;background:#fffaf2;border:1px solid #ddccae;border-radius:18px;padding:28px">
<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7f5551">Nouveau retour · ${escapeHtml(input.kind)}</p>
<p style="white-space:pre-line;font-size:18px;line-height:1.6;margin:18px 0">${escapeHtml(input.message)}</p>
<p style="font-family:Arial,sans-serif;font-size:13px;color:#675e58;line-height:1.6">De : ${escapeHtml(input.from || "visiteur anonyme")}${input.contact ? ` — <a href="mailto:${escapeHtml(input.contact)}">${escapeHtml(input.contact)}</a>` : ""}<br>Page : ${escapeHtml(input.page || "inconnue")}</p>
<p style="margin:22px 0 0"><a href="${escapeHtml(input.adminUrl)}" style="display:inline-block;background:#3a332d;color:#f8f3ec;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:999px">Voir tous les retours</a></p>
</div></body></html>`;
  return { to: input.to, subject: `${site.name} — nouveau retour : ${input.kind}`, text: lines.join("\n"), html };
}
