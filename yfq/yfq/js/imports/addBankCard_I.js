requirejs(['../js/config.js?v='+ (new Date()).getTime()], function() {
	'use strict';
	require(["../js/modules/addBankCard.js"], function(AddBank) {
		return AddBank;
	});
})