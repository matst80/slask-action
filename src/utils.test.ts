import { describe, it, expect } from "vitest"
import { getCommandAndArguments, getOptions } from "./utils"

describe("argument parser", () => {
	it("should parse file and values", () => {
		const processArgs = ["", "", "slask.cjs", "hej=1", "test=plupp", "b=false"]
		const { file, args, values, command } = getCommandAndArguments(processArgs)
		expect(args).toEqual([])
		expect(file).toBe("slask.cjs")
		expect(command).toBe("slask")
		expect(values).toEqual({
			hej: "1",
			test: "plupp",
			b: "false",
		})
	})

	it("should parse file and values", () => {
		const processArgs = ["", ""]
		const { file, args, values } = getCommandAndArguments(processArgs)
		expect(args).toEqual([])
		expect(file).toBeFalsy()
		expect(values).toEqual({})
	})
})

describe("options merger", () => {
	it("should handle defaults", () => {
		const processArgs = ["", "", "slask.cjs", "{\"foo\":1337}", "hej=1", "test=plupp", "b=false"]
		const { file, args, values } = getCommandAndArguments(processArgs)
		const options = getOptions(file, args, values)
		const sha = require('child_process')
			.execSync('git rev-parse HEAD')
			.toString().trim()
		expect(options).toEqual({
			sha,
			job: 'manual trigger via cli',
			foo: 1337,
			hej: "1",
			test: "plupp",
			b: "false",
		})
	})
})