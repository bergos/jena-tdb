const Endpoint = require('../../Endpoint')

async function withEndpoint (options, callback) {
  if (!callback) {
    callback = options
  }

  let error = null
  let endpoint = null

  try {
    endpoint = new Endpoint(options)

    await callback(endpoint)
  } catch (err) {
    error = err
  }

  if (endpoint) {
    await endpoint.destroy()
  }

  if (error) {
    throw error
  }
}

module.exports = withEndpoint
