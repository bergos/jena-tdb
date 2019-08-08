const { createReadStream } = require('fs')
const N3Parser = require('@rdfjs/parser-n3')
const rdf = require('rdf-ext')

function datasetFromFile (filename) {
  const input = createReadStream(filename)
  const parser = new N3Parser()
  const quadStream = parser.import(input)

  return rdf.dataset().import(quadStream)
}

module.exports = datasetFromFile
