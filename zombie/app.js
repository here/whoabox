
// node.js socket.io express zombie fuck yeah playground
//
// adapted from http://psitsmike.com/2011/09/node-js-and-socket-io-chat-tutorial/
// thanks bro, come visit seattle again soon!

var app = require('express').createServer()
var io = require('socket.io').listen(app);
var Browser = require('zombie');
var assert = require('assert');

var count = 0;

app.listen(8080);

// routing
	app.get('/', function (req, res) {
		res.sendfile(__dirname + '/index.html');
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
