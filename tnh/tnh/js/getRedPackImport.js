var baseUrl = '../js';
requirejs([baseUrl + '/config.js?v='+ (new Date()).getTime()], function() {
	'use strict';
	require([baseUrl + "/modules/redPackList.js"], function(redPackList) {
		return redPackList;
	});
})