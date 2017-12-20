var baseUrl = '../js';
requirejs([baseUrl + '/config.js?v='+ (new Date()).getTime()], function() {
	'use strict';
	require([baseUrl + "/modules/addPersonalAndWorkUnit.js"], function(AddInf) {
		return AddInf;
	});
})