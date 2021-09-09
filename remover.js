const fs = require("fs");
const metadata = require("./metadata.json");

const { dataSets, ...other } = metadata;

fs.writeFile(
  "metdata1.json",
  JSON.stringify(other, null, 2),
  function (err, data) {
    if (err) {
      return console.log(err);
    }
    console.log(data);
  }
);
