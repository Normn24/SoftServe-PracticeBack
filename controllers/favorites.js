const Customer = require('../models/Customer');
const tmdbService = require('../services/tmdbService');

exports.addToFavorites = async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  const customer = await Customer.findById(userId);
  if (!customer) {
    const error = new Error(`The user with ID "${userId}" was not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (!customer.favorites.includes(movieId)) {
    customer.favorites.push(movieId);
    await customer.save();
  }

  res.status(200).json({
    message: `Movie with ID "${movieId}" has been successfully added to your favorites.`,
  });
};

exports.removeFromFavorites = async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  const customer = await Customer.findById(userId);
  if (!customer) {
    const error = new Error(`The user with ID "${userId}" was not found.`);
    error.statusCode = 404;
    throw error;
  }

  await Customer.findByIdAndUpdate(userId, { $pull: { favorites: movieId } });
  res.status(200).json({
    message: `The movie with ID "${movieId}" has been successfully removed from your favorites.`,
  });
};

exports.getFavorites = async (req, res) => {
  const userId = req.user.id;

  const customer = await Customer.findById(userId);
  if (!customer) {
    const error = new Error(`The user with ID "${userId}" was not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (customer.favorites.length === 0) {
    return res.status(200).json([]);
  }

  const movieRequests = customer.favorites.map((id) =>
    tmdbService.getMovieDetails(id)
  );
  const results = await Promise.all(movieRequests);
  const validMovies = results.filter((m) => m !== null);

  res.status(200).json(validMovies);
};