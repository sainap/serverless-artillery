/**
 * The purpose of this test suite is to provide automated user-level tests of the workflows users are expecting to work with serverless-artillery
 */
const aws = require('aws-sdk')
const BbPromise = require('bluebird')

BbPromise.longStackTraces()

aws.config.setPromisesDependency(require('bluebird'))

if (process.env.AWS_PROFILE) {
  aws.config.credentials = new aws.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE })
}

if (!aws.config.region) {
  aws.config.region = 'us-east-1'
}

const introWorkflow = require('./intro/intro')
const monitoringWorkflow = require('./monitor/monitor')
const loadWorkflow = require('./load/load')

BbPromise.resolve()
  // ## !! PRIORITY 1 !! ##
  // The "intro" to the tool workflow
  // .then(introWorkflow)
  .then(monitoringWorkflow)
  // .then(loadWorkflow)
