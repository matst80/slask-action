#!/usr/bin/env node

import { ActionsCore, makeSlask } from "./slask-base"
import { getCommandAndArguments, getOptions } from "./utils"

const { args, file, values } = getCommandAndArguments(process.argv)

const outputs = {}

const opt = getOptions(file, args, values)

const fakeCore: ActionsCore = {
  setOutput: (name: string, value: any) => {
    outputs[name] = value
  },
  setFailed: (message: string) => console.error(message),
  getInput: (name: string, options?: any) => process.env[name] ?? opt[name] ?? options.default,
  info: (message: string) => console.log(message),
}

makeSlask(fakeCore, file, opt)
