'use latest';

const MongoClient = require('mongodb').MongoClient;

export default function (ctx, cb) { 
    let price = 1000;
    MongoClient.connect(ctx.data.MONGO_URL, (err, db) => {
        //need to refactor how records are found
        //this would choke the process if there are too many records
        const targetSubscriptions = 
            db.collection('subscriptions').find({low:{ $lt: price}, high:{ $gt: price}}).toArray(function(err, collInfos) {
                cb(null, collInfos);
            });

});
/*couldve used rxjs
var parallel    = require('async').parallel;
 parallel(job_list, function (err) {
      if(err) return done(err);

      done(null, 'Success.');
    });*/
    /*const http = require("http"),
        client = http.createClient(80, "blockchain.info"),
        request = client.request("GET", "/tobtc?currency=USD&value=1100", {'Host': 'blockchain.info'});
*/
    /*request.on('response', (response) => {
        let body = '';
        response.on('data', (chunk) => {
            body += chunk;
        });
        response.on('end', () => {
            cb(null, body);
        });
    });
    request.end();*/
}
