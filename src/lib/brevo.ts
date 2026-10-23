/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * Uses Brevo Free Plan REST API (POST https://api.brevo.com/v3/smtp/email)
 */

interface SendOtpEmailParams {
  toEmail: string;
  toName: string;
  otp: string;
  studentId: string;
}

export interface BrevoResult {
  success: boolean;
  messageId?: string;
  isSimulated?: boolean;
  otp?: string;
  error?: string;
}

export async function sendBrevoOtpEmail({
  toEmail,
  toName,
  otp,
  studentId,
}: SendOtpEmailParams): Promise<BrevoResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'no-reply@pub.edu.bd';
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'PUB CertChain';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>PUB CertChain Verification OTP</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0d1e36; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d1e36; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0b2545 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                      PUB CertChain
                    </h1>
                    <p style="color: #93c5fd; margin: 6px 0 0; font-size: 13px;">
                      Academic Credential Verification System
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px; color: #1e293b;">
                    <div style="font-size: 16px; font-weight: 700; color: #0b2545; margin-bottom: 12px;">
                      Student Registration — Email Verification
                    </div>
                    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
                      Dear <strong>${toName}</strong> (${studentId}),
                    </p>
                    <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #475569;">
                      You have initiated student registration on the PUB CertChain platform. Use the following 6-digit One-Time Password (OTP) to verify your university email and validate your academic record:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="text-align: center; margin: 28px 0;">
                      <div style="display: inline-block; padding: 16px 36px; background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8;">
                          ${otp}
                        </span>
                      </div>
                      <p style="margin: 10px 0 0; font-size: 12px; color: #64748b;">
                        ⏱️ This verification code is valid for <strong>10 minutes</strong>.
                      </p>
                    </div>

                    <!-- Security Notice -->
                    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 6px; margin: 24px 0 16px;">
                      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #334155;">
                        <strong>Important Security Rule:</strong> Your registration will only succeed if your full name, student ID, department, and batch match the university's official records. Do not disclose this OTP code to anyone.
                      </p>
                    </div>

                    <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                      If you did not request this verification, please ignore this email or notify the Controller of Examinations.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 11px; color: #64748b;">
                      &copy; ${new Date().getFullYear()} Peace University of Bangladesh (PUB) CertChain. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // If no Brevo API key is provided or is a placeholder, log to console in dev mode
  const isPlaceholderKey =
    !apiKey ||
    apiKey.includes('your_brevo_api_key_here') ||
    apiKey === 'xkeysib-' ||
    apiKey.length < 20;

  if (isPlaceholderKey) {
    console.warn('⚠️ [BREVO NOTICE] BREVO_API_KEY is not configured or is a placeholder in .env.local.');
    console.log(`[SIMULATED OTP VIA BREVO] To: ${toEmail} | Name: ${toName} | OTP: ${otp}`);
    return {
      success: true,
      isSimulated: true,
      otp,
      error: 'BREVO_API_KEY is not configured in .env.local (simulated in development mode).',
    };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject: `PUB CertChain Verification OTP: ${otp}`,
        htmlContent,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error('Brevo API Error:', res.status, data);
      const errMsg =
        data?.message || data?.error || `Brevo API rejected request with status ${res.status}`;
      return {
        success: false,
        isSimulated: true,
        otp,
        error: errMsg,
      };
    }

    return {
      success: true,
      messageId: data?.messageId,
    };
  } catch (err) {
    console.error('Brevo Network Exception:', err);
    return {
      success: false,
      isSimulated: true,
      otp,
      error: err instanceof Error ? err.message : 'Network error reaching Brevo API',
    };
  }
}

export interface SendControllerInvitationParams {
  toEmail: string;
  toName: string;
  setupLink: string;
  expiresHours?: number;
}

export async function sendBrevoControllerInvitationEmail({
  toEmail,
  toName,
  setupLink,
  expiresHours = 24,
}: SendControllerInvitationParams): Promise<BrevoResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'no-reply@pub.edu.bd';
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'PUB CertChain';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>PUB CertChain — Controller of Examinations Invitation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0d1e36; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d1e36; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.25);">
                <tr>
                  <td style="background: linear-gradient(135deg, #0b2545 0%, #1e3a8a 100%); padding: 36px 28px; text-align: center;">
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 4px 12px; margin-bottom: 12px;">
                      <span style="color: #60a5fa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Institutional Credential Authority
                      </span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                      PUB CertChain
                    </h1>
                    <p style="color: #93c5fd; margin: 6px 0 0; font-size: 13px;">
                      Primeasia University • Blockchain Academic Verification Network
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px 32px; color: #1e293b;">
                    <div style="font-size: 18px; font-weight: 800; color: #0b2545; margin-bottom: 16px;">
                      Official Invitation: Controller of Examinations
                    </div>
                    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                      Dear <strong>${toName}</strong>,
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                      You have been provisioned by the System Administration as the <strong>Controller of Examinations</strong> for Primeasia University's PUB CertChain platform.
                    </p>
                    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1e293b;">
                        <strong>Role Responsibilities:</strong><br>
                        • Authority over academic issuer verifications &amp; approval.<br>
                        • Smart contract revocation co-signing governance.<br>
                        • Academic audit trail review.
                      </p>
                    </div>
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                      To activate your account and configure your confidential login password, please click the secure setup button below:
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${setupLink}" style="display: inline-block; background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);">
                        Set Up Master Password &rarr;
                      </a>
                    </div>
                    <p style="margin: 24px 0 8px 0; font-size: 12px; color: #64748b;">
                      If the button above does not work, copy and paste this link into your web browser:
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 12px; font-family: monospace; word-break: break-all; color: #2563eb;">
                      ${setupLink}
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #dc2626;">
                      ⚠️ <strong>Security Notice:</strong> This activation link is strictly confidential and will expire in ${expiresHours} hours.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
                    This is an automated transmission from PUB CertChain Institutional Administration.<br>
                    Office of the Registrar &bull; Primeasia University, Dhaka, Bangladesh.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const isPlaceholderKey =
    !apiKey ||
    apiKey.includes('your_brevo_api_key_here') ||
    apiKey === 'xkeysib-' ||
    apiKey.length < 20;

  if (isPlaceholderKey) {
    console.warn('⚠️ [BREVO NOTICE] BREVO_API_KEY is not configured or is a placeholder in .env.local.');
    console.log(`[SIMULATED CONTROLLER INVITATION VIA BREVO] To: ${toEmail} | Name: ${toName} | Setup Link: ${setupLink}`);
    return {
      success: true,
      isSimulated: true,
      error: 'BREVO_API_KEY is simulated in development mode.',
    };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject: `PUB CertChain — Official Invitation: Controller of Examinations Account Setup`,
        htmlContent,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error('Brevo API Error:', res.status, data);
      return {
        success: false,
        isSimulated: true,
        error: data?.message || data?.error || `Brevo API status ${res.status}`,
      };
    }

    return {
      success: true,
      messageId: data?.messageId,
    };
  } catch (err) {
    console.error('Brevo Network Exception:', err);
    return {
      success: false,
      isSimulated: true,
      error: err instanceof Error ? err.message : 'Network error reaching Brevo API',
    };
  }
}
