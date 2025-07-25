const express = require("express");
const router = express.Router();

const {
  getAllMovies,
  getPopularMovies,
  getMovieDetails,
  getGenres,
  searchMovies,
  discoverMovies
} = require("../controllers/movies");

router.get("/", getAllMovies);

router.get("/genres", getGenres);

router.get("/popular", getPopularMovies);

router.get("/search", searchMovies);

router.get("/filter", discoverMovies);

router.get("/:id", getMovieDetails);


module.exports = router;
