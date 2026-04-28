const express = require('express');
require('express-async-errors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const cors = require("cors");
const nodemailer = require('nodemailer');
const { swaggerDocument, swaggerUi } = require('./swagger');
require('dotenv').config();

const customers = require('./routes/customersRoutes');
const moviesRoutes = require('./routes/moviesRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const moviesInCinemaRoutes = require('./routes/moviesInCinemaRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
};

app.use(cors());

const __swaggerDistPath = path.join(__dirname, "node_modules", "swagger-ui-dist");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
require('./services/passport')(passport);

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

app.use(
  "/api-docs",
  express.static(__swaggerDistPath, { index: false }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCssUrl: "/api-docs/swagger-ui.css",
    customJs: "/api-docs/swagger-ui-bundle.js",
  })
);

app.use('/api/customers', customers);
app.use('/api/movies', moviesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/movies-in-cinema', moviesInCinemaRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api', reviewRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

const port = process.env.PORT || 4000;

mongoose
 .connect(process.env.MONGO_URI)
 .then(() => {
    console.log('MongoDB Connected');
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
 .catch((err) => console.log(err));