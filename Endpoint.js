const { spawn } = require('child_process')
const path = require('path')
const getStream = require('get-stream')
const { PassThrough } = require('readable-stream')
const { tempDir } = require('./lib/temp')

class Endpoint {
  constructor ({ bin, db } = {}) {
    this.bin = bin && path.resolve(bin)
    this.db = db && path.resolve(db)

    this.cleanup = null
  }

  async destroy () {
    if (this.cleanup) {
      await this.cleanup()
    }
  }

  async init () {
    if (!this.db) {
      const { path, cleanup } = await tempDir()

      this.db = path
      this.cleanup = cleanup
    }
  }

  async exec (tool, ...args) {
    await this.init()

    const toolPath = this.bin ? `${this.bin}/${tool}` : tool

    // stdout is wrapped, cause the end event is sent before the spawn close is called
    // that prevents emitting errors on the child process streams
    const stream = new PassThrough()

    const proc = spawn(toolPath, ['--loc', this.db, ...args])

    let errorMessage = null

    // pipe stderr stream into errorMessage string
    getStream(proc.stderr).then(stderr => {
      errorMessage = stderr
    })

    proc.on('close', code => {
      if (code) {
        stream.destroy(new Error(`child process exited with code: ${code} ${errorMessage}`))
      } else {
        stream.end()
      }
    })

    proc.on('error', err => {
      stream.destroy(err)
    })

    proc.stdout.pipe(stream, { end: false })

    return stream
  }

  async importFiles (files) {
    const stream = await this.exec('tdbloader2', files)

    await getStream(stream)
  }
}

module.exports = Endpoint
