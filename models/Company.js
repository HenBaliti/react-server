const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "local photo",
    // required: true,
  },
  city: {
    type: String,
    default: "No city provided",
    // required: true,
  },
  address: {
    type: String,
    default: "No address provided",
    // required: true,
  },
  state: {
    type: String,
    default: "No state provided",
    // required: true,
  },
  zip: {
    type: Number,
    default: 1234,
    // required: true,
  },
  company_phone: {
    type: String,
    // required: true,
  },
  company_email: {
    type: String,
    // required: true,
  },
  website: {
    type: String,
    default: "No website provided",
    // required: true,
  },
  primary_contact_name: {
    type: String,
    required: true,
  },
  primary_contact_phone: {
    type: String,
    required: true,
  },
  primary_contact_job_title: {
    type: String,
    required: true,
  },
  primary_contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  created_at: {
    type: Date,
    required: true,
  },
  managers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  ],
});

module.exports = mongoose.model("Company", companySchema);
