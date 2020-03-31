# jena-tdb

Wrapper for Jena TDB command line tools with RDF/JS compatible interface.

## Usage

This package provides a `ParsingClient` and a `StreamClient` for read and write access to Jena TDB datasets.
Both classes use an instance of the `Endpoint` class for raw access.
 
### ParsingClient ({ bin, db, factory })

The `ParsingClient` provides an interface that uses arrays to read and write `Quad` objects and rows.
The constructor accepts the following options:

- `bin`: Path to the `bin` folder of Jena as a string.
  Not required if the `bin` folder is listed in `$PATH`.
- `db`: Path of the database directory as a string.
  If it's not given a temporary folder is created which can be deleted with `.destroy()`.
- `factory`: Factory that is used to create the RDF/JS objects.
  By default, `@rdfjs/data-model` is used.

#### destroy()

Deletes the folder of the database if a temporary folder was used. 

#### endpoint

`Endpoint` instance used by the client.

#### query.construct (query)

Runs a construct query and returns the result async as an array of RDF/JS `Quad` objects.

- `query`: The construct query as a string.

#### query.select (query)

Runs a select query and returns the result async as an array of rows.
Each row is an object with the variable as key and the value as an RDF/JS `Term`.

- `query`: The select query as a string.

#### query.update (query)

Runs async an update query.

- `query`: The update query as a string.

#### store.import(quads)

Imports async RDF/JS `Quad` objects from an array or any other object with an iterator interface.
The quads will be written to a temporary file.

- `quads`: The quads to import provided as an object with an iterator interface.

#### store.dump()

Returns async the complete dataset as an array of RDF/JS `Quad` objects.

### StreamClient ({ bin, db, factory })

The `StreamClient` provides an interface that uses [Node.js Streams](https://nodejs.org/api/stream.html) to read and write `Quad` objects and rows.
The constructor accepts the following options:

- `bin`: Path to the `bin` folder of Jena as a string.
  Not required if the `bin` folder is listed in `$PATH`.
- `db`: Path of the database directory as a string.
  If it's not given a temporary folder is created which can be deleted with `.destroy()`.
- `factory`: Factory that is used to create the RDF/JS objects.
  By default, `@rdfjs/data-model` is used.

#### destroy()

Deletes the folder of the database if a temporary folder was used. 

#### endpoint

`Endpoint` instance used by the client.

#### query.construct (query)

Runs a construct query and returns async a `Readable` stream of RDF/JS `Quad` objects.

- `query`: The construct query as a string.

#### query.select (query)

Runs a select query and returns async a `Readable` stream of the result rows.
Each row is an object with the variable as key and the value as an RDF/JS `Term`.

- `query`: The select query as a string.

#### query.update (query)

Runs async an update query.

- `query`: The update query as a string.

#### store.import(quadStream)

Imports async RDF/JS `Quad` objects from an array or any other object with an iterator interface.
The quads will be written to a temporary file.

- `quadStream`: The quads to import provided as a `Readable` stream of RDF/JS `Quad` objects.

#### store.dump()

Returns async the complete dataset as a `Readable` stream of RDF/JS `Quad` objects.

### Endpoint ({ bin, db })

Class for raw access to a TDB instance.

#### async .importFiles(files)

Imports triples and quads from the file system.

- `files`: Array of file paths to import.

## Examples

The `examples` folder contains an example that shows how to import an N-Triples file into a DB and run a SELECT query on the imported triples.
