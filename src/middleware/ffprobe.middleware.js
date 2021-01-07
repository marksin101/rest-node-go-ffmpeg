const ffmpeg = require("fluent-ffmpeg");

function ffprobe(data, cb) {
  ffmpeg(data)
    .input(data)
    .ffprobe((err, data) => {
      if (!err) {
        cb(err, data);
      } else cb(new Error(err));
    });
}

module.exports = ffprobe;
