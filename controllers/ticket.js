const Ticket = require('../models/Ticket');
const MovieInCinema = require('../models/MovieInCinema');

/**
 * Повертає збагачений список квитків юзера.
 * Оскільки movieInCinema зберігається як Number (не ObjectId),
 * populate не працює — робимо ручний lookup одним запитом до БД.
 */
exports.getUserTickets = async (req, res) => {
  const userId = req.user.id;

  const tickets = await Ticket.find({ user: userId }).sort({ bookingDate: -1 });

  if (tickets.length === 0) {
    return res.status(200).json([]);
  }

  // Унікальні movieId щоб зробити один запит до БД замість N
  const movieIds = [...new Set(tickets.map((t) => t.movieInCinema))];
  const movies = await MovieInCinema.find({ movieId: { $in: movieIds } });

  // Map для O(1) доступу замість .find() в циклі
  const movieMap = new Map(movies.map((m) => [m.movieId, m]));

  const enriched = tickets.map((ticket) => {
    const movie = movieMap.get(ticket.movieInCinema);
    // session — це subdocument MongoDB, .id() шукає по _id
    const session = movie?.sessions?.id(ticket.session);

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

  res.status(200).json(enriched);
};

exports.getTicketById = async (req, res) => {
  const ticketId = req.params.ticketId;
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    const error = new Error(`Ticket with ID "${ticketId}" not found.`);
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json(ticket);
};

exports.deleteTicket = async (req, res) => {
  const ticketId = req.params.ticketId;
  const userId = req.user.id;

  const ticket = await Ticket.findById(ticketId);

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
  res.status(200).json({
    message: `Ticket with ID "${ticketId}" successfully deleted.`,
  });
};