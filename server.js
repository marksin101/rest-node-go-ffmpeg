require("dotenv").config();
const app = require("express")();
const createDir = require("./src/middleware/createDir.middleware");
const connectDB = require("./src/middleware/mongoose.middleware");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const morgan = require("morgan");
const API = require("./src/routes/main.router");

connectDB(process.env.MONGO_URL, (err, info) => {
  if (!err) {
    console.log(info);
  } else {
    console.log(err);
    console.log(
      `Failed to connect to db using url ${process.env.MONGO_URL}. Exiting`
    );
    process.exit(1);
  }
});
createDir((err) => {
  if (err) {
    console.log(err);
    console.log("Cant craete input/output path");
    process.exit(1);
  }
});
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", API);
app.listen(process.env.PORT, () =>
  console.log(`listening on ${process.env.PORT}`)
);
