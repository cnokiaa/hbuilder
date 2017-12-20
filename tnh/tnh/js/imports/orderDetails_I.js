requirejs(['../js/config.js?v='+ (new Date()).getTime()], function() {
	'use strict';
	require(["../js/modules/orderDetails.js"], function(OrderDetails) {
		return OrderDetails;
	});
})