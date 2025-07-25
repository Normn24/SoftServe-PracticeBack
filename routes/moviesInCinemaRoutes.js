const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  addMovie,
  deleteMovie,
  getMovieById,
  getAllMovies,
  addSession,
  editSession,
  deleteSession,
  getSessionById,
  getAllSessions,
  bookSeat,
  getAvailableSeats,
  editMovie,
} = require("../controllers/moviesInCinema");

router.get("/", getAllMovies);

router.get("/:id", getMovieById);

router.put(
  "/:id",
  passport.authenticate("jwt-admin", { session: false }),
  editMovie
);

router.post(
  "/",
  passport.authenticate("jwt-admin", { session: false }),
  addMovie
);

router.delete(
  "/:id",
  passport.authenticate("jwt-admin", { session: false }),
  deleteMovie
);

router.post(
  "/:id/sessions",
  passport.authenticate("jwt-admin", { session: false }),
  addSession
);

router.put(
  "/:id/sessions/:sessionId",
  passport.authenticate("jwt-admin", { session: false }),
  editSession
);

router.delete(
  "/:id/sessions/:sessionId",
  passport.authenticate("jwt-admin", { session: false }),
  deleteSession
);

router.get("/:id/sessions/:sessionId", getSessionById);

router.get("/:id/sessions/", getAllSessions);

router.post(
  "/:id/sessions/:sessionId/book",
  passport.authenticate("jwt", { session: false }),
  bookSeat
);

router.get("/:id/sessions/:sessionId/seats", getAvailableSeats);

module.exports = router;
