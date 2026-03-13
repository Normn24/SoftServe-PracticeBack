const {
  getAllMovies,
  getGenres,
  getPopularMovies,
  getMovieDetails,
  searchMovies,
  discoverMovies
} = require("../services/tmdbService");

exports.getAllMovies = async (req, res) => {
  const queryParams = req.query;
  const moviesData = await getAllMovies(queryParams);
  
  if (!moviesData) {
    const error = new Error("We failed to get movies.");
    error.statusCode = 404;
    throw error;
  }
  
  res.status(200).json(moviesData);
};

exports.getGenres = async (req, res) => {
  const moviesData = await getGenres();
  
  if (!moviesData) {
    const error = new Error("We failed to get genres.");
    error.statusCode = 404;
    throw error;
  }
  
  res.status(200).json(moviesData);
};

exports.getPopularMovies = async (req, res) => {
  const popularMoviesData = await getPopularMovies();
  
  if (!popularMoviesData) {
    const error = new Error("We failed to get popular movies.");
    error.statusCode = 404;
    throw error;
  }
  
  res.status(200).json(popularMoviesData);
};

exports.getMovieDetails = async (req, res) => {
  const movieId = req.params.id;
  const queryParams = req.query;
  const movieDetails = await getMovieDetails(movieId, queryParams);
  
  if (!movieDetails) {
    const error = new Error(`Movie with ID “${movieId}” not found in TMDB.`);
    error.statusCode = 404;
    throw error;
  }
  
  res.status(200).json(movieDetails);
};

exports.searchMovies = async (req, res) => {
  const queryParams = req.query;
  const searchResults = await searchMovies(queryParams);
  
  if (!searchResults) {
    const error = new Error("No movies found.");
    error.statusCode = 404;
    throw error;
  }
  
  res.status(200).json(searchResults);
};

exports.discoverMovies = async (req, res) => {
  const queryParams = req.query;
  const discoverResults = await discoverMovies(queryParams);
  
  if (!discoverResults) {
    const error = new Error("No movies found.");
    error.statusCode = 404;
    throw error;
  }
  
  res.status(200).json(discoverResults);
};