#!/usr/bin/env node

import { ActionsCore, makeSlask } from "./slask-base"
import { getCommandAndArguments, getOptions } from "./utils"

const { args, file, values } = getCommandAndArguments(process.argv)

const outputs = {}

const fakeCore: ActionsCore = {
  setOutput: (name: string, value: any) => {
    outputs[name] = value
  },
  setFailed: (message: string) => console.error(message),
  getInput: (name: string, options?: any) => process.env[name],
  info: (message: string) => console.log(message),
}

makeSlask(fakeCore, file, getOptions(file, args, values))
