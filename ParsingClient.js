const rdf = require('@rdfjs/data-model')
const Endpoint = require('./Endpoint')
const ParsingQuery = require('./ParsingQuery')
const ParsingStore = require('./ParsingStore')

class ParsingClient {
  constructor ({ bin, db, factory = rdf }) {
    this.endpoint = new Endpoint({ bin, db })
    this.query = new ParsingQuery({ endpoint: this.endpoint, factory })
    this.store = new ParsingStore({ endpoint: this.endpoint, factory })
  }

  destroy () {
    this.endpoint.destroy()
  }
}

module.exports = ParsingClient
