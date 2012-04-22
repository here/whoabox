
// node.js socket.io express zombie fuck yeah playground
//
// adapted from http://psitsmike.com/2011/09/node-js-and-socket-io-chat-tutorial/
// thanks bro, come visit seattle again soon!

var app = require('express').createServer()
var io = require('socket.io').listen(app);
var request = require('request');
var Browser = require('zombie');
var assert = require('assert');
var qs = require('querystring');

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
                  //console.log(body.results);
                  res.send(body.results[1].from_user+' : '+body.results[1].text);
            }
            else { //console.log(error); console.log(response); 
            }
        });
    });

    var OAuth = require('oauth').OAuth;

    // oauth and callback example from http://moonlitscript.com/post.cfm/how-to-use-oauth-and-twitter-in-your-node-js-expressjs-app/
    app.get('/auth/twitter', function(req, res){
        // Twitter OAuth from https://github.com/mikeal/request
        //res.send('yeahhi');
        oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
            if (error) {
                console.log(error);
                res.send("yeah no. didn't work.")
            }
            else {
                console.log(req);
                req.session = {};
                req.session.oauth = {};
                req.session.oauth.token = oauth_token;
                console.log('oauth.token: ' + req.session.oauth.token);
                req.session.oauth.token_secret = oauth_token_secret;
                console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
                res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
                console.log('end of success');
            }
        });
    }); 

    app.get('/auth/twitter/callback', function(req, res, next){
        if (req.session.oauth) {
            req.session.oauth.verifier = req.query.oauth_verifier;
            var oauth = req.session.oauth;

            oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
            function(error, oauth_access_token, oauth_access_token_secret, results){
                if (error){
                    console.log(error);
                    res.send("yeah something broke.");
                } else {
                    req.session.oauth.access_token = oauth_access_token;
                    req.session.oauth,access_token_secret = oauth_access_token_secret;
                    console.log(results);
                    res.send("worked. nice one.");
                }
            }
            );
        } else
            next(new Error("you're not supposed to be here."))
    });

    // request testing
    // https://github.com/mikeal/request
    var request = require('request');
    //request('http://www.google.com', function (error, response, body) {
    request('https://api.twitter.com/statuses/user_timeline.json/?screen_name=herebox&count=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            r = JSON.stringify(response);
            console.log('success request');
            console.log('request: '+body) // Print the google web page.
        }
    });


    // zombie browser testing
    // https://github.com/assaf/zombie
	browser = new Browser();
    
    browser.on("error", function(err) {
        console.log("Error:", err);
    });
    browser.on("loaded", function() {    
        console.log ("Loaded:", browser.statusCode);
        console.log ("Location: ", browser.location._url.href);
    });

    // sockets.io docs
	io.sockets.on('connection', function (socket) {
		// onload
		socket.emit('news', { hello: 'world' });

		// listeners
		socket.on('my other event', function (data) {
			console.log(data);
		});
		socket.on('nom', function(){
            socket.emit('news', {hello: 'internet' });
            browser.visit("http://reddit.com/top/", function () {
                var t1 = browser.html('div.entry.unvoted:eq('+count+') a.title')
                var t2 = browser.html('div.entry.unvoted:eq('+count+') a.comments')
                count++; if (count > 9) count = 0;

                console.log("browser.statusCode: "+ browser.statusCode);
                console.log(t1);
                socket.emit('in', {
                    title: t1,
                    comments: t2,
                    count: count
                }); 
            });
        });
	});
	
    // chat tutorial from http://psitsmike.com/2011/09/node-js-and-socket-io-chat-tutorial/
	var usernames = {};

	io.sockets.on('connection', function (socket) {

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		 io.sockets.emit('updatechat', socket.username, data);
		io.sockets.emit('updatebrowser', socket.username, data);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = username;
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});
