import { Resend } from "resend";

const FROM = "TradeLeads AI <noreply@tradeleadsai.de>";
const ADMIN = process.env.ADMIN_EMAIL ?? "tradeleadsai@outlook.com";

// Lazy getter — only instantiate when an email is actually needed,
// so the server boots fine even without RESEND_API_KEY set.
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — emails disabled");
    throw new Error("RESEND_API_KEY missing");
  }
  return new Resend(key);
}

// ─── Welcome email to new lead ────────────────────────────────────────────────
export async function sendWelcomeEmail(lead: {
  name: string;
  email: string;
  trade: string;
  company?: string;
}) {
  const tradeLabels: Record<string, string> = {
    electrician: "Elektriker",
    plumber: "Sanitärinstallateur",
    roofer: "Dachdecker",
    hvac: "Heizung & Klima",
    other: "Handwerker",
  };
  const tradeLabel = tradeLabels[lead.trade] ?? "Handwerker";
  const firstName = lead.name.split(" ")[0];

  try {
    await getResend().emails.send({
      from: FROM,
      to: lead.email,
      subject: `Willkommen bei TradeLeads AI, ${firstName}!`,
      html: `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Willkommen bei TradeLeads AI</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af 0%,#1d4ed8 100%);padding:40px 48px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">TradeLeads</span>
                      <span style="background:#f59e0b;color:#ffffff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;letter-spacing:0.5px;">AI</span>
                    </div>
                    <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">KI-gestütztes Lead-Management für Handwerksbetriebe</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Hallo ${firstName}, herzlich willkommen! 👋</h1>
              <p style="margin:0 0 24px;font-size:16px;color:#6b7280;">Schön, dass du als <strong style="color:#1d4ed8;">${tradeLabel}</strong>${lead.company ? ` von <strong>${lead.company}</strong>` : ""} dabei bist.</p>

              <div style="background:#eff6ff;border-left:4px solid #1d4ed8;border-radius:0 8px 8px 0;padding:20px 24px;margin:0 0 32px;">
                <p style="margin:0;font-size:15px;color:#1e40af;font-weight:600;">Was passiert jetzt?</p>
                <p style="margin:8px 0 0;font-size:14px;color:#374151;">Unser Team meldet sich innerhalb von 24 Stunden bei dir. TradeLeads AI analysiert bereits dein Anfragepotenzial und bereitet passende Leads für dein Gewerk vor.</p>
              </div>

              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 32px;">
                <tr>
                  <td style="padding:0 0 16px;">
                    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border-radius:8px;padding:20px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:28px;height:28px;background:#dbeafe;border-radius:6px;text-align:center;line-height:28px;font-size:14px;">✅</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">Automatische Lead-Qualifizierung</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">KI filtert unpassende Anfragen raus — du siehst nur echte Aufträge</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px;">
                    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border-radius:8px;padding:20px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:28px;height:28px;background:#dbeafe;border-radius:6px;text-align:center;line-height:28px;font-size:14px;">📊</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">Dein persönliches CRM-Dashboard</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Alle Leads, Follow-ups und Umsätze auf einen Blick</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border-radius:8px;padding:20px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:28px;height:28px;background:#dbeafe;border-radius:6px;text-align:center;line-height:28px;font-size:14px;">🔔</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">Tägliche Follow-up Erinnerungen</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Verpasse keinen Rückruf mehr — automatisch jeden Morgen</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://tradeleadsai.de" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.2px;">
                      Zum Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 48px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                TradeLeads AI · tradeleadsai.de<br/>
                Du erhältst diese E-Mail, weil du dich auf unserer Website registriert hast.<br/>
                <a href="mailto:support@tradeleadsai.de" style="color:#6b7280;">Support kontaktieren</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });
  } catch (err) {
    console.error("[email] Welcome email failed:", err);
  }
}

// ─── Admin notification: new lead arrived ────────────────────────────────────
export async function sendAdminNewLeadNotification(lead: {
  name: string;
  email: string;
  trade: string;
  company?: string;
  location?: string;
  projectDescription?: string;
}) {
  const tradeLabels: Record<string, string> = {
    electrician: "Elektriker",
    plumber: "Sanitär",
    roofer: "Dachdecker",
    hvac: "Heizung & Klima",
    other: "Sonstiges",
  };

  try {
    await getResend().emails.send({
      from: FROM,
      to: ADMIN,
      subject: `🔔 Neuer Lead: ${lead.name} (${tradeLabels[lead.trade] ?? lead.trade})`,
      html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /></head>
<body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f4f5;padding:40px 0;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1e40af;padding:24px 32px;">
              <p style="margin:0;color:#bfdbfe;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">TradeLeads AI · Admin</p>
              <h2 style="margin:4px 0 0;color:#ffffff;font-size:20px;">Neuer Lead eingegangen</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;width:120px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;font-weight:600;">${lead.name}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">E-Mail</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${lead.email}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Gewerk</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${tradeLabels[lead.trade] ?? lead.trade}</td></tr>
                ${lead.company ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Firma</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${lead.company}</td></tr>` : ""}
                ${lead.location ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Ort</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${lead.location}</td></tr>` : ""}
                ${lead.projectDescription ? `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;vertical-align:top;padding-top:12px;">Beschreibung</td><td style="padding:8px 0;padding-top:12px;font-size:14px;color:#374151;">${lead.projectDescription}</td></tr>` : ""}
              </table>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px;">
                <tr>
                  <td>
                    <a href="https://tradeleadsai.de/#/app" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:7px;">
                      Im CRM ansehen →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });
  } catch (err) {
    console.error("[email] Admin notification failed:", err);
  }
}

