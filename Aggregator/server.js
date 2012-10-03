var aggregator = require('./aggregator').aggregator
var dgram = require("dgram")
var static = require('node-static')


var headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
}

// the stat aggregator server

var queued = 0
var statServer = dgram.createSocket("udp4", function (msg, rinfo) {
    queued++
    if (queued % 3 == 0) console.log('Queue now has ' + queued + ' items.')
    setTimeout(function() {
      msg = msg.toString()
      queued--
      try { 
        aggregator.storeStat(msg.split('|')[0], msg.split('|')[1], msg.split('|')[2])
      } catch(e) { 
        console.dir(e)
        console.log(msg)
      }
    }, 0)
});
statServer.bind(39851);


// the stat webservice
var handleSerivceCall = function(request, response) {
    var fragments = request.url.split('/').filter(function(fragment) {
      return fragment.trim().replace(/\//gi,'').length > 0
    })

    if (fragments[1].toLowerCase() == '_stats') {
      response.end(JSON.stringify(aggregator.getAllKeys()))
      return
    }

    response.writeHead('200', headers)
    var data
    try { data = aggregator.getStat(fragments[1], fragments[2]) } catch (e) { data = e }
    response.end(JSON.stringify(data))
}

// static fileserver
var fileServer = new(static.Server)('./public');
require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    try {
      // simple string based check for webservice call
      var fragments = request.url.split('/').filter(function(fragment) {
        return fragment.trim().replace(/\//gi,'').length > 0
      })


      if (fragments[0].toLowerCase() == 'stats') {
        // service call is host/stats/{{type}}
        handleSerivceCall(request, response)
      } else {
        fileServer.serve(request, response);
      }
    } catch(e) {
      response.end(JSON.stringify(e))
      console.log(e)
    }
  });
}).listen(80);