requirejs(['../js/config.js?v='+ (new Date()).getTime()], function() {
	'use strict';
	require(["../js/modules/applyLoan.js"], function(ApplyLoan) {
		return ApplyLoan;
	});
})