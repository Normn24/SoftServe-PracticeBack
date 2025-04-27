const MovieInCinema = require('../models/MovieInCinema');
const Ticket = require('../models/Ticket');
const queryCreator = require("../commonHelpers/queryCreator");
const tmdbService = require('../services/tmdbService');

exports.addMovie = async (req, res) => {
  const movieData = req.body;
  try {
    const existingMovie = await MovieInCinema.findOne({ movieId: movieData.movieId });

    if (existingMovie) {
      return res.status(409).json({ message: `The movie with movieId “${movieData.movieId}” already exists in the database.` });
    }

    const newMovie = new MovieInCinema(queryCreator(movieData));
    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (err) {
    console.error("Error adding a movie:", err);
    res.status(400).json({
      message: `Server error when adding a movie: "${err.message || err}" `
    });
  }
};

exports.deleteMovie = (req, res) => {
  MovieInCinema.findOne({ movieId: req.params.id }).then(async movie => {
    if (!movie) {
      return res.status(400).json({
        message: `Movie with movieId "${req.params.id}" is not found.`
      });
    } else {
      const movieToDelete = await MovieInCinema.findOne({
        movieId: req.params.id
      });

      MovieInCinema.deleteOne({ movieId: req.params.id })
        .then(deletedCount =>
          res.status(200).json({
            message: `Movie with movieId "${movieToDelete.movieId}" is successfully deleted from DB.`,
            movieToDeleteInfo: movieToDelete
          })
        )
        .catch(err =>
          res.status(400).json({
            message: `Error happened on server: "${err}" `
          })
        );
    }
  });
};

exports.getMovieById = async (req, res) => {
  const movieId = req.params.id; 

  if (!movieId) {
    return res.status(400).json({ message: 'Please provide the movieId.' });
  }

  try {
    const movieDetails = await tmdbService.getMovieDetails(movieId);
    if (movieDetails) {
      res.json(movieDetails);
    } else {
      res.status(404).json({ message: `Movie with movieId “${movieId}” not found in TMDB.` });
    }
  } catch (error) {
    console.error(`Error retrieving movie details from TMDB (ID: ${movieId}):`, error);
    res.status(500).json({ message: `Error when getting movie details: ${error.message}` });
  }
};

exports.getAllMovies = (req, res) => {
  MovieInCinema.find()
    .then(movies => {
      res.json(movies);
    })
    .catch(err => {
      res.status(500).json({
        message: `Error happened on server while fetching movies: "${err.message || err}"`
      });
    });
};

exports.addSession = (req, res) => {
  const movieId = req.params.id;
  const { dateTime, price, seats } = req.body;

  if (!dateTime || price === undefined || !Array.isArray(seats)) {
    return res.status(400).json({ message: "Missing or invalid fields: dateTime, price, seats (must be an array)." });
  }

  const newSession = {
    dateTime,
    price,
    seats: seats.map(seatNumber => ({ seatNumber: seatNumber, isBooked: false }))
  };

  MovieInCinema.findOne({ movieId: movieId })
    .then(movie => {
      if (!movie) {
        return res.status(404).json({
          message: `Movie with movieId "${movieId}" not found.`
        });
      }

      movie.sessions.push(newSession);
      return movie.save();
    })
    .then(updatedMovie => {
      res.status(201).json(updatedMovie);
    })
    .catch(err =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `
      })
    );
};

exports.editSession = (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;
  const { dateTime, price, seats: updatedSeats } = req.body;

  MovieInCinema.findOne({ movieId: movieId })
    .then(movie => {
      if (!movie) {
        return res.status(404).json({
          message: `Movie with movieId "${movieId}" not found.`
        });
      }

      const session = movie.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({
          message: `Session with id "${sessionId}" not found in movie with movieId "${movieId}".`
        });
      }

      if (dateTime) session.dateTime = dateTime;
      if (price) session.price = price;

      if (updatedSeats) {
        const currentSeats = session.seats || [];

        const updatedSeatsMap = new Map(updatedSeats.map(seat => [seat.seatNumber, seat]));

        session.seats = currentSeats.filter(seat => {
          return seat.isBooked || updatedSeatsMap.has(seat.seatNumber);
        });

        updatedSeats.forEach(newSeat => {
          const exists = session.seats.some(seat => seat.seatNumber === newSeat.seatNumber);
          if (!exists) {
            session.seats.push(newSeat);
          }
        });

        session.seats.sort((a, b) => a.seatNumber - b.seatNumber);
      }

      return movie.save();
    })
    .then(updatedMovie => {
      const updatedSession = updatedMovie.sessions.id(sessionId);
      res.json(updatedSession);
    })
    .catch(err =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `
      })
    );
};


