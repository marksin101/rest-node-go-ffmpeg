const mongoose = require("mongoose");

function dbConnect(url, cb) {
  mongoose.connect(
    url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (!err) {
        cb(null, "db connected successfully");
      } else {
        console.log(err);
        cb(err);
      }
    }
  );
}
module.exports = dbConnect;
