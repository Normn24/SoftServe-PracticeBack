const express = require('express');
const router = express.Router();
const passport = require('passport');
const wishlistController = require('../controllers/wishlist');

const auth = passport.authenticate('jwt', { session: false });

router.get('/',           auth, wishlistController.getWishlist);
router.post('/',          auth, wishlistController.addToWishlist);
router.delete('/:movieId', auth, wishlistController.removeFromWishlist);

module.exports = router;