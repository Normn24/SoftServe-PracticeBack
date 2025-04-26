const Ticket = require('../models/Ticket');

exports.getUserTickets = async (req, res) => {
  const userId = req.user.id; 
  try {
    const tickets = await Ticket.find({ user: userId })
      // .populate('movieInCinema', 'title poster_path') 
      // .populate('customers', 'email');

    res.status(200).json(tickets);
  } catch (err) {
    console.error("Error fetching user tickets:", err);
    res.status(500).json({
      message: `Error happened on server while fetching user tickets: "${err.message || err}"`
    });
  }
};

exports.getTicketById = async (req, res) => {
  const ticketId = req.params.ticketId;

  try {
    const ticket = await Ticket.findById(ticketId)
      // .populate('movieInCinema', 'title poster_path')
      // .populate('user', 'email');

    if (!ticket) {
      return res.status(404).json({ message: `Ticket with ID "${ticketId}" not found.` });
    }

    res.status(200).json(ticket);
  } catch (err) {
    console.error("Error fetching ticket by ID:", err);
    res.status(500).json({
      message: `Error happened on server while fetching ticket with ID "${ticketId}": "${err.message || err}"`
    });
  }
};

exports.deleteTicket = async (req, res) => {
  const ticketId = req.params.ticketId;
  const userId = req.user.id; 
  try {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: `Ticket with ID "${ticketId}" not found.` });
    }

    if (ticket.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this ticket." });
    }

    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

    if (deletedTicket) {
      res.status(200).json({ message: `Ticket with ID "${ticketId}" successfully deleted.`, deletedTicket });
    } else {
      res.status(404).json({ message: `Ticket with ID "${ticketId}" not found (after deletion attempt).` });
    }

  } catch (err) {
    console.error("Error deleting ticket:", err);
    res.status(500).json({
      message: `Error happened on server while deleting ticket with ID "${ticketId}": "${err.message || err}"`
    });
  }
};