exports.deleteSession = (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;

  MovieInCinema.findOne({ movieId: movieId })
    .then(movie => {
      if (!movie) {
        return res.status(404).json({
          message: `Movie with movieId "${movieId}" not found.`
        });
      }

      const session = movie.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({
          message: `Session with id "${sessionId}" not found in movie with movieId "${movieId}".`
        });
      }
      movie.sessions.pull(sessionId);
      return movie.save();
    })
    .then(updatedMovie => {
      res.json({ message: `Session with id “${sessionId}” successfully deleted.` });
    })
    .catch(err =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `
      })
    );
};

exports.getSessionById = (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;

  MovieInCinema.findOne({ movieId: movieId })
    .then(movie => {
      if (!movie) {
        return res.status(404).json({ message: `Movie with movieId “${movieId}” not found.` });
      }

      const session = movie.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({ message: `Session with id “${sessionId}” not found in movie with movieId "${movieId}".` });
      }

      res.json(session);
    })
    .catch(err => {
      res.status(400).json({
        message: `Error happened on server: "${err}" `
      });
    });
};

exports.getAllSessions = (req, res) => {
  const dateQuery = req.query.date; 

  const targetDate = new Date(dateQuery);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  MovieInCinema.find()
    .select('tmdbId sessions')
    .exec()
    .then(movies => {
      const sessionsForDate = movies.flatMap(movie =>
        movie.sessions
          .filter(session =>
            new Date(session.dateTime) >= targetDate &&
            new Date(session.dateTime) < nextDay
          )
          .map(session => ({
            tmdbId: movie.tmdbId,
            session
          }))
      );

      res.json(sessionsForDate);
    })
    .catch(err =>
      res.status(500).json({
        message: `Error happened on server: "${err}"`
      })
    );
};



exports.bookSeat = async (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;
  const { seatNumber } = req.body;
  const userId = req.user.id; 

  if (seatNumber === undefined) {
    return res.status(400).json({ message: "Missing required field: seatNumber." });
  }

  try {
    const movie = await MovieInCinema.findOne({ movieId: movieId });
    if (!movie) {
      return res.status(404).json({ message: `Movie with movieId "${movieId}" not found.` });
    }

    const session = movie.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({ message: `Session with id "${sessionId}" not found.` });
    }

    const seat = session.seats.find(s => s.seatNumber === seatNumber);
    if (!seat) {
      return res.status(404).json({ error: `Seat “${seatNumber}” does not exist in this session.` });
    }
    if (seat.isBooked) {
      return res.status(409).json({ error: `Seat “${seatNumber}” is already booked.` });
    }

    seat.isBooked = true;
    await movie.save();

    const newTicket = new Ticket({
      user: userId,
      movieInCinema: movieId, 
      session: sessionId,
      seatNumber: seatNumber
    });
    const savedTicket = await newTicket.save();

    res.status(201).json({ 
      message: `Seat “${seatNumber}” has been successfully booked.`,
      ticket: savedTicket
    });

  } catch (err) {
    console.error("Error during booking:", err);
    res.status(400).json({
      message: `Error happened on server: "${err.message || err}" `
    });
  }
};

exports.getAvailableSeats = (req, res) => {
  const movieId = req.params.id;
  const sessionId = req.params.sessionId;

  MovieInCinema.findOne({ movieId: movieId })
    .then(movie => {
      if (!movie) {
        return res.status(404).json({ message: `Movie with movieId "${movieId}" not found.` });
      }
      const session = movie.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({ message: `Session with id "${sessionId}" not found.` });
      }

      const freeSeats = session.seats.filter(seat => !seat.isBooked);
      res.json(freeSeats);
    })
    .catch(err => {
      res.status(500).json({
        message: `Error happened on server while getting available seats: "${err.message || err}"`
      });
    });
};