require("dotenv").config();
const fs = require("fs");

//Create file upload and output directories if they dont exist
function createDir(cb) {
  if (
    process.env.UPLOADPATH == undefined ||
    process.env.OUTPUTPATH == undefined
  ) {
    console.log("please specify upload path and output path");
    process.exit(1);
  } else {
    if (!fs.existsSync(process.env.UPLOADPATH)) {
      fs.mkdirSync(process.env.UPLOADPATH, (err) => {
        if (!err) {
          cb(err);
        } else {
          cb(null);
        }
      });
    }
    if (!fs.existsSync(process.env.OUTPUTPATH)) {
      fs.mkdirSync(process.env.OUTPUTPATH, (err) => {
        if (!err) {
          cb(err);
        } else {
          cb(null);
        }
      });
    }
  }
}

module.exports = createDir;
