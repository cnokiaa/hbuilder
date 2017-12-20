var baseUrl = '../js';
requirejs([baseUrl + '/config.js?v='+ (new Date()).getTime()], function() {
	'use strict';
	require([baseUrl + "/modules/login.js"], function(loginE) {
		loginE.initialize()
	});
})