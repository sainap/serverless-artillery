const BbPromise = require('bluebird')
const idioms = require('../idioms')
const path = require('path')
const yaml = require('js-yaml')
const fs = require('fs')
const scriptPath = __dirname + '/load_script.yml'

const baseScript = idioms.parseInput(scriptPath)
const basic = idioms.phaseUpdate(baseScript, {})
const horizontal_test = idioms.phaseUpdate(baseScript, {"duration": 20, "arrivalRate": 5})
const vertical_test = idioms.phaseUpdate(baseScript, {"duration": 2, "arrivalRate": 50})
const horizontal_and_vertical = idioms.phaseUpdate(baseScript, {"duration": 20, "arrivalRate": 50})

module.exports = () =>
  idioms.runIn(__dirname, () =>
    ([
      { data: basic, scenariosCreated: 10 },
      { data: horizontal_test, scenariosCreated: 100 },
      { data: vertical_test, scenariosCreated: 100 },
      { data: horizontal_and_vertical, scenariosCreated: 1000 }
    ])
    .reduce(
      (promise, {data, scenariosCreated}) => {
        return promise
        .then(idioms.functionDoesNotExist())
        .then(() => BbPromise.resolve()
          .then(idioms.deploy())
          .then(idioms.functionExists())
          .then(idioms.invoke({ "data" : JSON.stringify(basic)}))
          .then(idioms.expect({ aggregate: { scenariosCreated: 10 } }))
          .then(idioms.remove(), idioms.remove())
          .then(idioms.functionDoesNotExist()))},
      BbPromise.resolve())
)
