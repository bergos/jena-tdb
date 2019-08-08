/* global describe, expect, it, jest */

const data = require('./support/data')
const datasetFromFile = require('./support/datasetFromFile')
const { createReadStream } = require('fs')
const getStream = require('get-stream')
const path = require('path')
const rdf = require('rdf-ext')
const Tdb = require('../lib/Tdb')

jest.setTimeout(10000)

describe('Tdb', () => {
  it('is a constructor', () => {
    expect(typeof Tdb).toBe('function')
  })

  it('uses the given dbPath', async () => {
    const db = new Tdb({
      dbPath: 'tbbt-db'
    })

    expect(db.dbPath).toBe(path.resolve('tbbt-db'))
  })

  describe('.exec', () => {
    it('forwards errors', async () => {
      const db = new Tdb()

      await expect(getStream(await db.exec('tdbdump', '--stream=unknown-format'))).rejects.toThrow()

      await db.destroy()
    })

    it('forwards stderr', async () => {
      const db = new Tdb()
      let message = null

      try {
        await getStream(await db.exec('tdbdump', '--stream=unknown-format'))
      } catch (err) {
        message = err.message
      }

      expect(message.includes('unknown-format')).toBe(true)

      await db.destroy()
    })
  })

  describe('.importFiles', () => {
    it('imports the given files', async () => {
      const expected = await datasetFromFile(data.quads.path)
      const db = new Tdb({ factory: rdf })

      await db.importFiles([data.quads.path])

      const results = await db.dump()
      await db.destroy()

      expect(results.size).toBe(126)
      expect(results.toCanonical()).toBe(expected.toCanonical())
    })
  })

  describe('.importStream', () => {
    it('imports the content from the given stream', async () => {
      const expected = await datasetFromFile(data.triples.path)
      const db = new Tdb({ factory: rdf })

      await db.importStream(createReadStream(data.triples.path))

      const results = await db.dump()
      await db.destroy()

      expect(results.size).toBe(126)
      expect(results.toCanonical()).toBe(expected.toCanonical())
    })
  })

  describe('.dump', () => {
    it('returns a Dataset that contains all quads', async () => {
      const expected = await datasetFromFile(data.quads.path)
      const db = new Tdb({ factory: rdf })
      await db.importFiles([data.quads.path])

      const results = await db.dump()

      await db.destroy()

      expect(results.size).toBe(126)
      expect(results.toCanonical()).toBe(expected.toCanonical())
    })
  })

  describe('.constructQuery', () => {
    it('returns a Dataset that contains all quads from the CONSTRUCT query', async () => {
      const expected = await datasetFromFile(data.triples.path)
      const db = new Tdb({ factory: rdf })
      await db.importFiles([data.triples.path])

      const results = await db.constructQuery('CONSTRUCT { ?s ?p ?o. } WHERE { ?s ?p ?o. }')

      await db.destroy()

      expect(results.size).toBe(126)
      expect(results.toCanonical()).toBe(expected.toCanonical())
    })
  })

  describe('.selectQuery', () => {
    it('returns an array that contains the results as RDFJS objects', async () => {
      const db = new Tdb()
      await db.importFiles([data.triples.path])

      const results = await db.selectQuery('SELECT * WHERE { ?s ?p ?o. }')

      await db.destroy()

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(126)
      expect(typeof results[0].s.termType).toBe('string')
      expect(typeof results[0].s.value).toBe('string')
    })
  })

  describe('.updateQuery', () => {
    it('runs the update query', async () => {
      const quad = rdf.quad(
        rdf.namedNode('http://example.org/subject'),
        rdf.namedNode('http://example.org/predicate'),
        rdf.literal('object'))
      const db = new Tdb()

      await db.updateQuery(`INSERT DATA { ${quad.toString()} }`)

      const result = await db.dump()
      await db.destroy()

      expect([...result][0].equals(quad)).toBe(true)
    })
  })
})
