import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const LIME = "#C4FF3E";
const BG = "#0A0A0A";
const TEXT = "#FAFAFA";
const TEXT_MUTED = "#A0A0A0";
const BORDER = "#2A2A2A";

function baseTemplate({
  title,
  intro,
  dealTitle,
  amountSol,
  dealId,
  ctaLabel,
  ctaUrl,
  footerNote,
}: {
  title: string;
  intro: string;
  dealTitle: string;
  amountSol: string;
  dealId: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote?: string;
}) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
  </head>
  <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:${TEXT};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:${BG};">
            <tr>
              <td style="padding:0 0 32px 0;">
                <div style="color:${LIME};font-size:11px;letter-spacing:2px;text-transform:uppercase;">// ZINCH</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 8px 0;">
                <div style="color:${LIME};font-size:11px;letter-spacing:2px;text-transform:uppercase;">${title}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 24px 0;">
                <h1 style="margin:0;font-size:28px;line-height:1.2;color:${TEXT};font-weight:700;letter-spacing:-0.5px;">${dealTitle}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 32px 0;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:${TEXT_MUTED};">${intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 32px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${BORDER};background:#161616;">
                  <tr>
                    <td style="padding:24px;">
                      <div style="color:${TEXT_MUTED};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Deal amount</div>
                      <div style="color:${LIME};font-size:36px;font-weight:700;letter-spacing:-1px;font-variant-numeric:tabular-nums;">${amountSol} <span style="font-size:14px;color:${TEXT_MUTED};font-weight:400;letter-spacing:0;">SOL</span></div>
                      <div style="color:${TEXT_MUTED};font-size:11px;margin-top:12px;">Deal #${dealId.slice(0, 8).toUpperCase()}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 40px 0;">
                <a href="${ctaUrl}" style="display:inline-block;background:${LIME};color:${BG};padding:14px 28px;text-decoration:none;font-size:14px;font-weight:500;letter-spacing:-0.2px;">${ctaLabel}</a>
              </td>
            </tr>
            ${footerNote ? `
            <tr>
              <td style="padding:0 0 24px 0;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:${TEXT_MUTED};">${footerNote}</p>
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding:32px 0 0 0;border-top:1px solid ${BORDER};">
                <div style="color:${TEXT_MUTED};font-size:11px;line-height:1.6;">
                  Zinch — trust infrastructure for crypto work agreements.<br/>
                  Built on Solana. <a href="${APP_URL}" style="color:${LIME};text-decoration:none;">zinch.app</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}

type EmailContext = {
  toEmail: string;
  toRole: "worker" | "client";
  dealId: string;
  dealTitle: string;
  amountLamports: number;
};

const TEMPLATES: Record<string, (ctx: EmailContext) => { subject: string; html: string }> = {
  accepted: (ctx) => ({
    subject: `Deal accepted: ${ctx.dealTitle}`,
    html: baseTemplate({
      title: "// DEAL ACCEPTED",
      intro:
        ctx.toRole === "worker"
          ? "Your client accepted the deal. They need to fund the escrow next before you start work."
          : "You accepted this deal. Next step: fund the escrow so the worker can begin.",
      dealTitle: ctx.dealTitle,
      amountSol: (ctx.amountLamports / 1e9).toFixed(4),
      dealId: ctx.dealId,
      ctaLabel: "View deal",
      ctaUrl: `${APP_URL}/d/${ctx.dealId}`,
    }),
  }),
  funded: (ctx) => ({
    subject: `Escrow funded: ${ctx.dealTitle}`,
    html: baseTemplate({
      title: "// ESCROW FUNDED",
      intro:
        ctx.toRole === "worker"
          ? "The client locked funds in escrow. You can start work now. When you're done, submit the delivery and payment will be released."
          : "You funded the escrow. The worker can now start on the deal. Funds are locked on-chain until you approve or the auto-release timer expires.",
      dealTitle: ctx.dealTitle,
      amountSol: (ctx.amountLamports / 1e9).toFixed(4),
      dealId: ctx.dealId,
      ctaLabel: "View deal",
      ctaUrl: `${APP_URL}/d/${ctx.dealId}`,
    }),
  }),
  submitted: (ctx) => ({
    subject: `Work submitted: ${ctx.dealTitle}`,
    html: baseTemplate({
      title: "// WORK SUBMITTED",
      intro:
        ctx.toRole === "client"
          ? "The worker submitted their work as delivered. Review it and approve to release payment, or open a dispute if something is off. If you take no action, funds auto-release to the worker."
          : "You submitted the work. The client will now review. If they don't respond, the auto-release timer will pay you automatically.",
      dealTitle: ctx.dealTitle,
      amountSol: (ctx.amountLamports / 1e9).toFixed(4),
      dealId: ctx.dealId,
      ctaLabel: "View deal",
      ctaUrl: `${APP_URL}/d/${ctx.dealId}`,
    }),
  }),
  completed: (ctx) => ({
    subject: `Deal complete: ${ctx.dealTitle}`,
    html: baseTemplate({
      title: "// DEAL COMPLETED",
      intro:
        ctx.toRole === "worker"
          ? "The client approved your work and funds have been released. You've been paid."
          : "You released the funds. This deal is now complete.",
      dealTitle: ctx.dealTitle,
      amountSol: (ctx.amountLamports / 1e9).toFixed(4),
      dealId: ctx.dealId,
      ctaLabel: "View public receipt",
      ctaUrl: `${APP_URL}/r/${ctx.dealId}`,
      footerNote:
        "This deal now has a public on-chain receipt you can share as proof.",
    }),
  }),
  refunded: (ctx) => ({
    subject: `Deal refunded: ${ctx.dealTitle}`,
    html: baseTemplate({
      title: "// DEAL REFUNDED",
      intro:
        ctx.toRole === "client"
          ? "The worker refunded the full amount. Funds are back in your wallet."
          : "You refunded the client. This deal is closed.",
      dealTitle: ctx.dealTitle,
      amountSol: (ctx.amountLamports / 1e9).toFixed(4),
      dealId: ctx.dealId,
      ctaLabel: "View receipt",
      ctaUrl: `${APP_URL}/r/${ctx.dealId}`,
    }),
  }),
  disputed: (ctx) => ({
    subject: `Dispute opened: ${ctx.dealTitle}`,
    html: baseTemplate({
      title: "// DISPUTE OPENED",
      intro:
        "This deal has been frozen. Both parties need to agree on a resolution. Either side can propose a split of the escrowed amount — the other side accepts to execute it on-chain.",
      dealTitle: ctx.dealTitle,
      amountSol: (ctx.amountLamports / 1e9).toFixed(4),
      dealId: ctx.dealId,
      ctaLabel: "Open dispute page",
      ctaUrl: `${APP_URL}/d/${ctx.dealId}`,
    }),
  }),
};

/**
 * Send a state-change notification email. Silently fails on config issues
 * so it never breaks the main API request.
 */
export async function sendStateChangeEmail(
  event:
    | "accepted"
    | "funded"
    | "submitted"
    | "completed"
    | "refunded"
    | "disputed",
  ctx: EmailContext
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("[email] Skipped — RESEND_API_KEY not set");
      return;
    }
    if (!ctx.toEmail) {
      console.log(`[email] Skipped ${event} — no email for ${ctx.toRole}`);
      return;
    }

    const template = TEMPLATES[event];
    if (!template) return;

    const { subject, html } = template(ctx);

    const result = await resend.emails.send({
      from: FROM,
      to: ctx.toEmail,
      subject,
      html,
    });

    console.log(`[email] Sent ${event} to ${ctx.toEmail}:`, result.data?.id || result.error);
  } catch (err) {
    console.error(`[email] Failed to send ${event}:`, err);
  }
}