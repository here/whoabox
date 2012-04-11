
// node.js socket.io express zombie fuck yeah playground
//
// adapted from http://psitsmike.com/2011/09/node-js-and-socket-io-chat-tutorial/
// thanks bro, come visit seattle again soon!

var app = require('express').createServer()
var io = require('socket.io').listen(app);
var Browser = require('zombie');
var assert = require('assert');

app.listen(8080);

// routing
	app.get('/', function (req, res) {
		res.sendfile(__dirname + '/index.html');
	});

// sockets.io docs
	io.sockets.on('connection', function (socket) {
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function (data) {
			console.log(data);
		});
	});

// zombie browser testing
	browser = new Browser();
	browser.visit("http://herebox.org/", function () {
		assert.ok(browser.success);
		console.dir("browser.errors: "+ browser.errors);
		console.dir("browser.statusCode: "+ browser.statusCode);
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
