const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket");
const passport = require("passport");

router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  ticketController.getUserTickets
);

router.get(
  "/:ticketId",
  passport.authenticate("jwt", { session: false }),
  ticketController.getTicketById
);

router.delete(
  "/:ticketId",
  passport.authenticate("jwt", { session: false }),
  ticketController.deleteTicket
);

module.exports = router;
