const router = require("express").Router();
const goFFmpeg = require("../controller/work.controller");

router.post("/", (req, res) => {
  if (req.query.id != undefined) {
    let isOneByOne = false;
    if (req.query.isOneByOne != undefined) {
      if (req.query.isOneByOne == "true") {
        isOneByOne = true;
      }
    }

    goFFmpeg(req.query.id, isOneByOne, (err) => {
      if (!err) {
        res.status(200).json({ msg: "job has been started" });
      } else {
        res.status(400).json(err);
      }
    });
  } else {
    console.log("run");
    res.status(400).json("Bad Request");
  }
});

module.exports = router;
