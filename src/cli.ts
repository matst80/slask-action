#!/usr/bin/env node

import { ActionsCore, makeSlask } from "./slask-base";

const [, , ...args] = process.argv;
console.log(args);
const fakeCore: ActionsCore = {
  setOutput: (name: string, value: any) => console.log("Output:", name, value),
  setFailed: (message: string) => console.error(message),
  getInput: (name: string, options?: any) => process.env[name],
  info: (message: string) => console.log(message),
};
makeSlask(fakeCore, args[0], JSON.parse(args[1] ?? "{}"));
