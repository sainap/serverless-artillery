const BbPromise = require('bluebird')
const idioms = require('../idioms')
const path = require('path')

const lowLoad = {"config": {"target": "https://aws.amazon.com","phases": [{"duration": 5,"arrivalRate": 2}]},"scenarios": [{"flow": [{"get": {"url": "/"}}]}]}
// const highLoad = {"config": {"target": "https://aws.amazon.com","phases": [{"duration": 5,"arrivalRate": 30}]},"scenarios": [{"flow": [{"get": {"url": "/"}}]}]}

module.exports = () => idioms.runIn(__dirname, () => BbPromise.resolve()
  .then(idioms.functionDoesNotExist())
  .then(() => BbPromise.resolve()
    .then(idioms.deploy())
    .then(idioms.functionExists())
    .then(idioms.invoke())
    .then(idioms.expect({ aggregate: { scenariosCreated: 10 } }))
    .finally(idioms.remove())
    .then(idioms.functionDoesNotExist()))
  )
