// aggregator.js
var redis = require('redis').createClient()

var aggregator = new (function() {

	// -----------  configurations  ----------
	var latencyBucketSize = 10
	var timeSliceSize = 5
	// -----------  configurations  ----------
	
	// the in-memory map of statistics
	var map = {}
	this.acceptStat = function(key, timeTaken) {
		timeTaken = parseInt(timeTaken)

		var bucket = parseInt(timeTaken / latencyBucketSize)
		
		if (!map[key]) {
			map[key] = { }
		}
		if (!map[key][bucket]) {
			map[key][bucket] = { 
				max: -1,
				min: Infinity,
				average: 0,
				total: 0,
				timeStamp: new Date()
			}
		}
		map[key][bucket].max = map[key][bucket].max < timeTaken ? timeTaken : map[key][bucket].max
		map[key][bucket].min = map[key][bucket].min > timeTaken ? timeTaken : map[key][bucket].min
		map[key][bucket].average = parseInt(((map[key][bucket].average * map[key][bucket].total) + timeTaken) / (map[key][bucket].total + 1))
		map[key][bucket].total += 1
	}

	// the function that will dump the data
	setInterval(function() {
		console.log(JSON.stringify(map, null, 2))
		for (var keyName in map) {
			redis.set(keyName, map[keyName])
		}
		map = { }
	}, 5000)

})()

exports.aggregator = aggregator