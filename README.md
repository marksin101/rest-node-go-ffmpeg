# rest-node-go-ffmpeg
Standalone docker app with Restapi for media manipulation using ffmpeg, Go, nodejs, express. Allow easy remote deployment with file upload and download built into the api.

# How to use
docker build -t . foo:bar
docker run -d foo:bar


This app must be used in conjunction with mongodb. 
Mongodb URL can be supplied at runtime through docker environemntal variable -e MONGO_URL

By default the port used for communication is 4000.
Port could be changed through docker environmental variable -e PORT


#  Sample:

#### Upload file  ####

var data = new FormData();
data.append('data', fs.createReadStream('foo'));

var config = {
  method: 'post',
  url: 'localhost:4000/api/upload/new',
  headers: { 
    ...data.getHeaders()
  },
  data : data
};
axios(config);

#### Create new job
 Each job must have input, output and parameter
 input is an array, parameter is an object, output is string
 everything is passed directly to ffmepg when the encoding start
####
var data = JSON.stringify({"input":["foo"],"parameter":{"-c:v":"libx264"},"output":"bar"});

var config = {
  method: 'post',
  url: 'localhost:4000/api/job/new',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};
axios(config);

#### Get all job info 
This part allows you to retrieve info and _id of each job.
This is crucial in that you can only initialize a job using its _id registered in mongodb
####
var config = {
  method: 'get',
  url: 'localhost:4000/api/job/info',
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})

#### Start a job / multiple jobs
This allows you to start a job or multiple jobs at once or sequentially
By defaults job are started sequentially 
####
var config = {
  method: 'post',
  url: 'localhost:4000/api/work?isOneByOne=false&id=foo&id=bar'
};
axios(config);

#### Download file when job has finished 
This part allows you to download one or multiple finished file at once
Files are enclosed in a tarball regardless
####
wget --no-check-certificate --quiet \
  --method POST \
  --timeout=0 \
  --header '' \
   'localhost:4000/api/job/download/?id=foo&id=bar&isMultiple=true'

############
The api also allow delete uploaded files, update a job and etc. 
For more details, refer to ./src/routes
