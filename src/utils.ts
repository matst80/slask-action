export const getCommandAndArguments = (args: string[]) => {
	const [, , file, ...rest] = args
	let command = 'slask'

	const values = Object.fromEntries(rest.filter(d => d.includes('=')).map((arg) => arg.split('=')))

	return { command, file, values, args: rest.filter(d => !d.includes('=')) }
}
export const getOptions = (file: string, args: string[], values: Record<string, string>) => {
	const sha = require('child_process')
		.execSync('git rev-parse HEAD')
		.toString().trim()
	const argOptions = args[0] ? JSON.parse(args[0] ?? "{}") : {}
	return { job: 'manual trigger via cli', sha, ...argOptions, ...values }
}