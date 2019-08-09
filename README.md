# jena-tdb

Wrapper for Jena TDB command line tools with RDFJS compatible interface.

## Usage

The package exports the `Tdb` class.
Instance of the class must be created using the constructor.

### Tdb({ binPath, dbPath, factory })

Creates a new instance of `Tdb`.

- `binPath`: Path to the `bin` folder of Jena as string.
  Not required if the `bin` folder is listed in `$PATH`.
- `dbPath`: Path of the database directory as string.
  If it's not given a temporary folder is create which can be deleted with `.destroy()`.
- `factory`: Factory for RDFJS objects.
  By default `@rdfjs/data-model` and `@rdfjs/dataset` are used.

#### async .destroy()

Deletes the folder of the database if a temporary folder was used. 

#### async .importFiles(files)

Imports triples and quads from the file system.

- `files`: Array of paths to the files to import.

#### async .importStream(stream, { mediaType })

Imports triples and quads from a stream.
The content of the stream will be written to a temporary file.

- `stream`: A Readable stream of N-Triples or N-Quads.
- `mediaType`: Media Type of the given stream.
  By default `application/n-triples` is used.
  `application/n-quads` must be used for N-Quads.

#### async .dump()

Returns a RDFJS Dataset of all quads in the database.

#### async .constructQuery(query)

Runs a construct query and returns the result as RDFJS Dataset.

- `query`: The construct query as string.

#### async .selectQuery(query)

Runs a select query and returns the result as an array.
Each element of the array is an object with the variable as key and the value as a RDFJS Term.

- `query`: The select query as string.

#### async .updateQuery(query)

Runs an update query.

- `query`: The update query as string.

### Tdb.stream

Methods that return a Dataset or an Array are also available in a streaming version.
Also importing is possible from a RDFJS quad stream.
The streaming versions of the methods can be called on the `.stream` property like this:

```
const db = new Tdb({ dbPath: '...' })

const quadStream = await db.stream.dump()
```

#### async .import(quadStream)

Imports the quads given as a RDFJS quad stream.

- `quadStream`: The RDFJS quad stream.

#### async .dump()

Returns a RDFJS quad stream that emits all quads in the database.

#### async .constructQuery(query)

Runs a construct query and returns the result as RDFJS quad stream.

- `query`: The construct query as string.

#### async .selectQuery(query)

Runs a select query and returns the result as an object stream.
Each emitted object contains all variables as the key and the value as a RDFJS Term.

- `query`: The select query as string.

## Examples

The `examples` folder contains an example that shows how to import a N-Triples file into a DB and run a SELECT query on the imported triples.
