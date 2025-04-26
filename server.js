const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const cors = require("cors");
const nodemailer = require('nodemailer');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger/swagger.yaml');
require('dotenv').config();

const customers = require('./routes/customersRoutes');
const moviesRoutes = require('./routes/moviesRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const moviesInCinemaRoutes = require('./routes/moviesInCinemaRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const corsOptions = {
  // origin: "http://localhost:5173",
//   origin: "https://664df23ea1bb9d00088b4025--transcendent-tartufo-db32bd.netlify.app/",
};

app.use(cors());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./services/passport')(passport);

// Email setup
const transporter = nodemailer.createTransport({
  service: 'Gmail', // or another email service
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Use Routes
app.use('/api/customers', customers);
app.use('/api/movies', moviesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/movies-in-cinema', moviesInCinemaRoutes);
app.use('/api/tickets', ticketRoutes);


// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server running on port ${port}`));

