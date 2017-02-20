'use latest';

module.exports = (context, cb) => {
    notifyUserOnSlack(context, cb);
};

function notifyUserOnSlack(context, cb){
    const request = require('request');
    const _ = require('lodash@4.8.2');

    // Slack bot token
    let token = context.data.BOT_TOKEN;

    //const name = extractName(context.data.comment).toLowerCase();
    const name = 'ammar';

    findUser(name, (err, id) => {
        if (err) {
          // If no such user, assume it's a channel
          return postMsg(name, context.data, cb);
        }

        return openIM(id, (err, channelId) => {
          if (err) { console.log(err); return cb(); }
          else postMsg(channelId, context.data, cb);
        });
    });
    /* Call the given endpoing in Slack API */
    function callAPI(endpoint, form, cb){
      request.post(`https://slack.com/api/${endpoint}`, {form}, (err, res, body) => {
        if (err) return cb(err);

        body = JSON.parse(body);
        if (!body.ok) return cb(body.error);

        return cb(null, body);
      });
    };

    /* Find Slack ID of the user with given username */
    function findUser(username, cb){
      callAPI('users.list', {token}, (err, body) => {
        if (err) return cb(err);

        const user = _.find(body.members, {name: username});

        if (!user) return cb(`User ${username} not found`);
        cb(null, user.id);
      });
    }

    /* Open a direct msg channel with given Slack user id */
    function openIM(user, cb){
      callAPI('im.open', {token, user}, (err, body) => {
        if (err) return cb(err);
        cb(null, body.channel.id);
      });
    }

    /* Post message to specified Slack channel */
    function postMsg(channel, data, cb){
        const obj = {
            title:  'wechat',
            title_link: 'wechat'  
        };
        callAPI('chat.postMessage', {
            token,
            channel,
            as_user: false,
            username: 'Zendesk Mentions Bot',
            icon_url: 'http://i.imgur.com/IhN4IzR.png?1',
            text: 'You were mentioned in this ticket:',
            attachments: JSON.stringify([obj])
        }, (err, body) => {
            if (err) { console.log(err); return cb(err); }
            cb(null);
        });
    }
}

/*const parallel = require('async').parallel,
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
}*/

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
