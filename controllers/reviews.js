const { z } = require('zod');
const Review = require('../models/Review');
const Ticket = require('../models/Ticket');

const reviewSchema = z.object({
  ticketId: z.string().length(24, 'Invalid ticketId'),
  ratings: z.object({
    plot:      z.number().int().min(1).max(10),
    acting:    z.number().int().min(1).max(10),
    visuals:   z.number().int().min(1).max(10),
    sound:     z.number().int().min(1).max(10),
    direction: z.number().int().min(1).max(10),
  }),
  comment: z.string().max(1000).optional().default(''),
  movieTitle: z.string().max(1000),
});

exports.createReview = async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  const { ticketId, ratings, comment, movieTitle } = parsed.data;
  const userId = req.user.id;
  const movieId = Number(req.params.movieId);

  const ticket = await Ticket.findOne({ _id: ticketId, user: userId, movieInCinema: movieId });

  if (!ticket) {
    const error = new Error('Ticket not found or does not belong to you.');
    error.statusCode = 404;
    throw error;
  }

  if (!ticket.isUsed) {
    const error = new Error('You can only review a movie after watching it.');
    error.statusCode = 403;
    throw error;
  }

  const existing = await Review.findOne({ ticketId });
  if (existing) {
    const error = new Error('You have already reviewed this ticket.');
    error.statusCode = 409;
    throw error;
  }

  const review = await Review.create({ user: userId, movieId, movieTitle, ticketId, ratings, comment });
  res.status(201).json(review);
};

exports.getMovieReviews = async (req, res) => {
  const movieId = Number(req.params.movieId);
  const reviews = await Review.find({ movieId })
    .sort({ createdAt: -1 })
    .select('-user');
  res.status(200).json(reviews);
};

exports.getUserReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(reviews);
};

exports.checkReviewExists = async (req, res) => {
  const { ticketId } = req.params;
  const existing = await Review.findOne({ ticketId, user: req.user.id });
  res.status(200).json({ exists: !!existing, reviewId: existing?._id ?? null });
};

exports.getUserReviewStats = async (req, res) => {
  const reviews = await Review.find({ user: req.user.id });
  const count = reviews.length;
  const avgRating = count > 0 
    ? reviews.reduce((acc, r) => acc + r.averageRating, 0) / count 
    : 0;
  res.status(200).json({ count, avgRating });
};

const updateReviewSchema = z.object({
  ratings: z.object({
    plot:      z.number().int().min(1).max(10),
    acting:    z.number().int().min(1).max(10),
    visuals:   z.number().int().min(1).max(10),
    sound:     z.number().int().min(1).max(10),
    direction: z.number().int().min(1).max(10),
  }).optional(),
  comment: z.string().max(1000).optional(),
});

exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const parsed = updateReviewSchema.safeParse(req.body);
  
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  const review = await Review.findOne({ _id: reviewId, user: req.user.id });
  if (!review) {
    const error = new Error('Review not found or you do not have permission to edit it.');
    error.statusCode = 404;
    throw error;
  }

  if (parsed.data.ratings) {
    review.ratings = { ...review.ratings, ...parsed.data.ratings };
  }
  if (parsed.data.comment !== undefined) {
    review.comment = parsed.data.comment;
  }

  await review.save();
  res.status(200).json(review);
};

exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findOneAndDelete({ _id: reviewId, user: req.user.id });
  if (!review) {
    const error = new Error('Review not found or you do not have permission to delete it.');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ message: 'Review deleted successfully', reviewId });
};