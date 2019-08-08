const { spawn } = require('child_process')
const dataModel = require('@rdfjs/data-model')
const dataset = require('@rdfjs/dataset')
const getStream = require('get-stream')
const path = require('path')
const { SparqlJsonParser } = require('sparqljson-parse')
const { PassThrough } = require('stream')
const TdbStream = require('./TdbStream')
const { tempDir, tempFile } = require('./temp')

const defaultFactory = { ...dataModel, ...dataset }

const fileExtensions = new Map([
  ['application/n-quads', 'nq'],
  ['application/n-triples', 'nt']
])

class Tdb {
  constructor ({ binPath, dbPath, factory = defaultFactory } = {}) {
    this.binPath = binPath && path.resolve(binPath)
    this.dbPath = dbPath && path.resolve(dbPath)
    this.factory = factory
    this.stream = new TdbStream(this)

    this.cleanup = null
  }

  async destroy () {
    if (this.cleanup) {
      await this.cleanup()
    }
  }

  async init () {
    if (!this.dbPath) {
      const { path, cleanup } = await tempDir()

      this.dbPath = path
      this.cleanup = cleanup
    }
  }

  async exec (tool, ...args) {
    await this.init()

    const toolPath = this.binPath ? `${this.binPath}/${tool}` : tool

    // stdout is wrapped, cause the end event is sent before the spawn close is called
    // that prevents emitting errors on the child process streams
    const stream = new PassThrough()

    const proc = spawn(toolPath, ['--loc', this.dbPath, ...args])

    let errorMessage = null

    // pipe stderr stream into errorMessage string
    getStream(proc.stderr).then(stderr => {
      errorMessage = stderr
    })

    proc.on('close', code => {
      if (code) {
        stream.emit('error', new Error(`child process exited with code: ${code} ${errorMessage}`))
      } else {
        stream.end()
      }
    })

    proc.stdout.pipe(stream, { end: false })

    return stream
  }

  async importFiles (files) {
    const stream = await this.exec('tdbloader2', files)

    await getStream(stream)
  }

  async importStream (stream, { mediaType = 'application/n-triples' } = {}) {
    const fileExtension = fileExtensions.get(mediaType)

    if (!fileExtension) {
      throw new Error(`can't import unknown media type: ${mediaType}`)
    }

    const { path, cleanup } = await tempFile({ contentStream: stream, postfix: `.${fileExtension}` })

    await this.importFiles([path])

    await cleanup
  }

  async dump () {
    return this.factory.dataset(await getStream.array(await this.stream.dump()))
  }

  async query (query, resultFormat) {
    const { path, cleanup } = await tempFile({ content: query })

    const result = await getStream(await this.exec('tdbquery', `--results=${resultFormat}`, `--query=${path}`))

    await cleanup()

    return result
  }

  async constructQuery (query) {
    return this.factory.dataset(await getStream.array(await this.stream.constructQuery(query)))
  }

  async selectQuery (query) {
    const parser = new SparqlJsonParser({ dataFactory: this.factory })

    return parser.parseJsonResults(JSON.parse(await this.query(query, 'json')))
  }

  async update (query) {
    const { path, cleanup } = await tempFile({ content: query })

    const result = await getStream(await this.exec('tdbupdate', `--update=${path}`))

    await cleanup()

    return result
  }

  async updateQuery (query) {
    return this.update(query)
  }
}

module.exports = Tdb
