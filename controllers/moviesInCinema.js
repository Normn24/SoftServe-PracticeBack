const MovieInCinema = require("../models/MovieInCinema");
const Ticket = require("../models/Ticket");
const queryCreator = require("../commonHelpers/queryCreator");
const tmdbService = require("../services/tmdbService");

exports.addMovie = async (req, res) => {
  const movieData = req.body;
  const { movieId } = movieData;
  const queryParams = req.query;

  try {
    const existingMovie = await MovieInCinema.findOne({
      movieId: movieData.movieId,
    });

    if (existingMovie) {
      return res
        .status(409)
        .json({
          message: `The movie with movieId “${movieData.movieId}” already exists in the database.`,
        });
    }

    try {
      const tmdbDetails = await tmdbService.getMovieDetails(
        movieId,
        queryParams
      );

      const processedRequestData = queryCreator(movieData);

      const dataToSave = {
        ...processedRequestData,
        tmdbDetails: tmdbDetails,
      };

      const newMovie = new MovieInCinema(queryCreator(dataToSave));
      const savedMovie = await newMovie.save();
      res.status(201).json(savedMovie);
    } catch (tmdbError) {
      return res.status(400).json({
        message: `Error getting data from TMDB. ${
          tmdbError.message || tmdbError
        }`,
      });
    }
  } catch (err) {
    console.error("Error adding a movie:", err);
    res.status(400).json({
      message: `Server error when adding a movie: "${err.message || err}" `,
    });
  }
};

exports.editMovie = async (req, res) => {
  const movieIdFromParams = req.params.id;
  const updateData = req.body;

  if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "The request body cannot be empty for updating." });
  }

  const dataToSet = { ...updateData };
  delete dataToSet._id;
  delete dataToSet.movieId;
  delete dataToSet.tmdbDetails;

  if (Object.keys(dataToSet).length === 0) {
      return res.status(400).json({ message: "No allowed fields to update in the request body (movieId, _id, tmdbDetails cannot be changed)." });
  }

  try {
      const updatedMovie = await MovieInCinema.findOneAndUpdate(
          { movieId: movieIdFromParams }, 
          { $set: dataToSet }, 
          {
              new: true,         
              runValidators: true, 
          }
      );

      if (!updatedMovie) {
          return res.status(404).json({ message: `Movie with movieId “${movieIdFromParams}” not found.` });
      }
      res.status(200).json(updatedMovie);
  } catch (err) {
      res.status(500).json({
          message: `Server error when updating a movie: "${err.message || err}"`
      });
  }
};

exports.deleteMovie = (req, res) => {
  MovieInCinema.findOne({ movieId: req.params.id }).then(async (movie) => {
    if (!movie) {
      return res.status(400).json({
        message: `Movie with movieId "${req.params.id}" is not found.`,
      });
    } else {
      const movieToDelete = await MovieInCinema.findOne({
        movieId: req.params.id,
      });

      MovieInCinema.deleteOne({ movieId: req.params.id })
        .then((deletedCount) =>
          res.status(200).json({
            message: `Movie with movieId "${movieToDelete.movieId}" is successfully deleted from DB.`,
            movieToDeleteInfo: movieToDelete,
          })
        )
        .catch((err) =>
          res.status(400).json({
            message: `Error happened on server: "${err}" `,
          })
        );
    }
  });
};

