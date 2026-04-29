const Ticket = require('../models/Ticket');
const MovieInCinema = require('../models/MovieInCinema');
const Customer = require('../models/Customer');
const { sendTicketEmail } = require('../services/emailService');
const { generateTicketQR } = require('../services/qrService');

exports.getUserTickets = async (req, res) => {
  const userId = req.user.id;
  const { status } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;
  const query = { user: userId };
  if (status === 'active') {
    query.isUsed = false;
  } else if (status === 'used') {
    query.isUsed = true;
  }

  const [totalTickets, tickets] = await Promise.all([
    Ticket.countDocuments(query),
    Ticket.find(query)
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  if (tickets.length === 0) {
    return res.status(200).json({
      tickets: [],
      pagination: {
        totalTickets: 0,
        totalPages: 0,
        currentPage: page,
      },
    });
  }

  const movieIds = [...new Set(tickets.map((t) => t.movieInCinema))];
  const movies = await MovieInCinema.find({ movieId: { $in: movieIds } }).lean();
  const movieMap = new Map(movies.map((m) => [m.movieId, m]));

  const enriched = tickets.map((ticket) => {
    const movie = movieMap.get(ticket.movieInCinema);
    const session = movie?.sessions?.find(
      (s) => s._id.toString() === ticket.session.toString()
    );

    return {
      _id: ticket._id,
      bookingDate: ticket.bookingDate,
      seatNumber: ticket.seatNumber,
      isUsed: ticket.isUsed,
      movieId: ticket.movieInCinema,
      movieTitle: movie?.tmdbDetails?.title ?? null,
      moviePoster: movie?.tmdbDetails?.poster_path ?? null,
      sessionDateTime: session?.dateTime ?? null,
      sessionPrice: session?.price ?? null,
    };
  });

  res.status(200).json({
    tickets: enriched,
    pagination: {
      totalTickets,
      totalPages: Math.ceil(totalTickets / limit),
      currentPage: page,
    },
  });
};

exports.getTicketById = async (req, res) => {
  const ticket = await Ticket.findById(req.params.ticketId).lean();

  if (!ticket) {
    const error = new Error(`Ticket with ID "${req.params.ticketId}" not found.`);
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json(ticket);
};

exports.deleteTicket = async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user.id;

  const ticket = await Ticket.findById(ticketId).select('user').lean();

  if (!ticket) {
    const error = new Error(`Ticket with ID "${ticketId}" not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (ticket.user.toString() !== userId) {
    const error = new Error('You are not authorized to delete this ticket.');
    error.statusCode = 403;
    throw error;
  }

  await Ticket.findByIdAndDelete(ticketId);
  res.status(200).json({ message: `Ticket "${ticketId}" deleted.` });
};

exports.sendTicketConfirmation = async (ticket, movieTitle, sessionDateTime) => {
  try {
    const customer = await Customer.findById(ticket.user).select('email').lean();
    if (!customer?.email) return;

    const qrDataUrl = await generateTicketQR(String(ticket._id));

    await sendTicketEmail(
      customer.email,
      {
        ticketId: String(ticket._id),
        movieTitle,
        sessionDateTime,
        seatNumber: ticket.seatNumber,
      },
      qrDataUrl
    );
  } catch (err) {
    console.error('[sendTicketConfirmation] Failed to send email:', err.message);
  }
};

exports.validateTicket = async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    const error = new Error(`Ticket "${ticketId}" not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (ticket.isUsed) {
    return res.status(409).json({
      valid: false,
      message: 'Ticket already used.',
      ticket: { _id: ticket._id, seatNumber: ticket.seatNumber },
    });
  }

  ticket.isUsed = true;
  await ticket.save();

  res.status(200).json({
    valid: true,
    message: 'Ticket validated successfully.',
    ticket: {
      _id: ticket._id,
      seatNumber: ticket.seatNumber,
      movieInCinema: ticket.movieInCinema,
    },
  });
};