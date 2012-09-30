// aggregator.js
var redis = require('redis').createClient()

// -----------  configurations  ----------
var latencyBucketSize = 10
var timeSliceSize = 5
var windowSize = 10
// -----------  configurations  ----------

var aggregator = new (function() {

	// the in-memory map of statistics
	var maps = {
		
	}

	this.getStat = function(key) {
		return maps[key] || { }
	}

	this.storeStat = function(key, value, timeStamp) {
		// create big ass bitmap in memory if doesnt already exist
		// resolve the cell 
		// update 
		// never write to redis coz its lame
		timeStamp = parseInt(timeStamp)
		value = parseInt(value)

		var now = new Date()
		var statTime = new Date(timeStamp)
		var numWindows = windowSize / timeSliceSize

		if (statTime > now) return
		
		// create map if doesn't exist
		if (!maps[key]) {
			maps[key] = { 
				startTime: statTime,
				columns: { },
				lastColumnWritten: 0,
				total: 0
			}
		}

		// figure the offset time in seconds
		var timeDiff = (timeStamp - maps[key].startTime.getTime()) / 1000
		//console.log('time difference is: ' + timeDiff)

		// figure out the column number
		// for a difference of [0, timeSliceSize), the column number is 0
		// for a difference of [timeSliceSize, 2 * timeSliceSize), the column number is 1
		// so on
		var columnNumber = parseInt(timeDiff / timeSliceSize)
		if (columnNumber < numWindows && !maps[key].columns[columnNumber]) maps[key].columns[columnNumber] = { total: 0 }

		// check if you've wrapped around and are going to reuse a column
		// if so, empty out the column and move the startTime
		// ahead by the column's time interval
		if (columnNumber >= numWindows) {
			columnNumber = columnNumber % numWindows
			maps[key].columns[columnNumber] = { total: 0 }
		}

		// figure out the latency bucket
		// for a latency of [0, latencyBucketSize), the latency bucket is 0
		// for a latency of [latencyBucketSize, 2 * latencyBucketSize), the latency bucket is 1
		// so on
		var latencyBucket = parseInt(value / latencyBucketSize)
		if (!maps[key].columns[columnNumber][latencyBucket]) 
			maps[key].columns[columnNumber][latencyBucket] = { 
				max: -1,
				min: Infinity,
				average: 0,
				total: 0,
			}

		// and insert the data
		var bucket = maps[key].columns[columnNumber][latencyBucket]
		bucket.max = bucket.max < value ? value : bucket.max
		bucket.min = bucket.min > value ? value : bucket.min
		bucket.average = parseInt(((bucket.average * bucket.total) + value) / (bucket.total + 1))
		bucket.total += 1

		// also put some meta information
		maps[key].lastColumnWritten = columnNumber
		maps[key].total += 1
		maps[key].columns[columnNumber].total += 1
	}

})()

exports.aggregator = aggregator