exports.getMovieById = async (req, res) => {
  const movieId = req.params.id;
  const queryParams = req.query;

  if (!movieId) {
    return res.status(400).json({ message: "Please provide the movieId." });
  }

  try {
    MovieInCinema.findOne({ movieId: movieId }).then((movie) => {
      if (!movie) {
        return res.status(404).json({
          message: `Movie with movieId "${movieId}" not found.`,
        });
      }

      res.json(movie);
    });
  } catch (error) {
    console.error(
      `Error retrieving movie details from TMDB (ID: ${movieId}):`,
      error
    );
    res
      .status(500)
      .json({ message: `Error when getting movie details: ${error.message}` });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const { status, title, genre, year, minRating } = req.query;

    let filter = {};

    if (status === "inCinema") {
      filter.isInCinema = true;
    } else if (status === "comingSoon") {
      filter.isInCinema = false;
    }

    if (title) {
      filter["tmdbDetails.title"] = { $regex: title, $options: "i" };
    }

    if (genre) {
      filter["tmdbDetails.genres.name"] = { $regex: genre, $options: "i" };
    }

    if (year) {
      if (/^\d{4}$/.test(year)) {
        filter["tmdbDetails.release_date"] = { $regex: `^${year}` };
      } else {
        return res
          .status(400)
          .json({ message: "The year format is incorrect. Enter 4 digits." });
      }
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        filter["tmdbDetails.vote_average"] = { $gte: rating };
      } else {
        return res
          .status(400)
          .json({
            message: "The minRating format is incorrect. Enter a number.",
          });
      }
    }

    const movies = await MovieInCinema.find(filter);
    if (!movies || movies.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found for the specified criteria." });
    }

    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({
      message: `An error occurred on the server while receiving movies: "${
        err.message || err
      }"`,
    });
  }
};

exports.addSession = (req, res) => {
  const movieId = req.params.id;
  const { dateTime, price, seats } = req.body;

  if (!dateTime || price === undefined || !Array.isArray(seats)) {
    return res
      .status(400)
      .json({
        message:
          "Missing or invalid fields: dateTime, price, seats (must be an array).",
      });
  }

  const newSession = {
    dateTime,
    price,
    seats: seats.map((seatNumber) => ({
      seatNumber: seatNumber,
      isBooked: false,
    })),
  };

  MovieInCinema.findOne({ movieId: movieId })
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({
          message: `Movie with movieId "${movieId}" not found.`,
        });
      }

      movie.sessions.push(newSession);
      return movie.save();
    })
    .then((updatedMovie) => {
      res.status(201).json(updatedMovie);
    })
    .catch((err) =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `,
      })
    );
};

exports.editSession = (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;
  const { dateTime, price, seats: updatedSeats } = req.body;

  MovieInCinema.findOne({ movieId: movieId })
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({
          message: `Movie with movieId "${movieId}" not found.`,
        });
      }

      const session = movie.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({
          message: `Session with id "${sessionId}" not found in movie with movieId "${movieId}".`,
        });
      }

      if (dateTime) session.dateTime = dateTime;
      if (price) session.price = price;

      if (updatedSeats) {
        const currentSeats = session.seats || [];

        const updatedSeatsMap = new Map(
          updatedSeats.map((seat) => [seat.seatNumber, seat])
        );

        session.seats = currentSeats.filter((seat) => {
          return seat.isBooked || updatedSeatsMap.has(seat.seatNumber);
        });

        updatedSeats.forEach((newSeat) => {
          const exists = session.seats.some(
            (seat) => seat.seatNumber === newSeat.seatNumber
          );
          if (!exists) {
            session.seats.push(newSeat);
          }
        });

        session.seats.sort((a, b) => a.seatNumber - b.seatNumber);
      }

      return movie.save();
    })
    .then((updatedMovie) => {
      const updatedSession = updatedMovie.sessions.id(sessionId);
      res.json(updatedSession);
    })
    .catch((err) =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `,
      })
    );
};

