const Ticket = require('../models/Ticket');

exports.getUserTickets = async (req, res) => {
  const userId = req.user.id; 
  const tickets = await Ticket.find({ user: userId });
  
  res.status(200).json(tickets);
};

exports.getTicketById = async (req, res) => {
  const ticketId = req.params.ticketId;
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    const error = new Error(`Ticket with ID "${ticketId}" not found.`);
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json(ticket);
};

exports.deleteTicket = async (req, res) => {
  const ticketId = req.params.ticketId;
  const userId = req.user.id; 

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    const error = new Error(`Ticket with ID "${ticketId}" not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (ticket.user.toString()!== userId) {
    const error = new Error("You are not authorized to delete this ticket.");
    error.statusCode = 403;
    throw error;
  }

  const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

  if (deletedTicket) {
    res.status(200).json({ message: `Ticket with ID "${ticketId}" successfully deleted.`, deletedTicket });
  } else {
    const error = new Error(`Ticket with ID "${ticketId}" not found (after deletion attempt).`);
    error.statusCode = 404;
    throw error;
  }
};