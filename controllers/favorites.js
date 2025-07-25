const Customer = require('../models/Customer');
const tmdbService = require('../services/tmdbService');

exports.addToFavorites = async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  try {
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: `The user with ID “${userId}” was not found.` });
    }

    if (!customer.favorites.includes(movieId)) {
      customer.favorites.push(movieId);
      await customer.save();
      res.status(200).json({ message: `Movie with ID “${movieId}” has been successfully added to your favorites.` });
    } else {
      res.status(200).json({ message: `The movie with ID “${movieId}” is already in your favorite list.` });
    }
  } catch (err) {
    console.error(`Error adding movie (ID: ${movieId}) to user favorites (ID: ${userId}):`, err);
    res.status(500).json({ message: `Server error when adding to favorites: "${err.message || err}"` });
  }
};

exports.removeFromFavorites = async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  try {
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: `The user with ID “${userId}” was not found.` });
    }

    // customer.favorites = customer.favorites.filter(id => id !== movieId);

    if (customer.favorites.includes(movieId)) {
      res.status(200).json({ message: `The movie with ID “${movieId}” has been successfully removed from your favorites.` });
      await Customer.findByIdAndUpdate(userId, {
        $pull: { favorites: movieId }
      });
    } else {
      res.status(200).json({ message: `The movie with ID “${movieId}” was not found in your favorites list.` });
    }
  } catch (err) {
    console.error(`Error deleting movie (ID: ${movieId}) from user favorites (ID: ${userId}):`, err);
    res.status(500).json({ message: `Помилка на сервері при видаленні з улюблених: "${err.message || err}"` });
  }
};

exports.getFavorites = async (req, res) => {
  const userId = req.user.id;

  try {
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: `The user with ID “${userId}” was not found.` });
    }

    const favoriteIds = customer.favorites;

    if (favoriteIds.length === 0) {
      return res.status(200).json([]);
    }

    const movieRequests = favoriteIds.map(id => tmdbService.getMovieDetails(id));
    
    const movies = await Promise.all(movieRequests)
      .then(results => results.filter(movie => movie))
      .catch(error => {
        console.error("Error retrieving movie details from TMDB:", error);
        throw new Error('Error when getting details of your favorite movies.');
      });

    res.status(200).json(movies);

  } catch (err) {
    console.error(`Error when receiving user's favorite movies (ID: ${userId}):`, err);
    res.status(500).json({ message: `Server error when receiving your favorite movies: "${err.message || err}"` });
  }
};