const rdf = require('@rdfjs/data-model')
const Endpoint = require('./Endpoint')
const StreamQuery = require('./StreamQuery')
const StreamStore = require('./StreamStore')

class StreamClient {
  constructor ({ bin, db, factory = rdf }) {
    this.endpoint = new Endpoint({ bin, db })
    this.query = new StreamQuery({ endpoint: this.endpoint, factory })
    this.store = new StreamStore({ endpoint: this.endpoint, factory })
  }

  destroy () {
    this.endpoint.destroy()
  }
}

module.exports = StreamClient
