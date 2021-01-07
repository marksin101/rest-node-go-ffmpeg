const express = require("express");
require("dotenv").config();
const tar = require("tar-fs");
const fs = require("fs");
const router = express.Router();
const {
  createNewJob,
  queryJob,
  queryAllJobs,
  updateJob,
  deleteJob,
} = require("../controller/job.controller");
const createDownloadContext = require("../middleware/downloadContext.middleware");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////Create Jobs/Update Jobs/Delete Jobs/Query Jobs/Download file upon completion
router.post("/new", (req, res) => {
  if (
    req.body.hasOwnProperty("input") &&
    req.body.hasOwnProperty("parameters") &&
    req.body.hasOwnProperty("output")
  ) {
    createNewJob(req.body, req.body.parameters, (err, info) => {
      if (!err) {
        res.status(200).json(info);
      } else {
        res.status(400).json(err);
      }
    });
  } else {
    res.status(400).json({ Err: " fileID / parameters / output is missing" });
  }
});

// Update Jobs
router.post("/update/:id", async (req, res) => {
  if (req.params.id !== "undefined") {
    updateJob(req.params.id, req.body, (err, info) => {
      if (!err) {
        res.status(200).json(info);
      } else {
        res.status(400).json(err);
      }
    });
  } else {
    res.status(400).json("please provide Job ID");
  }
});
//Delete Job
router.delete("/:id", async (req, res) => {
  if (req.params.id !== "undefined") {
    deleteJob(req.params.id, (err, info) => {
      if (!err) {
        res.status(200).json(info);
      } else {
        res.status(400).json(err);
      }
    });
  } else {
    res.status(400).json("please provide Job ID");
  }
});

// Get Job info
router.get("/info/", (req, res) => {
  if (req.query.getAll === "true") {
    queryAllJobs((err, info) => {
      if (!err) {
        res.status(200).json(info);
      } else {
        res.status(400).json(err);
      }
    });
  } else if (req.query.id != undefined) {
    queryJob(req.query.id, (err, info) => {
      if (!err) {
        res.status(200).json(info);
      } else {
        res.status(400).json(err);
      }
    });
  }
});

router.get("/download/", (req, res) => {
  if (req.query.id != undefined) {
    let isMultiple;
    req.query.isMultiple == "true" ? (isMultiple = true) : (isMultiple = false);
    createDownloadContext(req.query.id, isMultiple, (err, info) => {
      if (!err) {
        res.set({
          "Content-Disposition":
            "attachment; filename=" +
            "download" +
            Math.round(Math.random() * 100) +
            ".tar",
          //Cant set the Content length because the exact size of the tar output is unknown!! Otherwise the download would finish prematurely or download would fail
          // "Content-Length": info.totalSize + 1048576,
          "Content-Type": " application/x-tar",
          "Content-Transfer-Encoding": "binary",
        });
        tar
          .pack(process.env.OUTPUTPATH, {
            entries: info.filesNames,
          })
          .pipe(res);
      }
    });
  } else {
    res.status(400).json({ msg: "id missing" });
  }
});

module.exports = router;
