const getStream = require('get-stream')
const { Readable } = require('readable-stream')
const StreamStore = require('./StreamStore')

class ParsingStore extends StreamStore {
  constructor ({ endpoint, factory }) {
    super({ endpoint, factory })
  }

  async import (quads) {
    const quadStream = new Readable({
      objectMode: true,
      read: () => {}
    })

    for (const quad of quads) {
      quadStream.push(quad)
    }

    quadStream.push(null)

    await super.import(quadStream)
  }

  async dump () {
    return getStream.array(await super.dump())
  }
}

module.exports = ParsingStore
