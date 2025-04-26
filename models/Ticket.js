const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  movieInCinema: {
    type: Number,
    ref: 'MovieInCinema', 
    required: true
  },
  session: {
    type: Schema.Types.ObjectId,
    required: true 
  },
  seatNumber: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ticket', TicketSchema);