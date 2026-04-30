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
  '/reviews/me/stats',
  auth,
  reviewsController.getUserReviewStats
);

router.get(
  '/reviews/check/:ticketId',
  auth,
  reviewsController.checkReviewExists
);

router.put(
  '/reviews/:reviewId',
  auth,
  reviewsController.updateReview
);

router.delete(
  '/reviews/:reviewId',
  auth,
  reviewsController.deleteReview
);

module.exports = router;