
const core = require('@actions/core')
const exec = require('@actions/exec')
const artifact = require('@actions/artifact')
const fs = require('fs')
const path = require('path')

const uploadArtifact = async (name, path) => {
  const client = artifact.create()
  const options = { continueOnError: false }
  return await client.uploadArtifact(name, [path], __dirname, options)
}

const saveFile = (name, schema) => {
  const file = path.join(__dirname, `/${name}`)
  fs.writeFileSync(file, schema)
  return file
}

const rover = async (args = []) => {
  let schema = ""
  const stdout = (data) => schema += data.toString()
  const listeners = { stdout }
  const options = { listeners }
  await exec.exec("/root/.rover/bin/rover", args, options)
  return schema
}

const setOutput = (schema) => {
  const encoded = Buffer.from(schema).toString('base64')
  core.setOutput('schema', encoded)
}

const getMultilineInput = (param) => {
  const input = core.getMultilineInput(param)
  if (input.length > 0) return input.join('')
}

const getInput = () => {
  const federated = core.getBooleanInput('federated')
  const subgraph = core.getInput('subgraph')
  const server = core.getInput('server', { required: true })
  const headersJSON = getMultilineInput('headers')
  return { federated, subgraph, server, headersJSON }
}

const parseHeaders = (headersJSON = "{}") => {
  try {
    const headers = JSON.parse(headersJSON)
    const headerFn = ([key, value]) => ['--header', `${key}:${value}`]
    return Object.entries(headers).map(headerFn).flat()
  } catch(error) {
    console.error(error)
    throw new Error('Failed to parse headers input, is it valid JSON?')
  }
}

async function run() {
  try {
    const { federated, subgraph, server, headersJSON } = getInput()
    const headers = parseHeaders(headersJSON)
    const schema = await rover([
      federated ? 'subgraph' : 'graph',
      'introspect',
      server,
      ...headers
    ])
    const filename = federated ? `${subgraph}.graphql` : `graph.graphql`
    const file = saveFile(filename, schema)
    await uploadArtifact(filename, file)
    setOutput(schema)
  } catch (error) {
    console.error(error)
    core.setFailed(error.message)
  }
}

run()