const getStream = require('get-stream')
const StreamQuery = require('./StreamQuery')

class ParsingQuery extends StreamQuery {
  constructor ({ endpoint, factory }) {
    super({ endpoint, factory })
  }

  async construct (query) {
    return getStream.array(await super.construct(query))
  }

  async select (query) {
    return getStream.array(await super.select(query))
  }
}

module.exports = ParsingQuery
