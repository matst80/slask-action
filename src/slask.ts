import * as core from "@actions/core";
import * as github from "@actions/github";

import { join } from "path";
import { secretFactory, secretStorageFactory } from "./secrets";

import { makeSlask } from "./slask-base";

const scriptFile =
  core.getInput("scriptPath") ??
  process.env.SCRIPT_PATH ??
  "operations/deploy.js";

const localPath = process.env.GITHUB_WORKSPACE ?? ".";

const file = join(localPath, scriptFile);
core.info("Loading deployment script: " + file);

const secretStore = secretStorageFactory(
  join(localPath, core.getInput("configFile") || "./.slask"),
  secretFactory(core.getInput("secret") || process.env.SLASK_SECRET)
);

export default makeSlask(core, file, github.context, secretStore);
