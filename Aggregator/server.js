var aggregator = require('./aggregator').aggregator;
var statServer = require("dgram").createSocket("udp4");

var map = {}
statServer.on('message', function (msg, rinfo) {
    msg = msg.toString()
    try {
        aggregator.acceptStat(msg.split('|')[0], msg.split('|')[1])
    } catch (e) { console.dir(e) }
});

statServer.on("listening", function () {
  var address = statServer.address();
  console.log("statServer listening " +
      address.address + ":" + address.port);
});

statServer.bind(39851);