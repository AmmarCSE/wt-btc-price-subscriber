'use latest';

const MongoClient = require('mongodb').MongoClient;

export default function (ctx, done) {
    let { high , low , currency , username } = ctx.data;

    //need to coerce high/low below because they are in string form
    const subscription = {  high: +high , low: +low , currency , username};
    addSubscription(subscription, done);

    function addSubscription(subscription, cb) {
        MongoClient.connect(ctx.data.MONGO_URL, (err, db) => {
            db.collection('subscriptions')
                .insertOne(subscription, (err) => {
                    if(err){
                        return cb(err);
                    }

                    cb(null);
                });
        });
    }
}
