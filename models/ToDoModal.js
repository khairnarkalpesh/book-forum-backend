const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Active",
  },
  user: {
    type: String,
    ref: "user",
    required: true,
  },
});

module.exports = mongoose.model("ToDo", todoSchema);
