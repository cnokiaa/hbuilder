requirejs(['../js/config.js?v='+ (new Date()).getTime()], function() {
	'use strict';
	require(["../js/modules/uploadImages.js"], function(UploadModle) {
		return UploadModle;
	});
})