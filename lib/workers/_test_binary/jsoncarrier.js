//
// Kurunt JSONCarrier
//
// Parser which listens for chunks from socket, delineates into individual messages, parses into js 
// object (from json) then emits as message event.
// Version: 0.2
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: Apache 2.0.
//
// Copyright (c) 2013 Mark W. B. Ashcroft.
// Copyright (c) 2013 Kurunt.
//


var util = require('util');
var events = require('events');
var msgpack 				= require('msgpack-js');


exports.parse = function(config) {
	return new parse(config);
}


util.inherits(parse, events.EventEmitter);

/*
// If zmq (ZeroMQ) available use, else use Axon.
try {
	var mq			= require('zmq');
	console.log('using ZMQ');
} catch(e) {
	var mq 			= require('axon');
	console.log('using AXON');
}
*/
var mq 			= require('axon');
var schema_sock 			= mq.socket('pull');

//var msgpack 			= require('/usr/local/lib/node_modules/axon-msgpack/node_modules/msgpack-js');
//var msgpack 			= require('/usr/local/lib/node_modules/msgpack');




function padd_number(n) {
	// n as integer, returns 9 char number (string).
	var n_str = n.toString();
	switch (n_str.length) {
		case 1:
	  		padded_num = '00000000' + n_str;
	  		break;
		case 2:
	  		padded_num = '0000000' + n_str;
	  		break;
		case 3:
	  		padded_num = '000000' + n_str;
	  		break;
		case 4:
	  		padded_num = '00000' + n_str;
	  		break;
		case 5:
	  		padded_num = '0000' + n_str;
	  		break;
		case 6:
	  		padded_num = '000' + n_str;
	  		break;
		case 7:
	  		padded_num = '00' + n_str;
	  		break;
		case 8:
	  		padded_num = '0' + n_str;
	  		break;
		case 9:
	  		padded_num = n_str;
	  		break;	  		
	}
	return padded_num;
}




function parse(config) {
	var self = this;
	//self.socket = socket;

	schema_sock.connect('tcp://' + config['in_host'] + ':' + config['in_port']);
	console.log('jsoncarrier, connected to in port: ' + config['in_port']);


	var buffer = '';		// as string.
	schema_sock.on('message', function(msg){
	
		try {
						
			msg = msgpack.decode(msg);
			//console.log('mDUMP> ' + util.inspect(msg, true, 99, true));
			
			var idc = msg.idc.toString();
			var unixtime = idc.substring(0, 10);
			var id = Number(idc.substring(10));			
			
			
			for ( var m in msg.messages ) {
				//console.log('m: ' + msg.messages[m].toString(config['encoding']));		// convert buffer stream to string.
				
				var message 		= {};
				message.apikey 		= msg.apikey;
				message.ns			= msg.ns;	
				message.band		= msg.band;	
				message.bands		= msg.bands;	
				id++;													// set id sequentially.
				message.id 			= unixtime.toString() + padd_number(id);
				message.message 		= msg.messages[m];						// the actual message contents.

				self.emit('message', message);
				
			}

		
		} catch(e) {
			// not valid message!
			self.emit('error', e);		
		}			
			
			

	});

	var ender = function() {
		if (buffer.length > 0) {
			self.emit('message', buffer);
			//console.log('buffer: ' + buffer + 'EOE');
			buffer = '';
		}
		self.emit('end');
	}

	//socket.on('end', ender);
}

