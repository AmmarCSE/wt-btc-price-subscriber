# wt-btc-price-subscriber

`wt-btc-price-subscriber` is a set of webtasks that facilitate subscribing to bitcoin price range notifications. The gist is to submit your high/low limits and your slack username and you will recieve a notification once the price has fallen within range.

In order to use `wt-btc-price-subscribe`, there are two options:

###Hosted webtasks

You can subscribe to the current hosted webtasks by:

1. Asking for an invite(`ammar.cse.ut(at)gmail(dot)com`) to the slack team which recieves notifications
2. Pinging the hosted subscribe webtask at `https://wt-22324bf732e9526885f67d68a1c65561-0.run.webtask.io/subscribe` and including the following parameters in the query string:

  `currency` *- currenlty only USD allowed*

  `low` *- decmal value of lower limit*

  `high` *- decmal value of higher limit*

  `username` *- slack user*

3. You should recieve a notification within 15 minutes of the bitcoin price falling within range*(assuming it has been within range for at least 15 minutes)*.

###Create your own webtasks

1. Clone this repository
2. Setup a [new slack bot](https://my.slack.com/services/new/bot) and retrieve its token
3. Setup a free MongoDB database at [mLab](https://mlab.com/plans/pricing/)
4. In your cloned repository, assuming you have installed the [wt-cli](https://webtask.io/cli), create your webtask with 

`wt create subscribe.js`

`wt create --secret MONGO_URL=<mongodb-url> subscribe.js`

and for the cron job webtask

`wt cron schedule "0,14,29,44 * * * *" jobs/process-target-subscriptions.js --secret BOT_TOKEN=<slack-bot-token> --secret MONGO_URL=<mongo-url>`
