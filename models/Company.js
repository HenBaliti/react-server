const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default:"local photo",
    required: true,
  },
  city: {
    type: String,
    default:"No city provided",
    required: true,
  },
  address: {
    type: String,
    default:"No address provided",
    required: true,
  },
  state: {
    type: String,
    default:"No state provided",
    required: true,
  },
  zip: {
    type: Number,
    default:1234,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  site: {
    type: String,
    default:"No website provided",
    required: true,
  },
  created_at: {
    type: timeStamp,
    required: true,
  },
});

module.exports = mongoose.model("Company", companySchema);
