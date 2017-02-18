'use latest';

export default function (cb) { 
    const http = require("http"),
        client = http.createClient(80, "blockchain.info"),
        request = client.request("GET", "/tobtc?currency=USD&value=1100", {'Host': 'blockchain.info'});

    request.on('response', (response) => {
        let body = '';
        response.on('data', (chunk) => {
            body += chunk;
        });
        response.on('end', () => {
            cb(null, body);
        });
    });
    request.end();
}
