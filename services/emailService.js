import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

/**
 * @param {string} to 
 * @param {TicketData} ticketData 
 * @param {string} qrDataUrl 
 * @returns {Promise<void>}
 */
export const sendTicketEmail = async (to, ticketData, qrDataUrl) => {
  const { movieTitle, sessionDateTime, seatNumber, ticketId } = ticketData;

  const sessionFormatted = sessionDateTime
    ? new Date(sessionDateTime).toLocaleString('uk-UA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const base64Data = qrDataUrl.split(',')[1];

  await transporter.sendMail({
    from: `"CD Player Cinema" <${process.env.NODEMAILER_USER}>`,
    to,
    subject: `Your ticket for "${movieTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:900px;margin:0 auto;background:#0e0e1b;color:#fff;border-radius:12px;overflow:hidden">
        <div style="background:#facc15;padding:24px;text-align:center">
          <h1 style="margin:0;color:#000;font-size:22px;font-weight:700">CD Player Cinema</h1>
          <p style="margin:6px 0 0;color:#000;font-size:13px;opacity:0.7">Ticket confirmation</p>
        </div>

        <div style="padding:24px;display:flex;flex-direction:column;gap:12px">
          <h2 style="margin:0;font-size:18px;color:#facc15">${movieTitle}</h2>

          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="color:#9ca3af;padding:6px 0">Session</td>
              <td style="color:#fff;text-align:right">${sessionFormatted}</td>
            </tr>
            <tr>
              <td style="color:#9ca3af;padding:6px 0">Seat</td>
              <td style="color:#fff;text-align:right">${seatNumber}</td>
            </tr>
            <tr>
              <td style="color:#9ca3af;padding:6px 0">Ticket ID</td>
              <td style="color:#6b7280;text-align:right;font-size:12px">${ticketId}</td>
            </tr>
          </table>

          <div style="text-align:center;margin-top:16px">
            <p style="color:#9ca3af;font-size:13px;margin-bottom:12px">
              Show the QR code to the administrator at the entrance
            </p>
            <img
              src="cid:ticket-qr-code"
              alt="Ticket QR code"
              style="width:180px;height:180px;border-radius:8px;background:#fff;padding:8px"
            />
          </div>
        </div>

        <div style="padding:16px 24px;border-top:1px solid #1f2937;text-align:center">
          <p style="color:#4b5563;font-size:12px;margin:0">
            The ticket is valid once. Enjoy the movie!
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'qr-code.png',
        content: base64Data,
        encoding: 'base64',
        cid: 'ticket-qr-code',
      },
    ],
  });
};