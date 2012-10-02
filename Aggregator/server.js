var aggregator = require('./aggregator').aggregator
var statServer = require("dgram").createSocket("udp4")
var static = require('node-static')


var headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
}

// the stat aggregator server
statServer.on('message', function (msg, rinfo) {
    msg = msg.toString()
    try { aggregator.storeStat(msg.split('|')[0], msg.split('|')[1], msg.split('|')[2]) } catch(e) { 
      console.dir(e) 
      console.log(msg)
    }
});
statServer.on('error', function(e) {
  console.dir(arguments)
})
statServer.bind(39851);


// the stat webservice
require('http').createServer(function(request, response) {
  var fragments = request.url.split('/').filter(function(fragment) {
    return fragment.trim().replace(/\//gi,'').length > 0
  })

  if (fragments[0].toLowerCase() == '_stats') {
    response.end(JSON.stringify(aggregator.getAllKeys()))
    return
  }

	response.writeHead('200', headers)
  var data
	try { data = aggregator.getStat.apply({ }, fragments) } catch (e) { data = e }
  response.end(JSON.stringify(data))

}).listen(8080)

// static fileserver
var fileServer = new(static.Server)('./public');
require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    fileServer.serve(request, response);
  });
}).listen(80);