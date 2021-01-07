const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Job = new Schema({
  progress: { type: String, default: "0%" },
  length: { type: Number },
  status: { type: String, default: "pending" },
  parameters: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("Job", Job);
