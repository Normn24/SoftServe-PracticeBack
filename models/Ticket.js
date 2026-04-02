const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  // Зберігає числовий movieId (не ObjectId) — відповідно populate не працює.
  // Lookup робимо вручну в контролері через MovieInCinema.find({ movieId })
  movieInCinema: {
    type: Number,
    required: true
  },
  session: {
    type: Schema.Types.ObjectId,
    required: true
  },
  seatNumber: {
    type: Number,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  // Потрібно для Етапу 3 (QR-валідація) та Етапу 4 (перевірка перегляду для відгуків)
  isUsed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Ticket', TicketSchema);