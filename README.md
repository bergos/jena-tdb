# jena-tdb

Wrapper for Jena TDB command line tools with RDFJS compatible interface.

## Usage

### Tdb

#### .destroy()

#### .importFiles(files)

#### .importStream(stream, { mediaType })

#### .dump()

#### .constructQuery(query)

#### .selectQuery(query)

#### .updateQuery(query)

### Tdb.stream

#### .import(quadStream)

#### .dump()

#### .constructQuery(query)

#### .selectQuery(query)

## Examples

The `examples` folder contains an example that shows how to import a N-Triples file into a DB and run a SELECT query on the imported triples.