var canvas

$(function() {
	canvas = document.getElementById('canvas')
	window.onResize = function(w, h) {
		canvas.width = w || ($(document.body).innerWidth() - ($(document.body).innerWidth() % 100))
		canvas.height = h || ($(document.body).innerHeight() - ($(document.body).innerHeight() % 100))
		console.log('setting to ' + canvas.width + ' x ' + canvas.height)
		var context = canvas.getContext('2d')
		var gradient = context.createLinearGradient(0,0,0,canvas.height);
		gradient.addColorStop(1, '#0B173B');
		gradient.addColorStop(0, '#0040FF');
		context.fillStyle = gradient
		context.fillRect(0, 0, canvas.width, canvas.height)
	}
	window.onresize = onResize
	onResize()

	createGrid()
})

var appendBlock = function(height, width) {
	var i = 0
	return function(opacity) {
		setTimeout(function() {
			$('<div></div>')
				.attr('id', 'cell' + i++)
				.addClass('cell')
				.css('height',height)
				.css('width',width)
				.css('opacity',opacity || 0.7)
				.appendTo($(document.body))
		})
	}
}

var insertBreak = function() {
	setTimeout(function() {
		$('<div></div>').addClass('clear').appendTo($(document.body))
	})
}

// -----------  configurations  ----------
var totalTime = 3 * 60
var timeSliceSize = 1
var latencyRange = 1 * 6000
var latencyBucketSize = 50
// -----------  configurations  ----------

var numWindows = parseInt(totalTime / timeSliceSize)
var numBuckets = parseInt(latencyRange / latencyBucketSize)

var createGrid = function() {
	var cellWidth = parseInt(canvas.width / numWindows)
	var cellHeight = parseInt(canvas.height / numBuckets)

	console.log(canvas.width)
	console.log(numWindows)
	console.log(cellWidth)
	console.log(canvas.height)
	console.log(numBuckets)
	console.log(cellHeight)

	console.log('Drawing ' + numWindows + ' columns and ' + numBuckets + ' cells.')
	var append = appendBlock(cellHeight - 2, cellWidth - 2)
	for (var x=0;x<numBuckets; x=x+1) {
		for (var y=0;y<numWindows;y=y+1) {
			append()
		}
		insertBreak()
	}

	// optional
	window.onResize(numWindows * cellWidth, numBuckets * cellHeight)

	var redraw = function() {
		$.get('http://localhost:8080/dataService.call', function(data) {
			//console.dir(data)
			parse(data)
		})
	}
	setInterval(redraw, 900)
}
var flag = false
var defaultOpacity = 1
var parse = function(d) {
	$('.cell').css('opacity', defaultOpacity).css('border-right', '1px solid transparent')
	var columns = d.columns
	var getBlockByCoords = function(x, y) {
		return $('#cell' + ((y * numWindows) + x))
	}
	for (var slice in columns) {
		slice = parseInt(slice)
		if (!slice) continue
		for (var latency in d.columns[slice]) {
			latency = parseInt(latency)
			if (!latency) continue
			var columnTotal = d.columns[slice].total, blockTotal = d.columns[slice][latency].total
			var relative = blockTotal / columnTotal
			var opacity = 1 - relative
			var block = getBlockByCoords(slice, numBuckets - latency)
			block.css('opacity', opacity - (1 - defaultOpacity))
			if (slice == d.lastColumnWritten) {
				block.css('border-right', '1px solid black')
			}
		}
	}
}