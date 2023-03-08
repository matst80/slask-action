const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')

core.info('Hello world')
const payload = JSON.stringify(github.context.payload, undefined, 2)
console.log(`The event payload: ${payload}`)
fs.readdirSync('.').forEach(file => {
	console.log(file)
})