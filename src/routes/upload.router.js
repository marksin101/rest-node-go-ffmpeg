const router = require("express").Router();
const {
  fileUpload,
  queryAllFiles,
  queryAllOfCertainType,
  deleteFile,
  queryFileByID,
} = require("../controller/upload.controller");
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////// Upload Files,Query Files, Delete Files

// Upload files
router.post("/new", (req, res) => {
  try {
    fileUpload(req, res, (err, info) => {
      if (!err) {
        res.status(200).json(info);
      } else {
        res.status(400).json(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

//Get All File info of Certain Type
router.get("/type/", (req, res) => {
  try {
    if (req.query.type == "undefined") {
      res.status(400);
    } else if (req.query.type == "all") {
      queryAllFiles((err, info) => {
        if (!err) {
          res.status(200).json(info);
        } else {
          res.status(400).json(err);
        }
      });
    } else {
      queryAllOfCertainType(req.query.type, (err, info) => {
        if (!err) {
          res.status(200).json(info);
        } else {
          res.status(400).json(err);
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//Get File info by ID
router.get("/:id", (req, res) => {
  try {
    queryFileByID(req.params.id, (err, info) => {
      if (!err) {
        res.status(200).json(info);
      } else {
        res.status(400).json(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

//Delete file by ID
router.delete("/delete/:id", (req, res) => {
  console.log("hit");
  console.log(req.params.id);
  if (req.params.id != undefined) {
    deleteFile(req.params.id, (err, info) => {
      if (!err) {
        res.status(200).json(info);
      } else {
        res.status(400).json(err);
      }
    });
  } else {
    res.status(400).json("Bad Request");
  }
});

module.exports = router;
