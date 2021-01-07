const router = require("express").Router();
const jobRouter = require("./job.router");
const workRouter = require("./work.router");
const uploadRouter = require("./upload.router");
router.get("/", (req, res) => {
  res.status(200).send("Api for ffmpeg-webui");
});

router.use("/job", jobRouter);

router.use("/work", workRouter);

router.use("/upload", uploadRouter);

module.exports = router;
