var canvas

// -----------  configurations  ----------
var host = '192.168.2.198'
var totalTime = 5 * 60
var timeSliceSize = 1
var latencyRange = 1 * 1500
var latencyBucketSize = 50
var statName = 'dataService.call'
var graphRefreshInterval = 2000
var defaultOpacity = 1
var minimumOpacity = 0.75
var canvasBackgroundColor = 'rgb(0,255,0)'
// -----------  configurations  ----------

var changeStat = function(stat) {
	$('.cell')
		.css('opacity', defaultOpacity)
		.css('border', '1px solid transparent')
	statName = stat
	$('span#currentStatLabel').html(statName)
}

var changeLatency = function(val) {

}

var allDone = function() {
	$('div#divAll').show()
}

$(function() {
	canvas = document.getElementById('canvas')
	window.onResize = function(w, h) {
		canvas.width = w || ($(document.body).innerWidth() - ($(document.body).innerWidth() % 100))
		canvas.height = h || ($(window).innerHeight() * 0.8)
		console.log('setting to ' + canvas.width + ' x ' + canvas.height)
		var context = canvas.getContext('2d')
		var gradient = context.createLinearGradient(0,0,0,canvas.height);
		gradient.addColorStop(1, '#0B173B');
		gradient.addColorStop(0, '#0040FF');
		context.fillStyle = canvasBackgroundColor
		context.fillRect(0, 0, canvas.width, canvas.height)
	}
	window.onresize = onResize
	onResize()

	createGrid()
})

var updateStats = function() {
	$.get('/stats/_stats', function(data) {
		data = JSON.parse(data)
		$('ul.stat-menu').empty()
		if (data.length == 0) return
		var el = Mustache.render($('#tmplStatDropDown').html(), { stats: data})
		$('ul.stat-menu').append($(el))
	})
}
setTimeout(function() {
	$('span#currentStatLabel').html(statName)
	$('span#currentLatencyLabel').html(latencyBucketSize)
	$('div.y-axis-top').html(latencyRange + 'ms').show()
}, 10)
updateStats()
setInterval(updateStats, 5000)

var appendBlock = function(height, width) {
	var i = 0
	var template = '<div id="cell{{id}}" rel="tooltip" class="cell" style="height: {{height}}px; width:{{width}}px;"><a rel="tooltip" class="a" href="javascript:void(0)">&nbsp;</a></div>'
	return function(number) {
		number = number || 1
		var strings = ''
		setTimeout(function() {
			for (var x1=0;x1<number;x1=x1+1) {
				var tempString = template
							.replace("{{id}}", i++)
							.replace("{{height}}", height)
							.replace("{{width}}", width)
				strings += tempString
			}
			$('div#container').append($(strings))
		}, 0)
	}
}

var insertBreak = function() {
	setTimeout(function() {
		$('<div></div>').addClass('clear').appendTo($('div#container'))
	})
}

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
		//for (var y=0;y<numWindows;y=y+1) {
			append(numWindows)
		//}
		insertBreak()
	}

	// optional
	window.onResize(numWindows * cellWidth, numBuckets * cellHeight)

	var redraw = function() {
		$.get('stats/' + statName, function(data) {
			parse(data)
		})
	}
	setInterval(redraw, graphRefreshInterval)

	var tmpl = $('#tmplTooltip').html()
	setTimeout(function() {
		$('div.y-axis').css('top', canvas.height / 2)
		$('a.a').tooltip({
			title: function() {
				var d = $(this).parent().data()
				if (!d || !d.total) return '<b>No Data Here</b>'
				return Mustache.render(tmpl, d)
			},
			html: true
		})
		allDone()
	})
}
var flag = false
var parse = function(d) {
	$('.cell')
		.css('opacity', defaultOpacity)
		.css('border', '1px solid transparent')
		.data().total = null
		//.removeClass('graph-square')

	var columns = d.columns
	var max = 0
	var getBlockByCoords = function(x, y) {
		return $('#cell' + ((y * numWindows) + x))
	}
	for (var slice in columns) {
		slice = parseInt(slice)
		if (!slice) continue

		if (max < d.columns[slice].frequency)		
			max = d.columns[slice].frequency

		// color the statistic
		for (var latency in d.columns[slice]) {
			latency = parseInt(latency)
			if (isNaN(latency)) continue
			var columnTotal = d.columns[slice].total, blockTotal = d.columns[slice][latency].total
			var relative = blockTotal / columnTotal
			var opacity = 1 - relative
			var block = getBlockByCoords(slice, numBuckets - latency)
			//var opacity = opacity - (1 - defaultOpacity)
			if (opacity <= minimumOpacity) opacity = minimumOpacity
			block.css('opacity', opacity)
			
			if  (block.get(0)) {
				block.data().min = d.columns[slice][latency].min
				block.data().max = d.columns[slice][latency].max
				block.data().average = d.columns[slice][latency].average
				block.data().total = d.columns[slice][latency].total
			} else {
				//console.log(slice + ',' + (numBuckets - latency))
			}
			if (slice == d.lastColumnWritten) {
				block.css('border', '1px solid yellow')
			}
		}
	}
}