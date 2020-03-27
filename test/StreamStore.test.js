const { strictEqual } = require('assert')
const { createReadStream } = require('fs')
const getStream = require('get-stream')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const ParserN3 = require('@rdfjs/parser-n3')
const data = require('./support/data')
const datasetFromFile = require('./support/datasetFromFile')
const withEndpoint = require('./support/withEndpoint')
const StreamStore = require('../StreamStore')

describe('StreamStore', () => {
  it('is a constructor', () => {
    strictEqual(typeof StreamStore, 'function')
  })

  describe('.import', () => {
    it('imports the quads from the given quad stream', async () => {
      await withEndpoint({ factory: rdf }, async endpoint => {
        const expected = await datasetFromFile(data.quads.path)
        const store = new StreamStore({ endpoint, factory: rdf })
        const parser = new ParserN3()
        const stream = createReadStream(data.quads.path)
        const quadStream = parser.import(stream)

        await store.import(quadStream)

        const results = await getStream.array(await store.dump())
        const dataset = rdf.dataset(results)

        strictEqual(dataset.size, 126)
        strictEqual(dataset.toCanonical(), expected.toCanonical())
      })
    })
  })

  describe('.dump', () => {
    it('returns a QuadStream of all quads', async () => {
      await withEndpoint({ factory: rdf }, async endpoint => {
        const expected = await datasetFromFile(data.quads.path)
        const store = new StreamStore({ endpoint, factory: rdf })
        await endpoint.importFiles([data.quads.path])

        const results = await getStream.array(await store.dump())
        const dataset = rdf.dataset(results)

        strictEqual(dataset.size, 126)
        strictEqual(dataset.toCanonical(), expected.toCanonical())
      })
    })
  })
})
