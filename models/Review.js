const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      unique: true,
    },
    ratings: {
      plot:      { type: Number, min: 1, max: 10, required: true },
      acting:    { type: Number, min: 1, max: 10, required: true },
      visuals:   { type: Number, min: 1, max: 10, required: true },
      sound:     { type: Number, min: 1, max: 10, required: true },
      direction: { type: Number, min: 1, max: 10, required: true },
    },
    comment: {
      type: String,
      maxlength: 1000,
      default: '',
    },
  },
  { timestamps: true }
);

ReviewSchema.virtual('averageRating').get(function () {
  const { plot, acting, visuals, sound, direction } = this.ratings;
  return +((plot + acting + visuals + sound + direction) / 5).toFixed(1);
});

ReviewSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Review', ReviewSchema);