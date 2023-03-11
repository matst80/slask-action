import * as core from "@actions/core";
import * as github from "@actions/github";

import { join } from "path";

import { makeSlask } from "./slask-base";

const scriptFile =
  core.getInput("scriptPath") ??
  process.env.SCRIPT_PATH ??
  "operations/deploy.js";

const localPath = process.env.GITHUB_WORKSPACE ?? ".";
core.info("Loading deployment script: " + scriptFile);

const file = join(localPath, scriptFile);
core.info(file);

export default makeSlask(core, file, github.context);
