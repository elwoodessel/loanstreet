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
  let loan;

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
      res.json({error: 'Error fetching loans from db'});
    }
    data.Items.forEach(item => {
        console.log('item', item);
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
      res.json({error: 'Could not find matching loan or an error has occurred'});
  });
});

/************************************
* HTTP put method to update an object *
*************************************/

app.put(path, function(req, res) {
  let amount = req.body.amount;
  let interestRate = req.body.rate;
  let monthlyPayment = req.body.monthly;
  let loanLength = req.body.length;
  let loanId = req.body.loanId;

  console.log('amount', amount);
  console.log('interestRate', interestRate);
  console.log('monthlyPayment', monthlyPayment);
  console.log('loanLength', loanLength);
  console.log('loanId', loanId);

  if (!amount || !interestRate || !monthlyPayment || !loanLength || !loanId) {
    res.statusCode = 500;
    res.json({error: 'Required parameter missing'});
  }

  let putItemParams = {
    TableName: tableName,
    Item: {
        amount: amount,
        interestRate: interestRate,
        monthlyPayment: monthlyPayment,
        loanLength: loanLength,
        loanId: loanId
    }
  }

  dynamodb.put(putItemParams, (err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: err, url: req.url, body: req.body});
    } else{
      res.json({success: 'Loan successfully update', url: req.url, data: data})
    }
  });
});

/************************************
* HTTP post method for insert object *
*************************************/

app.post(path, function(req, res) {
  let amount = req.body.amount;
  let interestRate = req.body.rate;
  let monthlyPayment = req.body.monthly;
  let loanLength = req.body.length;
  
  if (!amount || !interestRate || !monthlyPayment || !loanLength) {
    res.statusCode = 500;
    res.json({error: 'Required parameter missing'});
  }

  let loanId = 0;
  const params = {
    TableName: tableName,
      Select: "COUNT",
  }; 

  dynamodb.scan(params, (err, data) => {
    if (err) {
      res.json({ error: 'Could not load items: ' + err.message });
    }
      console.log('count', data);
      loanId = +(data.Count) + 1;
      let putItemParams = {
        TableName: tableName,
        Item: {
          amount: amount,
          interestRate: interestRate,
          monthlyPayment: monthlyPayment,
          loanLength: loanLength,
          loanId: loanId
        }
      }
      dynamodb.put(putItemParams, (err, data) => {
        if(err) {
          res.statusCode = 500;
          res.json({error: err, url: req.url, body: req.body});
        } else{
          res.json({success: 'Loan created, please save loanId', url: req.url, data: data})
        }
      });
    });
});

app.listen(3000, function() {
    console.log("App started")
});

module.exports = app
