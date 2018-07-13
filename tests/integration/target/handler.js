const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')
var zlib = require('zlib')

const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => {
  console.log('>>>', event)
  awsServerlessExpress.proxy(server, event, context)
}

exports.reducer = (event, context) => {
  const payload = Buffer.from(event.awslogs.data, 'base64')
  zlib.gunzip(payload, function(e, result) {
    if (e) {
      context.fail(e);
    } else {
      result = JSON.parse(result.toString('ascii'));
      console.log("Event Data:", JSON.stringify(result, null, 2));
      context.succeed();
    }
  });
}
