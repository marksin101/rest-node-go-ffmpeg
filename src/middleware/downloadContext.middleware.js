const fs = require("fs");
const Job = require("../model/job.model");
require("dotenv").config();

//Create Context for Tar stream
function createDownloadContext(id, isMultiple, cb) {
  new Promise((resolve, reject) => {
    let downloadList = new Array();
    let itemProcessed = 0;
    if (isMultiple) {
      id.forEach((e) => {
        Job.findById(e)
          .then((info) => {
            itemProcessed++;
            if (info.status != "finished") {
              console.log(
                `Job ${e} current status is ${info.status}. Skipping`
              );
            } else {
              downloadList.push(info.parameters.output);
            }
          })
          .then(() => {
            if (itemProcessed === id.length) {
              if (downloadList.length != 0) {
                resolve(downloadList);
              } else {
                reject("None of the job is finished");
              }
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    } else {
      Job.findById(id)
        .then((info) => {
          if (info.status != "finished") {
            console.log(`Job current status is ${info.status}. Skipping`);
            reject(`Job's status is ${info.status}`);
          } else {
            downloadList.push(info.parameters.output);
            resolve(downloadList);
          }
        })
        .catch((err) => {
          reject("Wrong ID");
        });
    }
  })
    .then((list) => {
      filesNames = list.map((e) => {
        return e.split(process.env.OUTPUTPATH)[1];
      });
      let totalSize = 0;
      list.forEach((e) => {
        totalSize += fs.statSync(e).size;
      });
      cb(null, { filesNames, totalSize });
    })
    .catch((err) => {
      cb(err);
    });
}

module.exports = createDownloadContext;