exports.deleteSession = (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;

  MovieInCinema.findOne({ movieId: movieId })
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({
          message: `Movie with movieId "${movieId}" not found.`,
        });
      }

      const session = movie.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({
          message: `Session with id "${sessionId}" not found in movie with movieId "${movieId}".`,
        });
      }
      movie.sessions.pull(sessionId);
      return movie.save();
    })
    .then((updatedMovie) => {
      res.json({
        message: `Session with id “${sessionId}” successfully deleted.`,
      });
    })
    .catch((err) =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `,
      })
    );
};

exports.getSessionById = (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;

  MovieInCinema.findOne({ movieId: movieId })
    .then((movie) => {
      if (!movie) {
        return res
          .status(404)
          .json({ message: `Movie with movieId “${movieId}” not found.` });
      }

      const session = movie.sessions.id(sessionId);
      if (!session) {
        return res
          .status(404)
          .json({
            message: `Session with id “${sessionId}” not found in movie with movieId "${movieId}".`,
          });
      }

      res.json(session);
    })
    .catch((err) => {
      res.status(400).json({
        message: `Error happened on server: "${err}" `,
      });
    });
};

exports.getAllSessions = (req, res) => {
  const movieId = req.params.id;
  const dateQuery = req.query.date;

  if (!dateQuery) {
    return res.status(400).json({ message: "Missing 'date' query parameter." });
  }

  const targetDate = new Date(dateQuery);
  if (isNaN(targetDate.getTime())) {
    return res
      .status(400)
      .json({
        message:
          "Invalid 'date' query parameter. Please use YYYY-MM-DD format.",
      });
  }

  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  MovieInCinema.findOne({ movieId: movieId })
    .select("sessions")
    .exec()
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({
          message: `Movie with id "${movieId}" not found.`,
        });
      }

      const sessionsForDate = movie.sessions
        .filter((session) => {
          const sessionDate = new Date(session.dateTime);
          return sessionDate >= targetDate && sessionDate < nextDay;
        })
        .map((session) => ({
          tmdbId: movie.tmdbId,
          session: session.toObject(),
        }));

      res.json(sessionsForDate);
    })
    .catch((err) => {
      console.error(
        `Error fetching sessions for movie ${movieId} on date ${dateQuery}:`,
        err
      ); // Add specific logging
      res.status(500).json({
        message: `Error happened on server while fetching sessions: "${
          err.message || err
        }"`,
      });
    });
};

exports.bookSeat = async (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;
  const { seatNumber } = req.body;
  const userId = req.user.id;

  if (seatNumber === undefined) {
    return res
      .status(400)
      .json({ message: "Missing required field: seatNumber." });
  }

  try {
    const movie = await MovieInCinema.findOne({ movieId: movieId });
    if (!movie) {
      return res
        .status(404)
        .json({ message: `Movie with movieId "${movieId}" not found.` });
    }

    const session = movie.sessions.id(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ message: `Session with id "${sessionId}" not found.` });
    }

    const seat = session.seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) {
      return res
        .status(404)
        .json({
          error: `Seat “${seatNumber}” does not exist in this session.`,
        });
    }
    if (seat.isBooked) {
      return res
        .status(409)
        .json({ error: `Seat “${seatNumber}” is already booked.` });
    }

    seat.isBooked = true;
    await movie.save();

    const newTicket = new Ticket({
      user: userId,
      movieInCinema: movieId,
      session: sessionId,
      seatNumber: seatNumber,
    });
    const savedTicket = await newTicket.save();

    res.status(201).json({
      message: `Seat “${seatNumber}” has been successfully booked.`,
      ticket: savedTicket,
    });
  } catch (err) {
    console.error("Error during booking:", err);
    res.status(400).json({
      message: `Error happened on server: "${err.message || err}" `,
    });
  }
};

exports.getAvailableSeats = (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;

  MovieInCinema.findOne({ movieId: movieId })
    .then((movie) => {
      if (!movie) {
        return res
          .status(404)
          .json({ message: `Movie with movieId "${movieId}" not found.` });
      }
      const session = movie.sessions.id(sessionId);
      if (!session) {
        return res
          .status(404)
          .json({ message: `Session with id "${sessionId}" not found.` });
      }

      const freeSeats = session.seats.filter((seat) => !seat.isBooked);
      res.json(freeSeats);
    })
    .catch((err) => {
      res.status(500).json({
        message: `Error happened on server while getting available seats: "${
          err.message || err
        }"`,
      });
    });
};
