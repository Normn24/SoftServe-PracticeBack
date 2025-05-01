const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcryptjs");

const CustomerSchema = new Schema(
  {
    customerNo: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: false
    },
    login: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    birthdate: {
      type: String
    },
    avatarUrl: {
      type: String
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    },
    date: {
      type: Date,
      default: Date.now
    },
    favorites: [{
      type: Number
    }]
  },
  { strict: false }
);

CustomerSchema.methods.comparePassword = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};


module.exports = Customer = mongoose.model("customers", CustomerSchema);
