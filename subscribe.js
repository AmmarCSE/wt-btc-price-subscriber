'use latest';

const MongoClient = require('mongodb').MongoClient;

export default function (ctx, done) {
    let { high , low , currency , email } = ctx.data;
    const subscription = {  high , low , currency , email};
    MongoClient.connect(ctx.data.MONGO_URL, (err, db) => {
    save_subscription(subscription, db, (err) => {
            if(err) return cb(err);

            done(null, 'Success.');
        });

    });
}

function save_subscription(subscription, db, cb) {
    db.collection('subscriptions')
        .insertOne(subscription, (err) => {
            if(err){
                return cb(err);
            }

            cb(null);
        });
}
