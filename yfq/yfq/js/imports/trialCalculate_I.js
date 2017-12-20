requirejs(['../js/config.js?v='+ (new Date()).getTime()], function() {
	'use strict';
	require(["../js/modules/trialCalculate.js"], function(Trial) {
		return Trial;
	});
})