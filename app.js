require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fastcsv = require("fast-csv");
const fs = require("fs");
const { checkUrl, formatLogs } = require("./helper/helper");
const logger = require("./helper/api");

let nxt_url = "";
const logs = [];

const watson = {
  workspace_id: process.env.WORKSPACE_ID,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  version: process.env.VERSION
};

const app = express();
// Parse Only Json Data
app.use(bodyParser.json());

const createFile = async () => {
  let newurl = checkUrl(nxt_url, watson);
  let response = await logger(newurl, watson);

  if (response.data.pagination.next_url) {
    nxt_url = response.data.pagination.next_url;
    logs.push(...response.data.logs);
    return createFile();
  } else {
    logs.push(...response.data.logs);
    console.log("No More Logs");
    let name = `./output/out_${Date.now()}.csv`;
    const ws = fs.createWriteStream(name);
    const data = formatLogs(logs);
    let val = await csv(data, ws);
    return {
      message: val,
      path: name
    };
  }
};

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

app.get("/", async (request, response) => {
  try {
    let value = await createFile();
    if(value.message === "success") {
      console.log("TCL: value if", value)
      response.download(value.path);

    } else {
      console.log("TCL: value else", value)
      response.send({message: "failed"})
    }
    //response.send("okay");
  } catch (error) {
    console.log("Outter Error: ==> ", JSON.stringify(error));
  }
});

app.listen(8000, () => {
  console.log("server is running on port 8000");
});
