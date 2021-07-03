const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    default: "Unnamed",
    required: true,
  },
  last_name: {
    type: String,
    default: "Unnamed",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  super_admin: {
    type: Boolean,
    default: false,
  },
  job_title: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  avatar:{
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  },
});

module.exports = mongoose.model("User", userSchema);
