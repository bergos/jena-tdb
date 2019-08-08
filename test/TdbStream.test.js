/* global describe, expect, it, jest */

const data = require('./support/data')
const datasetFromFile = require('./support/datasetFromFile')
const { createReadStream } = require('fs')
const getStream = require('get-stream')
const ParserN3 = require('@rdfjs/parser-n3')
const rdf = require('rdf-ext')
const Tdb = require('../lib/Tdb')
const TdbStream = require('../lib/TdbStream')

jest.setTimeout(10000)

describe('TdbStream', () => {
  it('is a constructor', () => {
    expect(typeof TdbStream).toBe('function')
  })

  describe('.import', () => {
    it('imports the quads from the given quad stream', async () => {
      const expected = await datasetFromFile(data.quads.path)
      const db = new Tdb({ factory: rdf })
      const dbStream = new TdbStream(db)
      const parser = new ParserN3()
      const stream = createReadStream(data.quads.path)
      const quadStream = parser.import(stream)

      await dbStream.import(quadStream)

      const results = await db.dump()
      await db.destroy()

      expect(results.size).toBe(126)
      expect(results.toCanonical()).toBe(expected.toCanonical())
    })
  })

  describe('.dump', () => {
    it('returns a QuadStream of all quads', async () => {
      const expected = await datasetFromFile(data.quads.path)
      const db = new Tdb()
      const dbStream = new TdbStream(db)
      await db.importFiles([data.quads.path])

      const results = await getStream.array(await dbStream.dump())

      const dataset = rdf.dataset(results)
      await db.destroy()

      expect(dataset.size).toBe(126)
      expect(dataset.toCanonical()).toBe(expected.toCanonical())
    })
  })

  describe('.constructQuery', () => {
    it('returns a QuadStream of all quads from the CONSTRUCT query', async () => {
      const expected = await datasetFromFile(data.triples.path)
      const db = new Tdb()
      const dbStream = new TdbStream(db)
      await db.importFiles([data.triples.path])

      const results = await getStream.array(await dbStream.constructQuery('CONSTRUCT { ?s ?p ?o. } WHERE { ?s ?p ?o. }'))

      const dataset = rdf.dataset(results)
      await db.destroy()

      expect(dataset.size).toBe(126)
      expect(dataset.toCanonical()).toBe(expected.toCanonical())
    })
  })

  describe('.selectQuery', () => {
    it('returns a Stream of the results as RDFJS objects', async () => {
      const db = new Tdb()
      const dbStream = new TdbStream(db)
      await db.importFiles([data.triples.path])

      const results = await getStream.array(await dbStream.selectQuery('SELECT * WHERE { ?s ?p ?o. }'))

      await db.destroy()

      expect(results.length).toBe(126)
      expect(typeof results[0].s.termType).toBe('string')
      expect(typeof results[0].s.value).toBe('string')
    })
  })
})
