module.exports = function (cb) { 
    var http = require("http"),
        client = http.createClient(80, "blockchain.info"),
        querystring = require('querystring'),
        query = "USD",
        request = client.request("GET", "/tobtc?currency=USD&value=1100", {'Host': 'blockchain.info'});

    request.on('response', function (response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            cb(null, body);
        });
    });
    request.end();
}
