const fs = require("fs");
const metadata = require("./IPC_Assesment_RhitesNAcholi_results.json");


fs.writeFile(
  "metdata1.json",
  JSON.stringify(metadata, null, 2),
  function (err, data) {
    if (err) {
      return console.log(err);
    }
    console.log(data);
  }
);
