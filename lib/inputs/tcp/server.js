//
// TCP Server
//
// TCP server for tcp clients like syslog.
// Version: 0.2
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2013-2014 Mark W. B. Ashcroft.
// Copyright (c) 2013-2014 Kurunt.
//


var config			= require("./config.json");						// your local config settings.

var net 				= require('net');											// Load the TCP Library.

var logging = require('../.././logging');


var servers			= {};																// server opens each 'stream' (apikey).
exports.servers = servers;													// so index.js can close a server by 'stream' (apikey).

var clients 		= {};																// tcp clients currently connected.
exports.clients = clients;													// so index.js can disconnect if close a stream.


var toobusy = undefined;
try {
	toobusy = require('toobusy');
	var TOOBUSY_PAUSE = 200;		// set in miliseconds to pause incomming stream.
} catch(e) {
	logging.log('tcp@inputs> To use toobusy, you need to install >npm install toobusy -g');
}


// Start a TCP Server.
module.exports.start = function (apikey, route, messenger, streams) {
	function onReceive(socket) {

		// Identify this client.
		var client = socket.remoteAddress + ":" + socket.remotePort;

		// Put this new client in the list
		clients[client] = [];
		clients[client]['address'] = socket.remoteAddress;
		clients[client]['port'] = socket.remotePort;
		clients[client]['socket'] = socket;	
		clients[client]['apikey'] = apikey;

		//log(client + " connected >>");


		socket.on('data', function(data) {
			logging.log('tcp@inputs> Got data from for apikey: ' + apikey + ' data: ' + data.toString());

			//socket.write("123988277100000009\n"); 

			if ( toobusy != undefined ) {		
				if (toobusy()) {
					//console.log('tcp@inputs> Im toobusy.');
					socket.pause();
					setTimeout(function() {
						socket.resume();
						//console.log('tcp@inputs> Im not too busy, resume.');
					}, TOOBUSY_PAUSE);
				}
			}

			route(apikey, config['name'], clients[client]['address'], data, messenger, streams, function (res) {
				if ( res === false ) {
					logging.log("tcp@inputs> No client host access found for " + clients[client]['address'] + " on apikey: " + apikey + " will try disconnecting client.");
					try {
						clients[client]['socket'].end();  			// disconect client.
						clients[client]['socket'].destroy();		// distroy ensures client disconnected.
						//clients.splice(clients[client], 1);
						delete clients[client];
					} catch(e) {
					}
				}
			});

		});

		// Remove the client from the array when it leaves.
		socket.on('end', function () {
			try {
				delete clients[client];
			} catch(e) {
			}			
			logging.log("tcp@inputs> << " + client + " disconnected.");
		});

	} // end onReceive.

	servers[apikey] = net.createServer(onReceive).listen(apikey);
	logging.log("tcp@inputs> TCP (input) Server has opened on port " + apikey + ".");
}


module.exports.stop = function () {
	server.close();
	server.on('close', function () {
		logging.log("tcp@inputs> TCP (input) '" + config['name'] + "' Server has stoped.");
	});
}


