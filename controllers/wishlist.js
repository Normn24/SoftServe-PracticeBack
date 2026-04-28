const { z } = require('zod');
const Customer = require('../models/Customer');
const {
  schedulePremiereNotification,
  cancelPremiereNotification,
} = require('../services/agendaService');

const addSchema = z.object({
  movieId:     z.number().int().positive(),
  movieTitle:  z.string().min(1).max(300),
  releaseDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

exports.getWishlist = async (req, res) => {
  const customer = await Customer.findById(req.user.id).select('wishlist');
  if (!customer) {
    const err = new Error('Customer not found.');
    err.statusCode = 404;
    throw err;
  }
  res.status(200).json(customer.wishlist);
};

exports.addToWishlist = async (req, res) => {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  const { movieId, movieTitle, releaseDate } = parsed.data;
  const userId = req.user.id;

  const customer = await Customer.findById(userId);
  if (!customer) {
    const err = new Error('Customer not found.');
    err.statusCode = 404;
    throw err;
  }

  const alreadyAdded = customer.wishlist.some((w) => w.movieId === movieId);
  if (alreadyAdded) {
    return res.status(200).json({ message: 'Already in wishlist.' });
  }

  customer.wishlist.push({ movieId, movieTitle, releaseDate: new Date(releaseDate) });
  await customer.save();

  // Плануємо нотифікацію — некритично якщо не спрацює
  schedulePremiereNotification(userId, movieId, movieTitle, new Date(releaseDate)).catch(
    (err) => console.error('[Wishlist] Failed to schedule notification:', err.message)
  );

  res.status(201).json({ message: `"${movieTitle}" added to wishlist.` });
};

exports.removeFromWishlist = async (req, res) => {
  const movieId = Number(req.params.movieId);
  const userId = req.user.id;

  if (isNaN(movieId)) {
    return res.status(400).json({ message: 'Invalid movieId.' });
  }

  await Customer.findByIdAndUpdate(userId, {
    $pull: { wishlist: { movieId } },
  });

  cancelPremiereNotification(userId, movieId).catch(
    (err) => console.error('[Wishlist] Failed to cancel notification:', err.message)
  );

  res.status(200).json({ message: 'Removed from wishlist.' });
};