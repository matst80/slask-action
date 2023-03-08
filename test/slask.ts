import core = require("@actions/core");
import github = require("@actions/github");
import fs = require("fs");

core.info("Hello world");
const payload = JSON.stringify(github.context.payload, undefined, 2);
console.log(`The event payload: ${payload}`);
fs.readdirSync(".").forEach((file) => {
  console.log(file);
});
