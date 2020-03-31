const rdf = require('@rdfjs/data-model')
const N3Parser = require('@rdfjs/parser-n3')
const NTriplesSerializer = require('@rdfjs/serializer-ntriples')
const { tempFile } = require('./lib/temp')

class StreamStore {
  constructor ({ endpoint, factory = rdf }) {
    this.endpoint = endpoint
    this.factory = factory
  }

  async import (quadStream) {
    const serializer = new NTriplesSerializer()
    const stream = serializer.import(quadStream)

    const { path, cleanup } = await tempFile({ contentStream: stream, postfix: '.nq' })

    await this.endpoint.importFiles([path])

    await cleanup
  }

  async dump () {
    const parser = new N3Parser({ factory: this.factory })
    const stream = await this.endpoint.exec('tdbdump', '--stream=nquads')

    return parser.import(stream)
  }
}

module.exports = StreamStore
