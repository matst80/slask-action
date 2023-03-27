#!/usr/bin/env node

import { secretFactory, secretStorageFactory } from "./secrets";
import { ActionsCore, makeSlask } from "./slask-base";
import { getCommandAndArguments, getOptions } from "./utils";

const { args, file, values, command, secretsFile } = getCommandAndArguments(
  process.argv
);

const outputs = {};

const secretStorage = secretStorageFactory(
  secretsFile,
  secretFactory(values["--secrets-key"] ?? process.env.SLASK_SECRET)
);
if (command === "print-env") {
  secretStorage.getAll().then((secrets) => {
    Object.entries(secrets).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
  });
} else if (command === "set-secret") {
  secretStorage.setSecret(args[0], args[1]);
} else if (command === "set") {
  secretStorage.set(args[0], args[1]);
} else {
  const opt = getOptions(file ?? "", args, values);

  const fakeCore: ActionsCore = {
    setOutput: (name: string, value: any) => {
      outputs[name] = value;
    },
    setFailed: (message: string) => console.error(message),
    getInput: (name: string, options?: any) =>
      process.env[name] ?? opt[name] ?? options?.default,
    info: (message: string) => console.log(message),
  };

  makeSlask(fakeCore, file, opt, secretStorage);
}
