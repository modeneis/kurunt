//
// Kurunt, My Worker
//
// Using Kurunt as a module framework, My Worker.
// Version: 0.2
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2013-2014 Mark W. B. Ashcroft.
// Copyright (c) 2013-2014 Kurunt.
//



// must export 'work' module.
module.exports.work = function (message, wk, fn, callback) {
  // use try catch so can skip over invalid messages.
  try {

    //console.log('myworker@workers> MESSAGE: ' + require('util').inspect(message, true, 99, true));    // uncomment to debug message.
    
    var mymessage = message.message.toString(wk['config']['encoding']);   // toSting the message.
    //console.log('myworker@workers> mymessage: ' + require('util').inspect(mymessage, true, 99, true));    // uncomment to debug message.
    
    var attributes = [];
    attributes['mymessage'] = mymessage;

    return callback( [ message, attributes ] );   // must return.
  
  } catch(e) {
    //console.log('myworker@workers> ERROR: ' + require('util').inspect(e, true, 99, true));     // uncomment to debug errors.
    return callback( false );   // must return.
  }
};


// set the worker config, or call a json config file via require.
var config = {
  "name": "myworker",
  "title": "My Worker",
  "description": "My Worker for benchmarking Kurunt.",
  "inputs": [ "tcp", "udp", "http" ],
  "encoding": "utf8",
  "stores": [
    {
      "mystore": {
        "schema": {
          "mymessage": { }
        }
      }
    }  
  ]
};
exports.config = config;    // must export the config so kurunt can read it.

