'use latest';

const http = require("http"),
    request = require('request'),
    MongoClient = require('mongodb').MongoClient;

export default function (ctx, cb) { 
    getBTCPrice()
        .then(getTargetSubscriptions)
        .then(fireJobList);

    function getBTCPrice(){
        return new Promise((resolve, reject) => {
            const client = http.createClient(80, "api.coindesk.com"),
                clientRequest = client.request("GET", "/v1/bpi/currentprice.json", {'Host': 'api.coindesk.com'});

            clientRequest.on('response', response => {
                let responseText = '';
                response.on('data', chunk => {
                    responseText += chunk;
                });
                response.on('end', () => {
                    //would be better to make this flexible in the future and allow user to select currency rather than having a static 'USD'
                    let formattedPrice = JSON.parse(responseText).bpi.USD.rate;
                    //price comes back with comma which is unparsable with Number.parseFloat
                    let price = Number.parseFloat(formattedPrice.replace(/,/, ''));

                    resolve(price);
                });
            });

            clientRequest.end();
        });
    }

    function getTargetSubscriptions(price){
        return new Promise((resolve, reject) => {
            MongoClient.connect(ctx.data.MONGO_URL, (err, db) => {
                //need to refactor how records are found
                //this would choke the process if there are too many records
                db.collection('subscriptions').find({low:{ $lt: price}, high:{ $gt: price}}).toArray(function(err, targetSubscriptions) {
                    if (err) {
                        return reject(err);
                    }

                    //to avoid having to set a global(to the exported function) variable, just attach the price to each subscription
                    targetSubscriptions.forEach(targetSubscription => {
                        targetSubscription.currentPrice = price;
                    });
                    //hmm, should definately refactor this to delete the subscriptions within range to avoid sending multiple notifications to same subscription

                    return resolve(targetSubscriptions);
                });
            });
        });
    }

    function fireJobList(targetSubscriptions){
        let jobList = targetSubscriptions.map(targetSubscription => notifyUserOnSlack(targetSubscription));
        //used to Observable.forkJoin from rxjs, but this will do just as well
        Promise.all(jobList)
            .then(wereGood => cb(null, true))
            .catch(err => cb(err));
    }

    function notifyUserOnSlack(subscription){
        let slackToken = ctx.data.BOT_TOKEN;

        return new Promise((resolve, reject) => {
            findUser(subscription.username)
                .then(openIM)
                .then(postMsg)
                .then(success => resolve(null, success))
                .catch(err => reject(err));
        });

        /* Call the given endpoing in Slack API */
        function callAPI(endpoint, form){
            return new Promise((resolve, reject) => {
                request.post(`https://slack.com/api/${endpoint}`, {form}, (err, res, body) => {
                    if (err) {
                        return reject(err);
                    }

                    body = JSON.parse(body);

                    if (!body.ok) {
                        return reject(body.error);
                    }

                    return resolve(body);
                });
            });
        };

        /* Find Slack ID of the user with given username */
        function findUser(username){
            return new Promise((resolve, reject) => {
                callAPI('users.list', {token:slackToken})
                    .then(body => {
                        const user = body.members.find(member => member.name == username);

                        if (!user) {
                            return reject(`User ${username} not found`);
                        }
                        return resolve(user.id);
                    })
                    .catch(err => reject(err));
                });
        }

        /* Open a direct msg channel with given Slack user id */
        function openIM(user){
            return new Promise((resolve, reject) => {
                callAPI('im.open', {token: slackToken, user})
                    .then(body => resolve(body.channel.id))
                    .catch(err => reject(err));
                });
        }

        /* Post message to specified Slack channel */
        function postMsg(channel){
            return new Promise((resolve, reject) => {
                let text = `Current BTC price(${subscription.currentPrice}) is within your requested range of ${subscription.low} - ${subscription.high}`;
                callAPI('chat.postMessage', { token: slackToken, channel, text})
                    .then(body => resolve(true))
                    .catch(err => reject(err));
            });
        }
    }
}
