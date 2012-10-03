var dgram = require('dgram');

var t = setInterval(function() {
	var client = dgram.createSocket("udp4")
	var apiLatency = parseInt(Math.random() * 500) + (Math.random() * 700)
	var message = new Buffer("apis.service1.users.signup.success|" + apiLatency + "|" + (new Date().getTime()));
	client.send(message, 0, message.length, 39851, "localhost", function(e, m) {
		//console.log(message.toString())
		client.close()
	})
}, parseInt(Math.random() * 10))