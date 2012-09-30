var dgram = require('dgram');

var t = setInterval(function() {
	var client = dgram.createSocket("udp4")
	var message = new Buffer("apis.service1.users.signup.success|" + parseInt(Math.random() * 600) + "|" + (new Date().getTime()));
	client.send(message, 0, message.length, 39851, "localhost", function(e, m) {
		console.log(message.toString())
		client.close()
	})
}, 100)
