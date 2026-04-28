const express = require('express');
const router = express.Router();
const passport = require('passport');
const reviewsController = require('../controllers/reviews');

const auth = passport.authenticate('jwt', { session: false });

router.get('/movies/:movieId/reviews', reviewsController.getMovieReviews);

router.post(
  '/movies/:movieId/reviews',
  auth,
  reviewsController.createReview
);

router.get(
  '/reviews/me',
  auth,
  reviewsController.getUserReviews
);

router.get(
  '/reviews/check/:ticketId',
  auth,
  reviewsController.checkReviewExists
);

module.exports = router;