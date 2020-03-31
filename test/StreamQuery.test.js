const { strictEqual } = require('assert')
const getStream = require('get-stream')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const data = require('./support/data')
const datasetFromFile = require('./support/datasetFromFile')
const withEndpoint = require('./support/withEndpoint')
const StreamQuery = require('../StreamQuery')
const StreamStore = require('../StreamStore')

describe('StreamQuery', () => {
  it('is a constructor', () => {
    strictEqual(typeof StreamQuery, 'function')
  })

  describe('.construct', () => {
    it('returns a QuadStream of all quads from the CONSTRUCT query', async () => {
      await withEndpoint(async endpoint => {
        const expected = await datasetFromFile(data.triples.path)
        const query = new StreamQuery({ endpoint, factory: rdf })
        await endpoint.importFiles([data.triples.path])

        const results = await getStream.array(await query.construct('CONSTRUCT { ?s ?p ?o. } WHERE { ?s ?p ?o. }'))
        const dataset = rdf.dataset(results)

        strictEqual(dataset.size, 126)
        strictEqual(dataset.toCanonical(), expected.toCanonical())
      })
    })
  })

  describe('.select', () => {
    it('returns a Stream of the results as RDF/JS objects', async () => {
      await withEndpoint({ factory: rdf }, async endpoint => {
        const query = new StreamQuery({ endpoint, factory: rdf })
        await endpoint.importFiles([data.triples.path])

        const results = await getStream.array(await query.select('SELECT * WHERE { ?s ?p ?o. }'))

        strictEqual(results.length, 126)
        strictEqual(typeof results[0].s.termType, 'string')
        strictEqual(typeof results[0].s.value, 'string')
      })
    })
  })

  describe('.update', () => {
    it('runs the update query', async () => {
      await withEndpoint({ factory: rdf }, async endpoint => {
        const query = new StreamQuery({ endpoint, factory: rdf })
        const quad = rdf.quad(
          rdf.namedNode('http://example.org/subject'),
          rdf.namedNode('http://example.org/predicate'),
          rdf.literal('object'))

        await query.update(`INSERT DATA { ${quad.toString()} }`)

        const store = new StreamStore({ endpoint, factory: rdf })
        const result = await getStream.array(await store.dump())

        strictEqual([...result][0].equals(quad), true)
      })
    })
  })
})
