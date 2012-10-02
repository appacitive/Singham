exports.exceptions = new (function() {
	
	this.noStats = {
		name: 'NoDataAvailable',
		message: 'No data exists for the requested statistic.'
	}

	this.durationTooLong = {
		name: 'RequestedDurationTooLong',
		message: 'The requested time duration is too long.'
	}

})