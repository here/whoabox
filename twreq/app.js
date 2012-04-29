//
// t(rain)wreq
// node.js socket.io express twreq
//
// simple public twitter API requests using node.js
//
// node app.js
// http://host:8080/t/search/terms/here

var app = require('express').createServer()
var request = require('request');
//var qs = require('querystring');

var count = 0;

app.listen(8080);

    // routing
	app.get('/', function (req, res) {
		res.sendfile(__dirname + '/index.html');
        
	});

    app.get('/t/*',function (req, res) {
        console.log(req.url);

        // get basic search results in json from twitter
        // need to capture #s
        var end = 'http://search.twitter.com/search.json?q='+escape(req.url.slice(3).replace('/','+'));
        var opts = { uri: end, json: 'json' };
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                  //console.log(body);
                 if(body.results[0]) res.send(body.results[0].from_user+' : '+body.results[0].text);
                 else {res.send('you are so unique');
                  console.log(body.results[0]);
                 }
            }
            else { //console.log(error); console.log(response); 
            }
        });
    });

    // https://github.com/mikeal/request
    var request = require('request');
    //request('http://www.google.com', function (error, response, body) {
    request('https://api.twitter.com/statuses/user_timeline.json/?screen_name=herebox&count=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            r = JSON.stringify(response);
            console.log('success request');
            console.log('request: '+body);
        }
    });

