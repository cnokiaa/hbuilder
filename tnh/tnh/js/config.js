requirejs.config({
	baseUrl : "../js",
	urlArgs: "v=" + (new Date()).getTime(),
	paths : {
		"underscore" : "./libs/underscore-min",
		"zepto" : "./libs/zepto.min",
		"touch" : "./libs/touch",
		"fx" : "./libs/fx",
		"utils" : "./utils",
		"IScroll" : "./libs/iscroll-lite",
		"doT" : "./libs/doT.min"
	},
	shim : {
		"zepto" : {exports : "$"},
		"touch" : {deps : ["zepto"]},
		"fx" : {deps : ["zepto"]},
		"underscore" : {exports : "_"},
		"doT" : {exports : "doT"},
		"IScroll" : {exports : "IScroll"},
		"utils" : {
			exports : "utils",
			init : function() {
				return(Utils)
			}
		},
	}
});