const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    if (role === 'admin' &&!req.user.isAdmin) {
      const error = new Error("You do not have enough permissions for this operation");
      error.statusCode = 403;
      throw error;
    }

    next();
  };
};

module.exports = requireRole;