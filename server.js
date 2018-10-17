'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var usernames = [];

server.listen(process.env.PORT || 3000);
console.log("Server running...");

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	socket.on('new user', function(username, callback){
		if(usernames.indexOf(username) != -1){
			callback(false);
		}else{
			callback(true);
			socket.username = username;
			usernames.push(socket.username);
			updateUsernames();
		}
	});

	function updateUsernames(){
		io.sockets.emit('usernames', usernames);
	}

	socket.on('send message', function(message){
		io.sockets.emit('new message', {username: socket.username, message});
	});

	socket.on('logout', function(data){
		logout();
	});

	socket.on('disconnect', function(data){
		logout();
	});

	function logout(){
		if(!socket.username){
			return;
		}
		
		usernames.splice(usernames.indexOf(socket.username), 1);
		updateUsernames();
	}
});