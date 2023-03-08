import { parse } from 'yaml'
import express from 'express'
import bodyParser from 'body-parser'

const app = express()
app.use(express.static('public'))
app.use(bodyParser.text({ type: 'text/plain' }))

app.post('/', function (req, res) {
	const data = parse(req.body)
	const { metadata, apiVersion, kind, ...entry } = data
	const { namespace, ...meta } = metadata
	const [type, v] = (apiVersion ?? 'apps/v1').split('/')
	res.send(JSON.stringify({ metadata: meta, ...entry }, null, 2))
})

app.listen(3000)

