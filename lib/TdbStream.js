const N3Parser = require('@rdfjs/parser-n3')
const NTriplesSerializer = require('@rdfjs/serializer-ntriples')
const { SparqlJsonParser } = require('sparqljson-parse')
const { finished } = require('stream')
const { tempFile } = require('./temp')

class TdbStream {
  constructor (tdb) {
    this.tdb = tdb
  }

  async import (quadStream) {
    const serializer = new NTriplesSerializer()
    const stream = serializer.import(quadStream)

    await this.tdb.importStream(stream, { mediaType: 'application/n-quads' })
  }

  async dump () {
    const parser = new N3Parser({ factory: this.tdb.factory })

    return parser.import(await this.tdb.exec('tdbdump', '--stream=nquads'))
  }

  async query (query, resultFormat) {
    const { path, cleanup } = await tempFile({ content: query })

    const stream = await this.tdb.exec('tdbquery', `--results=${resultFormat}`, `--query=${path}`)

    finished(stream, async () => {
      await cleanup()
    })

    return stream
  }

  async constructQuery (query) {
    const parser = new N3Parser({ factory: this.tdb.factory })

    return parser.import(await this.query(query, 'ntriples'))
  }

  async selectQuery (query) {
    const parser = new SparqlJsonParser({ dataFactory: this.factory })

    return parser.parseJsonResultsStream(await this.query(query, 'json'))
  }
}

module.exports = TdbStream
