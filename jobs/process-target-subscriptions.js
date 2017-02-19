'use latest';

const parallel = require('async').parallel,
    http = require("http"),
    MongoClient = require('mongodb').MongoClient;

export default function (ctx, cb) { 
    const client = http.createClient(80, "api.coindesk.com"),
        request = client.request("GET", "/v1/bpi/currentprice.json", {'Host': 'api.coindesk.com'});

    request.on('response', (response) => {
        let responseText = '';
        response.on('data', (chunk) => {
            responseText += chunk;
        });
        response.on('end', () => {
            let formattedPrice = JSON.parse(responseText).bpi.USD.rate;
            let price = Number.parseFloat(formattedPrice.replace(/,/, ''));
            MongoClient.connect(ctx.data.MONGO_URL, (err, db) => {
                //need to refactor how records are found
                //this would choke the process if there are too many records
                db.collection('subscriptions').find({low:{ $lt: price}, high:{ $gt: price}}).toArray(function(err, targetSubscriptions) {
                    let jobList = targetSubscriptions.map(targetSubscription => emailPriceNotification(targetSubscription, price));
                    //couldve used rxjs
                    parallel(jobList, function (err, results) {
                    });
                });
            });
    });
    request.end();
}

function emailPriceNotification(subscription, price){
    var request = require('request');
    // Webtask.io Github service wraps standard webtask and only provides context and callback.
    // context.data has secret params
    // context.req has the initial node.js request (the Github webhook)
    // context.body has the body object from the request    
        var repo = {};  
        var message = {
            text: `The current bitcoin price(${price} USD) is within the subscribed range ${subscription.low} - ${subscripiton.high}.`,
            subject: 'Price within subscribed range',
            from_email: 'ammar.cse.ut@gmail.com',
            to: [{ email: 'ammar.cse.jo@gmail.com', type: "to" }]
        };
        request({
            url: "https://mandrillapp.com/api/1.0/send.json",
            method: 'POST',
            json: true,
            body: {
                //key: context.data.mandrill_token,
                key: 'wTRvc2fXlPhJ0NcOYYP2JQ',
                message: message
            }
        },
        function (error, res, body) {
          cb(null, error);
        }
      );
}
