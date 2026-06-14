const { Resend } = require('resend');
const { formatIST } = require('./helpers');

const resend = new Resend(process.env.RESEND_API_KEY);

const buildInquiryEmailHtml = (inquiry) => {
  const rows = [
    ['Full Name', inquiry.fullName],
    ['Phone Number', inquiry.phoneNumber],
    ['Email', inquiry.emailAddress || '—'],
    ['City', inquiry.city || '—'],
    ['Project Type', inquiry.projectType || '—'],
    ['Material Required', inquiry.materialRequired || '—'],
    ['Message', inquiry.message || '—'],
    ['Submitted At', formatIST(inquiry.createdAt || new Date())],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #e8e4dc;font-weight:600;color:#5A5A4A;width:160px;vertical-align:top;">${label}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e8e4dc;color:#1C1C1C;">${value}</td>
        </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#F7F4EE;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
          <div style="background:#0A0F1E;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;color:#C9A84C;font-size:22px;letter-spacing:2px;">THAKKAR TRADERS</h1>
          </div>
          <div style="background:#ffffff;padding:32px 24px;border-radius:0 0 8px 8px;border:1px solid #D6D0C6;">
            <h2 style="margin:0 0 24px;color:#1C1C1C;font-size:20px;">New Inquiry Received</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              ${tableRows}
            </table>
          </div>
        </div>
      </body>
    </html>
  `;
};

const sendInquiryNotification = async (inquiry) => {
  try {
    await resend.emails.send({
      from: 'Thakkar Traders <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: `New Inquiry from ${inquiry.fullName} — Thakkar Traders`,
      html: buildInquiryEmailHtml(inquiry),
    });
  } catch (error) {
    console.error('Failed to send inquiry notification email:', error.message);
  }
};

module.exports = { sendInquiryNotification };
