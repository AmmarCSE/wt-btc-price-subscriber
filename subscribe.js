'use latest';

const MongoClient = require('mongodb').MongoClient;

export default function (ctx, done) {
    let { high , low , currency , email } = ctx.data;

    //need to coerce high/low below because they are in string form
    const subscription = {  high: +high , low: +low , currency , email};
    addSubscription(subscription, done, ctx.data.MONGO_URL);
}

function addSubscription(subscription, cb, mongoUrl) {
    MongoClient.connect(mongoUrl, (err, db) => {
        db.collection('subscriptions')
            .insertOne(subscription, (err) => {
                if(err){
                    return cb(err);
                }

                cb(null);
            });
    });
}
