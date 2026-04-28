const { Agenda } = require('agenda');
const { sendTicketEmail } = require('./emailService');
const Customer = require('../models/Customer');

let agenda;

const NOTIFY_DAYS_BEFORE = 3;

exports.initAgenda = async (mongoUri) => {
  agenda = new Agenda({
    db: { address: mongoUri, collection: 'agendaJobs' },
    processEvery: '1 hour',
  });

  agenda.define('send premiere notification', async (job) => {
    const { userId, movieId, movieTitle } = job.attrs.data;

    try {
      const customer = await Customer.findById(userId).select('email wishlist');
      if (!customer) return;

      const inWishlist = customer.wishlist.some((w) => w.movieId === movieId);
      if (!inWishlist) return;

      await sendPremiereEmail(customer.email, movieTitle, movieId);
    } catch (err) {
      console.error('[Agenda] Failed to send premiere notification:', err.message);
    }
  });

  await agenda.start();
  console.log('[Agenda] Scheduler started');
  return agenda;
};

exports.schedulePremiereNotification = async (userId, movieId, movieTitle, releaseDate) => {
  if (!agenda) {
    console.warn('[Agenda] Not initialized, skipping scheduling');
    return;
  }

  const notifyAt = new Date(releaseDate);
  notifyAt.setDate(notifyAt.getDate() - NOTIFY_DAYS_BEFORE);

  if (notifyAt <= new Date()) return;

  await agenda.cancel({
    name: 'send premiere notification',
    'data.userId': String(userId),
    'data.movieId': movieId,
  });

  await agenda.schedule(notifyAt, 'send premiere notification', {
    userId: String(userId),
    movieId,
    movieTitle,
  });
};

exports.cancelPremiereNotification = async (userId, movieId) => {
  if (!agenda) return;

  await agenda.cancel({
    name: 'send premiere notification',
    'data.userId': String(userId),
    'data.movieId': movieId,
  });
};

const sendPremiereEmail = async (to, movieTitle, movieId) => {
  const { sendTicketEmail: send } = require('./emailService');

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"CD Player Cinema" <${process.env.NODEMAILER_USER}>`,
    to,
    subject: `«${movieTitle}» — прем'єра вже за 3 дні! 🎬`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0e0e1b;color:#fff;border-radius:12px;overflow:hidden">
        <div style="background:#facc15;padding:24px;text-align:center">
          <h1 style="margin:0;color:#000;font-size:22px;font-weight:700">CD Player Cinema</h1>
        </div>
        <div style="padding:24px;text-align:center">
          <p style="color:#9ca3af;font-size:14px;margin-bottom:8px">Фільм із вашого Wishlist виходить вже за 3 дні!</p>
          <h2 style="color:#facc15;font-size:24px;margin:0 0 20px">${movieTitle}</h2>
          <a
            href="${process.env.APP_BASE_URL || 'http://localhost:5173'}/coming-soon"
            style="display:inline-block;background:#facc15;color:#000;font-weight:700;padding:12px 28px;border-radius:24px;text-decoration:none;font-size:15px"
          >
            Купити квиток
          </a>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #1f2937;text-align:center">
          <p style="color:#4b5563;font-size:12px;margin:0">
            Ви отримали це повідомлення бо додали фільм до Wishlist
          </p>
        </div>
      </div>
    `,
  });
};