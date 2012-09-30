var aggregator = require('./aggregator').aggregator;
var statServer = require("dgram").createSocket("udp4");

var map = {}
statServer.on('message', function (msg, rinfo) {
    msg = msg.toString()
    try {
        aggregator.storeStat(msg.split('|')[0], msg.split('|')[1], msg.split('|')[2])
    } catch (e) { console.dir(e) }
});

statServer.on("listening", function () {
  var address = statServer.address();
  console.log("statServer listening " +
      address.address + ":" + address.port);
});

require('http').createServer(function(request, response) {

	var statName = request.url.split('/').filter(function(fragment) {
		return fragment.trim().replace(/\//gi,'').length > 0
	})[0]
	console.log('requested: ' + statName)

	response.writeHead('200', { "Content-Type": "application/json"})
	response.end(JSON.stringify(aggregator.getStat(statName)))

}).listen(8080)

statServer.bind(39851);