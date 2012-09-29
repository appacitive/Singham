var dgram = require('dgram');
var message = new Buffer("apis.service1.users.signup.success|100");

setInterval(function() {
	var client = dgram.createSocket("udp4")
	client.send(message, 0, message.length, 39851, "localhost", function(e, m) {
		client.close()
	})
}, 0)