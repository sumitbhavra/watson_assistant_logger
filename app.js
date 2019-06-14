//--------------------------------------------------------------------------------------
// IMPORTS API Libraries
//--------------------------------------------------------------------------------------

// require("dotenv").config(); // load .env file
const express = require("express");
const bodyParser = require("body-parser");
const fastcsv = require("fast-csv"); // csv file creator module
const fs = require("fs"); // file system

//--------------------------------------------------------------------------------------
// IMPORTS CUSTOM HELPER FUNCTIONS 
//--------------------------------------------------------------------------------------

const { checkUrl, formatLogs } = require("./helper/helper"); 
const logger = require("./helper/api");


//--------------------------------------------------------------------------------------
// Global 
//--------------------------------------------------------------------------------------

let nxt_url = "";
const logs = [];

const watson = {
  workspace_id: '',
  username: '',
  password: '',
  version: '2019-02-28'
};

const app = express();
// Parse Only Json Data
app.use(bodyParser.json());

// 
const createFile = async () => {
  // checking and selecting watson url based on its response
  let newurl = checkUrl(nxt_url, watson);

  // calling watson assistant service
  let response = await logger(newurl, watson);

  // checking if watson response include next_url and cursor. If yes calling this function again
  if (response.data.pagination.next_url) {
    nxt_url = response.data.pagination.next_url;
    logs.push(...response.data.logs);
    return createFile();
  } else {
    logs.push(...response.data.logs);
    console.log("No More Logs");
    // Genrating CSV filename
    let name = `./output/out_${Date.now()}.csv`;
    const ws = fs.createWriteStream(name);

    // calling formatLogs which return new obj with imp data
    const data = formatLogs(logs);

    // calling csv function to write data in csv file and returns message and path of that file
    let val = await csv(data, ws);
    return {
      message: val,
      path: name
    };
  }
};

/**
 * will write logs in csv file
 *
 * @param {Object} data
 * @param {WritableStream} ws
 * @returns Promise
 */
const csv = (data, ws) => {
  return new Promise((resolve, reject) => {
    fastcsv
      .write(data, { headers: true })
      .pipe(ws)
      .on('finish', () => {
        resolve("success")
      })
      .on('error', (error) => {
        reject("failed");
      });
  })
}

// Get End point require workspace_id/username/password
// Example: http://localhost:8000/<your_watson_assistant_workspace_id>/<watson_username>/<watson_password>
app.get("/:workspace_id/:username/:password", async (request, response) => {
  const {workspace_id, username, password} = request.params;
  watson.workspace_id = workspace_id;
  watson.username = username;
  watson.password = password;
  try {
    // callinf createFile function and check response message values
    let value = await createFile();
    if(value.message === "success") {
      // if promise resolved browser will ask to download csv file
      response.download(value.path);
    } else { 
      console.log("TCL: value else", value)
      response.send({message: "failed"})
    }
  } catch (error) {
    console.log("Outter Error: ==> ", JSON.stringify(error));
  }
});

//--------------------------------------------------------------------------------------
// Server Config 
//--------------------------------------------------------------------------------------

app.listen(8000, () => {
  console.log("server is running on port 8000");
});
