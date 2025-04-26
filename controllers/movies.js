const {
  getAllMovies,
  getGenres,
  getPopularMovies,
  getMovieDetails,
} = require("../services/tmdbService");

exports.getAllMovies = async (req, res) => {
  const queryParams = req.query;
  try {
    const moviesData = await getAllMovies(queryParams);
    if (moviesData) {
      res.status(200).json(moviesData);
    } else {
      res.status(404).json({ message: "We failed to get movies." });
    }
  } catch (error) {
    res.status(500).json({ error: "Unable to get movies" });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const moviesData = await getGenres();
    if (moviesData) {
      res.status(200).json(moviesData);
    } else {
      res.status(404).json({ message: "We failed to get genres." });
    }
  } catch (error) {
    res.status(500).json({ error: "Unable to get genres" });
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const popularMoviesData = await getPopularMovies();
    if (popularMoviesData) {
      res.status(200).json(popularMoviesData);
    } else {
      res.status(404).json({ message: "We failed to get popular movies." });
    }
  } catch (error) {
    res.status(500).json({ error: "Unable to get popular movies" });
  }
};

exports.getMovieDetails = async (req, res) => {
  const movieId = req.params.id;

  try {
    const movieDetails = await getMovieDetails(movieId);
    if (movieDetails) {
      res.status(200).json(movieDetails);
    } else {
      res
        .status(404)
        .json({ message: `Movie with ID “${movieId}” not found in TMDB.` });
    }
  } catch (error) {
    res.status(500).json({ error: "Unable to retrieve movie data" });
  }
};
