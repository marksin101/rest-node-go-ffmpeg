require("dotenv").config();
const spawn = require("child_process").spawn;
function goGoFFmpeg(id, isOneByOne, cb) {
  let args = new Array();
  if (Array.isArray(id)) {
    console.log("run");
    args = id.reduce((r, a) => r.concat("-id", a), []);
  } else {
    args = args.concat("-id", id);
  }
  if (isOneByOne) {
    args = args.concat("-s", "true");
  }
  let proc = spawn(
    process.env.GO_TOOL_FFMPEG,
    ["-m", process.env.MONGO_URL, ...args],
    { detached: true, stdio: "inherit" }
  );
  proc.unref();
  proc.on("exit", (code) => {
    cb(`job exited immediately with code ${code}`);
    clearTimeout(timerSucess);
  });
  let timerSucess = setTimeout(() => {
    cb(null, "job has been started");
    proc.removeAllListeners();
  }, 1000);
}

module.exports = goGoFFmpeg;
