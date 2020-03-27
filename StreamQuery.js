const toReadable = require('duplex-to/readable')
const getStream = require('get-stream')
const { finished } = require('readable-stream')
const rdf = require('@rdfjs/data-model')
const N3Parser = require('@rdfjs/parser-n3')
const ResultParser = require('sparql-http-client/ResultParser')
const { tempFile } = require('./lib/temp')

class StreamQuery {
  constructor ({ endpoint, factory = rdf }) {
    this.endpoint = endpoint
    this.factory = factory
  }

  async query (query, resultFormat) {
    const { path, cleanup } = await tempFile({ content: query })
    const stream = await this.endpoint.exec('tdbquery', `--results=${resultFormat}`, `--query=${path}`)

    finished(stream, async () => cleanup())

    return stream
  }

  async construct (query) {
    const parser = new N3Parser({ factory: this.factory })

    return parser.import(await this.query(query, 'ntriples'))
  }

  async select (query) {
    const parser = new ResultParser()
    const result = await this.query(query, 'json')

    result.pipe(parser)

    return toReadable(parser)
  }

  async update (query) {
    const { path, cleanup } = await tempFile({ content: query })

    await getStream(await this.endpoint.exec('tdbupdate', `--update=${path}`))

    await cleanup()
  }
}

module.exports = StreamQuery
