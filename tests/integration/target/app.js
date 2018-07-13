const AWS = require('aws-sdk')
const express = require('express')
const uuid = require('uuid').v4

const app = express()

const stats = () => {
  let requests = {}

  return {
    reset: () => { requests = {} },
    requests: () => requests,
    totals: () => {
      const totals = {}
      Object.keys(requests)
        .forEach((time) => {
          requests[time].forEach((sample) => {
            totals[sample] = totals[sample] ?
              totals[sample] + 1 : 1
          })
        })
      return totals
    },
    count: (req) => {
      const sample = req.path
      const time = Math.floor(Date.now() / 1000) // One second buckets
      requests[time] = requests[time] ?
        requests[time].concat(sample) : [sample]
    },
  }
}

const statsCW = (bucketName) => {
  let runId = uuid()

  return {
    reset: () => { runId = uuid() },
    requests: async () => {
      const requests = {}
      const params = {
        Bucket: bucketName,
        MaxKeys: 1000,
        Prefix: runId,
      }
      const data = await s3.listObjectsV2(params).promise()
      const keysToQuery = data.Contents.map(obj => obj.Key)

      keysToQuery.forEach(async (key) => {
        const objParams = {
          Bucket: bucketName,
          Key: key,
        }
        const requestsObj = await s3.getObject(objParams).promise()
        const requestsPaths = JSON.parse(requestsObj.Body)

        requests[key] = requestsPaths
      })

      return requests
    },
    totals: async () => {
      const totals = {}
      const requests = await this.requests()
      Object.keys(requests)
        .forEach((time) => {
          requests[time].forEach((sample) => {
            totals[sample] = totals[sample] ?
              totals[sample] + 1 : 1
          })
        })
      return totals
    },
    count: req => console.log(`REQUEST|${req.path}`),
  }
}

const theStats = stats()

app.get('/reset', (req, res) => {
  console.log('resetting stats')
  theStats.reset()
  res.send(`RESET @ ${Date.now()}`)
})

app.get('/requests', async (req, res) => {
  console.log('reporting requests')
  const requests = await theStats.requests()
  res
    .type('application/json')
    .send(JSON.stringify(requests))
})

app.get('/totals', async (req, res) => {
  console.log('reporting totals')
  const totals = await theStats.totals()
  res
    .type('application/json')
    .send(JSON.stringify(totals))
})

app.all('/*', (req, res) => {
  console.log(`REQUEST|${req.path}`)
  theStats.count(req)
  res.send(`OK - ${req.path}`)
})

module.exports = app

