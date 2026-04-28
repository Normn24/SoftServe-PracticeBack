const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const CustomerSchema = new Schema(
  {
    customerNo: { type: String, required: true },
    firstName:  { type: String, required: false },
    login:      { type: String, required: false },
    email:      { type: String, required: true },
    password:   { type: String, required: true },
    birthdate:  { type: String },
    avatarUrl:  { type: String },
    isAdmin:    { type: Boolean, required: true, default: false },
    date:       { type: Date, default: Date.now },
    favorites:  [{ type: Number }],
    wishlist: [
      {
        movieId:     { type: Number, required: true },
        movieTitle:  { type: String, required: true },
        releaseDate: { type: Date, required: true },
        addedAt:     { type: Date, default: Date.now },
      },
    ],
  },
  { strict: false }
);

CustomerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("customers", CustomerSchema);