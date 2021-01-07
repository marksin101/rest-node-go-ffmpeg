const Upload = require("../model/upload.model");
const fs = require("fs");
const path = require("path");
const ffprobe = require("../middleware/ffprobe.middleware");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Create,update and delete for Fileuploads

//Create new file in db and save file
function fileUpload(req, res, cb) {
  if (!req.files || !req.files.hasOwnProperty("data")) {
    cb({ message: "no file uploaded" });
  } else {
    let { name, mimetype, size } = req.files.data; // The key of the form-data must be "data"
    const data = req.files.data;
    const uploadPath = process.env.UPLOADPATH + name;
    data
      .mv(uploadPath)
      .then(
        ffprobe(uploadPath, (err, info) => {
          if (!err) {
            const upload = new Upload({
              name: name,
              mimetype: mimetype,
              info: info,
              size: size,
            });
            upload
              .save()
              .then(cb(null, { message: "file uploaded successfully" }))
              .catch((err) => cb(new Error(err)));
          } else {
            cb(new Error(err));
          }
        })
      )
      .catch((err) => cb(new Error(err)));
  }
}

//Get all files uploaded
async function queryAllFiles(cb) {
  Upload.find()
    .then((data) => cb(null, data))
    .catch((err) => cb(err));
}

//Get all files upload of certain type
async function queryAllOfCertainType(type, cb) {
  console.log(type);
  Upload.find({ mimetype: new RegExp(type) }, (err, data) => {
    if (!err) {
      cb(null, data);
    } else {
      cb(err);
    }
  });
}

//Delete file by ID
async function deleteFile(id, cb) {
  Upload.findByIdAndDelete(id, (err, data) => {
    if (!err) {
      let name = data.name;
      fs.unlink(process.env.UPLOADPATH + name, (err) => {
        if (!err) {
          cb("Unable to delete file");
        } else {
          cb(null, "file deleted successfully");
        }
      });
    } else {
      cb("Wrong File ID");
    }
  });
}

//Get file Info by ID
async function queryFileByID(id, cb) {
  Upload.findById(id, (err, data) => {
    if (!err) {
      cb(null, data);
    } else {
      cb("Wrong File ID");
    }
  });
}

// //Update file name only
// async function updateFile(req, res) {
//   Upload.findById(req.params.id)
//     .then((upload) => {
//       let originName = upload.name;
//       upload.name = req.body.name;
//       upload.save().then(() =>
//         res.status(200).json({
//           message: `${originName} has been updated to ${req.body.name}`,
//         })
//       );
//     })
//     .catch(() =>
//       res.status(500).json({ message: "file by this id doesn't exist" })
//     );
// }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//

module.exports = {
  fileUpload: fileUpload,

  queryAllFiles: queryAllFiles,
  queryAllOfCertainType: queryAllOfCertainType,
  deleteFile: deleteFile,
  queryFileByID: queryFileByID,
};
