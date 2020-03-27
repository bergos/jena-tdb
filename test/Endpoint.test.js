const { strictEqual } = require('assert')
const path = require('path')
const getStream = require('get-stream')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const data = require('./support/data')
const datasetFromFile = require('./support/datasetFromFile')
const withEndpoint = require('./support/withEndpoint')
const Endpoint = require('../Endpoint')
const StreamStore = require('../StreamStore')

describe('Endpoint', () => {
  it('is a constructor', () => {
    strictEqual(typeof Endpoint, 'function')
  })

  it('uses the given db', async () => {
    await withEndpoint({ db: 'tbbt-db' }, endpoint => {
      strictEqual(endpoint.db, path.resolve('tbbt-db'))
    })
  })

  describe('.exec', () => {
    it('throws an error if the process could not be started', async () => {
      await withEndpoint(async endpoint => {
        let error = null

        try {
          await getStream(await endpoint.exec('doesnotexist1234'))
        } catch (err) {
          error = err
        }

        strictEqual(typeof error, 'object')
      })
    })

    it('forwards errors', async () => {
      await withEndpoint(async endpoint => {
        let error = null

        try {
          await getStream(await endpoint.exec('tdbdump', '--stream=unknown-format'))
        } catch (err) {
          error = err
        }

        strictEqual(typeof error, 'object')
      })
    })

    it('forwards stderr', async () => {
      await withEndpoint(async endpoint => {
        let error = null

        try {
          await getStream(await endpoint.exec('tdbdump', '--stream=unknown-format'))
        } catch (err) {
          error = err
        }

        strictEqual(error.message.includes('unknown-format'), true)
      })
    })
  })

  describe('.importFiles', () => {
    it('imports the given files', async () => {
      await withEndpoint({ factory: rdf }, async endpoint => {
        const expected = await datasetFromFile(data.quads.path)

        await endpoint.importFiles([data.quads.path])

        const store = new StreamStore({ endpoint })
        const results = await getStream.array(await store.dump())
        const dataset = rdf.dataset(results)

        strictEqual(dataset.size, 126)
        strictEqual(dataset.toCanonical(), expected.toCanonical())
      })
    })
  })
})
