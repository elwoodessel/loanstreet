const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "LoanStreetTable";
const path = "/loans";

var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

 app.get(path, function (req, res) {
  let amount = req.query.amount;
  let interestRate = req.query.rate;
  let monthlyPayment = req.query.monthly;
  let loanLength = req.query.length;
  let loan = {};
  if (!amount || !interestRate || !monthlyPayment || !loanLength) {
    res.statusCode = 500;
    res.json({error: 'Required parameter missing'});
  }
  
  var params = {
    TableName: tableName,
    Select: 'ALL_ATTRIBUTES',
  };

  dynamodb.scan(params, (err, data) => {
    if (err) {
      res.json({ error: 'Could not load items: ' + err.message });
    }

    data.Items.forEach(item => {
        if (item.amount == amount 
            && item.interestRate == interestRate 
            && item.monthlyPayment == monthlyPayment 
            && item.loanLength == loanLength ) {
                loan = item;
            }
    });
    if (loan)
        res.json({data: loan});
    else
        res.json({error: 'Could not find matching loan'});
  });
});

/************************************
* HTTP put method to update an object *
*************************************/

app.put(path, function(req, res) {

  let putItemParams = {
    TableName: tableName,
    Item: req.body
  }

  dynamodb.put(putItemParams, (err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: err, url: req.url, body: req.body});
    } else{
      res.json({success: 'put call succeed!', url: req.url, data: data})
    }
  });
});

/************************************
* HTTP post method for insert object *
*************************************/

app.post(path, function(req, res) {

  let putItemParams = {
    TableName: tableName,
    Item: req.body
  }

  dynamodb.put(putItemParams, (err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: err, url: req.url, body: req.body});
    } else{
      res.json({success: 'post call succeed!', url: req.url, data: data})
    }
  });
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
