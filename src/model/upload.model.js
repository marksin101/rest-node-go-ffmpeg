const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Upload = new Schema({
  name: { required: true, type: String },
  mimetype: { required: true, type: String },
  size: { required: true, type: Number },
  info: { required: true, type: Object },
});

module.exports = mongoose.model("Upload", Upload);
