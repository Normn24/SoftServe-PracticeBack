const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket');
const passport = require('passport');
const requireRole = require('../middleware/requireRole');

router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  ticketController.getUserTickets
);

router.get(
  '/:ticketId',
  passport.authenticate('jwt', { session: false }),
  ticketController.getTicketById
);

router.delete(
  '/:ticketId',
  passport.authenticate('jwt', { session: false }),
  ticketController.deleteTicket
);

router.put(
  '/:ticketId/validate',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  ticketController.validateTicket
);

module.exports = router;