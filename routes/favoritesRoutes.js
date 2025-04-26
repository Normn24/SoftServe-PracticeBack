const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favorites");
const passport = require("passport");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  favoritesController.getFavorites
);

router.post(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  favoritesController.addToFavorites
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  favoritesController.removeFromFavorites
);

module.exports = router;
