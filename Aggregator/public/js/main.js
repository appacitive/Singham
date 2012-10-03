var canvas, context

// -----------  configurations  ----------
var host = 'localhost'
var totalTime = 5 * 60
var timeSliceSize = 1
var latencyRange = 2000
var latencyBucketSize = 50
var statName = 'apis.service1.users.signup.success'
var graphRefreshInterval = 900
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

var setMaxLatency = function(val) {
	latencyRange = val
	numBuckets = parseInt(latencyRange / latencyBucketSize)
	cellHeight = parseInt(canvas.height / numBuckets)
	$('#currentMaxLabel').html(val)
	$('div.y-axis-top').html(latencyRange + 'ms').show()
}

$(function() {
	canvas = document.getElementById('canvas')
	context = canvas.getContext('2d')

	window.onResize = function(w, h) {
		canvas.width = w || ($(document.body).innerWidth() - ($(document.body).innerWidth() % 100))
		canvas.height = h || ($(window).innerHeight() * 0.8)
		console.log('setting to ' + canvas.width + ' x ' + canvas.height)
		//var context = canvas.getContext('2d')
		//var gradient = context.createLinearGradient(0,0,0,canvas.height);
		//gradient.addColorStop(1, '#0B173B');
		//gradient.addColorStop(0, '#0040FF');
		//context.fillStyle = canvasBackgroundColor
		//context.fillRect(0, 0, canvas.width, canvas.height)
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
	setMaxLatency(latencyRange)
}, 10)
updateStats()
setInterval(updateStats, 5000)

var numWindows = parseInt(totalTime / timeSliceSize)
var numBuckets = parseInt(latencyRange / latencyBucketSize)

var cellWidth, cellHeight

var createGrid = function() {

	cellWidth = parseInt(canvas.width / numWindows)
	cellHeight = parseInt(canvas.height / numBuckets)

	console.log(canvas.width)
	console.log(numWindows)
	console.log(cellWidth)
	console.log(canvas.height)
	console.log(numBuckets)
	console.log(cellHeight)

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
	})
}
var flag = false
var parse = function(d) {
	context.clearRect(0, 0, canvas.width, canvas.height)
	var columns = d.columns
	for (var slice in columns) {
		slice = parseInt(slice)
		if (!slice) continue

		// color the statistic
		for (var latency in d.columns[slice]) {
			latency = parseInt(latency)
			if (isNaN(latency)) continue
			var columnTotal = d.columns[slice].total, blockTotal = d.columns[slice][latency].total
			var relative = parseFloat(blockTotal / columnTotal)
			var _x = (numWindows - slice) * cellWidth, _y = (numBuckets - latency - 1) * cellHeight
			var relativeLatency = latency * latencyBucketSize / latencyRange
			var r = 255 * relativeLatency, g = (1 - relativeLatency) * 255
			var fS = 'rgba(' + parseInt(r) + ',' + parseInt(g) + ',0,' + relative.toFixed(3) + ')'
			context.fillStyle = fS
			context.fillRect(_x, _y, cellWidth, cellHeight)
		}
	}
}