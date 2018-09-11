const BbPromise = require('bluebird')
const idioms = require('../idioms')
const path = require('path')
const yaml = require('js-yaml')
const fs = require('fs')
const scriptPath = __dirname + '/load_script.yml'

const baseScript = idioms.parseInput(scriptPath)
const basic = idioms.phaseUpdate(baseScript, {})
const horizontal_test = idioms.phaseUpdate(baseScript, {"duration": 15, "arrivalRate": 1})
const vertical_test = idioms.phaseUpdate(baseScript, {"duration": 1, "arrivalRate": 3})
const horizontal_and_vertical = idioms.phaseUpdate(baseScript, {"duration": 15, "arrivalRate": 3})

module.exports = () =>
  idioms.runIn(__dirname, () =>
    ([
      { data: basic, scenarioCount: 1 },
      { data: horizontal_test, scenarioCount: 15 },
      { data: vertical_test, scenarioCount: 3 },
      { data: horizontal_and_vertical, scenarioCount: 45 }
    ])
    .reduce(
      (promise, {data, scenarioCount}) => promise
        .then(idioms.functionDoesNotExist())
        .then(() => BbPromise.resolve()
          .then(idioms.deploy())
          .then(idioms.functionExists())
          .then(idioms.invoke({ "data" : JSON.stringify(data)}))
          .then(idioms.expect({ aggregate: { scenariosCreated: scenarioCount } }))
          .then(idioms.remove(), idioms.remove())
          .then(idioms.functionDoesNotExist())),
      BbPromise.resolve())
)
