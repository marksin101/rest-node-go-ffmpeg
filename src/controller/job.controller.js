const Job = require("../model/job.model");
require("dotenv").config();

//Create,Update,Query and Delete Jobs

//Update Job
function updateJob(id, newParameters, cb) {
  queryJob(id, (err, oldParameters) => {
    if (!err) {
      let jobStatus =
        typeof newParameters !== "undefined"
          ? newParameters.status
          : oldParameters.status;
      let parametersToBeUpdated = {};
      for (let key in oldParameters.parameters) {
        if (newParameters.parameters.hasOwnProperty(key)) {
          parametersToBeUpdated[key] = newParameters.parameters[key];
        } else {
          parametersToBeUpdated[key] = oldParameters.parameters[key];
        }
      }
      for (let key in newParameters.parameters) {
        if (!parametersToBeUpdated.hasOwnProperty(key)) {
          parametersToBeUpdated[key] = newParameters.parameters[key];
        }
      }
      console.log(parametersToBeUpdated);
      Job.findByIdAndUpdate(id, {
        status: jobStatus,
        parameters: { ...parametersToBeUpdated },
      })
        .then(() => cb(null, "updated successfully"))
        .catch((err) => cb(err));
    } else {
      cb(err);
    }
  });
}

//Create Job

// Each job must contain 3 keys: input, paramaters and output
// input is an array of string , output is a string, parameter is an object
// Each key in the paramter is the parameter that you will normally use when you
function createNewJob(body, parameters, cb) {
  let jobDetails;
  jobDetails = { commands: parameters };
  let length = typeof body.length === "undefined" ? 0 : body.length;
  jobDetails.output = process.env.OUTPUTPATH + body.output;
  jobDetails.inputFiles = body.input.map(
    (inputName) => process.env.UPLOADPATH + inputName
  );
  const newJob = new Job({
    length: length,
    parameters: { ...jobDetails },
  });
  newJob.save((err) => {
    if (err) {
      console.log(err);
      cb("failed to create new job");
    } else {
      cb(null, "job created successfully");
    }
  });
}

//Delete Job
function deleteJob(id, cb) {
  Job.remove({ _id: id }, function (err) {
    if (!err) {
      cb(null, `Job ${id} deleted successfully`);
    } else {
      cb(err);
    }
  });
}

//Get Job info by ID
function queryJob(id, cb) {
  Job.findById(id)
    .then((data) => cb(null, data))
    .catch((err) => cb("Wrong Job ID"));
}

//Get all Jobs
function queryAllJobs(cb) {
  Job.find()
    .then((data) => cb(null, data))
    .catch((err) => cb(err));
}

module.exports = {
  createNewJob: createNewJob,
  queryAllJobs: queryAllJobs,
  queryJob: queryJob,
  deleteJob: deleteJob,
  updateJob: updateJob,
};