// ─── Daily digest: follow-ups due today ──────────────────────────────────────
export async function sendDailyFollowUpDigest(followUps: Array<{
  id: number;
  leadName: string;
  leadEmail: string;
  scheduledAt: string;
  notes?: string | null;
}>) {
  if (followUps.length === 0) return; // Nothing to send

  const rows = followUps.map(fu => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${fu.leadName}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${fu.leadEmail}</p>
        ${fu.notes ? `<p style="margin:6px 0 0;font-size:13px;color:#374151;background:#f9fafb;padding:8px 10px;border-radius:6px;">${fu.notes}</p>` : ""}
      </td>
    </tr>
  `).join("");

  const today = new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  try {
    await getResend().emails.send({
      from: FROM,
      to: ADMIN,
      subject: `📋 ${followUps.length} Follow-up${followUps.length > 1 ? "s" : ""} heute fällig — TradeLeads AI`,
      html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8" /></head>
<body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f4f5;padding:40px 0;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af 0%,#1d4ed8 100%);padding:28px 32px;">
              <p style="margin:0;color:#bfdbfe;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">TradeLeads AI · Tagesübersicht</p>
              <h2 style="margin:6px 0 4px;color:#ffffff;font-size:22px;">Deine Follow-ups für heute</h2>
              <p style="margin:0;color:#93c5fd;font-size:13px;">${today}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <div style="background:#eff6ff;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:15px;font-weight:700;color:#1e40af;">${followUps.length} Follow-up${followUps.length > 1 ? "s" : ""} warte${followUps.length === 1 ? "t" : "n"} auf dich</p>
                <p style="margin:4px 0 0;font-size:13px;color:#3b82f6;">Ruf heute zurück — schnelle Reaktion erhöht die Abschlussrate um bis zu 60%</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${rows}
              </table>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;">
                <tr>
                  <td>
                    <a href="https://tradeleadsai.de/#/follow-ups" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 30px;border-radius:7px;">
                      Alle Follow-ups öffnen →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">TradeLeads AI · tradeleadsai.de · Täglicher Digest um 07:00 Uhr</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });
  } catch (err) {
    console.error("[email] Daily digest failed:", err);
  }
}
