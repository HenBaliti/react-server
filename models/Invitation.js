const { timeStamp } = require("console");
const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
    company_id: {
      type: String,
      default: "Unnamed",
      required: true,
    },
    user_id: {
      type: String,
      default: "Unnamed",
      required: true,
    },
    status: {
      type: String,
      enum : ['PENDING','ACCEPTED','DECLINE'],
      default: 'PENDING',
      required: true,
    },
    created_at: {
      type: timeStamp,
      required: true,
    },
  });
  
  module.exports = mongoose.model("Invitation", invitationSchema);
  