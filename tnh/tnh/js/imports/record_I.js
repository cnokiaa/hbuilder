requirejs(['../js/config.js?v='+ (new Date()).getTime()], function() {
	'use strict';
	require(["../js/modules/record.js"], function(Record) {
		return Record;
	});
})