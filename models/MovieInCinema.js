const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SeatSchema = new Schema({
  seatNumber: Number,
  isBooked: { type: Boolean, default: false },
});

const SessionSchema = new Schema({
  dateTime: Date,
  price: Number,
  seats: [SeatSchema],
});

const MovieInCinemaSchema = new Schema(
  {
    movieId: {
      type: Number,
      required: true,
    },
    sessions: [SessionSchema],
  },
  { strict: false }
);

module.exports = mongoose.model("MovieInCinema", MovieInCinemaSchema);
