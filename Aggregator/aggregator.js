// aggregator.js
var exceptions = require('./exceptions').exceptions

// -----------  configurations  ----------
var latencyBucketSize = 50
var timeSliceSize = 1
var windowSize = 5 * 60
// -----------  configurations  ----------

var aggregator = new (function() {

	// the in-memory map of statistics
	var maps = {
		
	}

	this.getAllKeys = function() {
		var result = []
		for (var k in maps) {
			result.push({name: k, total: maps[k].total})
		}
		return result
	}

	// returns statictics for the requested time window
	// gives stats for window 'timeDurationInSeconds'
	this.getStat = function(key, timeDurationInSeconds) {
		timeDurationInSeconds = timeDurationInSeconds || windowSize
		
		var map = maps[key]
		if (!map) {
			throw exceptions.noStats
		}

		var numWindows = parseInt(timeDurationInSeconds / timeSliceSize)
		var totalWindows = parseInt(windowSize / timeSliceSize)
		if (numWindows > totalWindows) {
			throw exceptions.durationTooLong
		}

		// deep clone the in-memory map
		var copy = JSON.parse(JSON.stringify(map))
		var columns = [], isRolled = map.isRolled, callsToIgnore = 0

		if (isRolled == false) {
			// iterate over the columns in the map, and check their indices
			// if greater than numWindows, delete them
			// and keep a track of the api calls in that window
			// and finally subtract from the total apicalls
			//console.log('asked for stat, data is not rolled up. time window is: ' + timeDurationInSeconds)
			var newColumns = { }, index = map.lastColumnWritten
			for (var x = 0 ; x < numWindows ; x = x + 1) {
				// start from the column most recently written to
				// and add columns whilst going backwards
				// if you hit zero, just loop around and keep at it
				newColumns[x] = copy.columns[index]
				index --
				// console.log('copied ' + index + ' to ' + x)
			}
			// just copy over the columns from 'newColumns' to 'copy'
			for (var column in newColumns) {
				copy.columns[column] = newColumns[column]
			}

			if (false) {
				for (var column in copy.columns) {
					column = parseInt(column)
					if (!column) continue
					if (column >= numWindows) {
						console.log('ignoring column: ' + column)
						callsToIgnore += copy.columns[column].total
						delete copy.columns[column]
					}
				}
				copy.total -= callsToIgnore

				var num = 0
				for (var column in map.columns) {
					column = parseInt(column)
					if (!column) continue
					num++
				}
				for (var column in copy.columns) {
					column = parseInt(column)
					if (isNaN(column)) continue
					copy[column] = map[num - column]
				}
			}
		} else {
			// unroll the fucking thing
			var latest = map.lastColumnWritten
			//console.log('asked for stat, data is rolled up, latest column is ' + latest)
			var newColumns = {}
			var index = latest
			for (var x = 0 ; x < numWindows ; x = x + 1) {
				// start from the column most recently written to
				// and add columns whilst going backwards
				// if you hit zero, just loop around and keep at it
				if (index < 0) index = totalWindows + index
				newColumns[x] = copy.columns[index]
				index --
				// console.log('copied ' + index + ' to ' + x)
			}
			// just copy over the columns from 'newColumns' to 'copy'
			for (var column in newColumns) {
				copy.columns[column] = newColumns[column]
			}
		}

		return copy
	}

	// create a list of lists, primary level is the time windows
	// and secondary is the latency buckets, jagged.
	this.storeStat = function(key, value, timeStamp) {
		// create big ass bitmap in memory if doesnt already exist
		// resolve the cell 
		// update 
		// never write to redis
		timeStamp = parseInt(timeStamp)
		value = parseInt(value)

		var now = new Date()
		var statTime = new Date(timeStamp)
		var numWindows = windowSize / timeSliceSize

		if (statTime > now) {
			console.log('Future time received, discarding.')
			console.log('Time was: ' + statTime + ' and time is: ' + now)
			return
		}
		
		// create map if doesn't exist
		if (!maps[key]) {
			maps[key] = { 
				startTime: statTime,
				columns: { },
				lastColumnWritten: 0,
				total: 0,
				isRolled: false
			}
			console.log('Created stat: ' + key)
		}

		// figure the offset time in seconds
		var timeDiff = (timeStamp - maps[key].startTime.getTime()) / 1000
		//console.log('time difference is: ' + timeDiff)

		// figure out the column number
		// for a difference of [0, timeSliceSize), the column number is 0
		// for a difference of [timeSliceSize, 2 * timeSliceSize), the column number is 1
		// so on
		var columnNumber = parseInt(timeDiff / timeSliceSize)
		if (columnNumber < numWindows && !maps[key].columns[columnNumber]) {
			maps[key].columns[columnNumber] = { 
				total: 0, 
				startTime: statTime,
				frequency: 0
			}
		}

		// check if you've wrapped around and are going to reuse a column
		// if so, empty out the column and move the startTime
		// ahead by the column's time interval
		if (columnNumber >= numWindows) {
			columnNumber = columnNumber % numWindows
			if (statTime.getTime() - maps[key].columns[columnNumber].startTime.getTime() > timeSliceSize * 1000) {
				maps[key].columns[columnNumber] = { 
					total: 0, 
					startTime: statTime,
					frequency: 0
				}
			}
			maps[key].isRolled = true
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
				total: 0
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
		maps[key].columns[columnNumber].frequency = maps[key].columns[columnNumber].total / timeSliceSize
		maps[key].frequency = maps[key].total / timeDiff
	}

})()

exports.aggregator = aggregator