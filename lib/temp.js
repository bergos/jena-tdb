const { createWriteStream, writeFile } = require('fs')
const { promisify } = require('util')
const { finished } = require('readable-stream')
const { dir, file } = require('tmp-promise')

async function writeStreamToFile (input, path) {
  const output = createWriteStream(path)

  input.pipe(output)

  await promisify(finished)(output)
}

async function tempDir () {
  return dir({ prefix: 'tdb-', unsafeCleanup: true })
}

async function tempFile ({ content, contentStream, postfix } = {}) {
  const result = await file({ prefix: 'tdb-', postfix })

  if (content) {
    promisify(writeFile)(result.path, content)
  }

  if (contentStream) {
    await writeStreamToFile(contentStream, result.path)
  }

  return result
}

module.exports = {
  tempDir,
  tempFile
}
