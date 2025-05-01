const axios = require("axios");
require("dotenv").config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TMDB_API_KEY}`,
  },
  params: {
    language: "en-US",
  },
});

module.exports = {
  getAllMovies: async (params = {}) => {
    try {
      const response = await tmdb.get("/discover/movie", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching movies from TMDB:", error.message);
      throw new Error(`Failed to fetch movies: ${error.message}`);
    }
  },

  getGenres: async () => {
    try {
      const response = await tmdb.get("/genre/movie/list");
      return response.data;
    } catch (error) {
      console.error("Error fetching genres from TMDB:", error.message);
      throw new Error(`Failed to fetch genres: ${error.message}`);
    }
  },

  getPopularMovies: async () => {
    try {
      const response = await tmdb.get("/movie/popular");
      return response.data;
    } catch (error) {
      console.error("Error fetching popular movies from TMDB:", error.message);
      throw new Error(`Failed to fetch popular movies: ${error.message}`);
    }
  },

  getMovieDetails: async (movieId, params = {}) => {
    try {
      const [detailsResponse, videosResponse, castResponse] = await Promise.all([
        tmdb.get(`/movie/${movieId}`, { params }),
        tmdb.get(`/movie/${movieId}/videos`),
        tmdb.get(`/movie/${movieId}/credits`, { params }),
      ]);
      return {
        ...detailsResponse.data,
        videos: videosResponse.data?.results[1] || null,
        cast: castResponse.data?.cast || null
      };
    } catch (err) {
      console.error(
        `Failed to fetch TMDB data for movieId ${movieId}:`,
        err.message
      );
      return null;
    }
  },
};
