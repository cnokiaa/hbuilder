requirejs.config({
	baseUrl : "../js",
	urlArgs: "v=" + (new Date()).getTime(),
	paths : {
		//"mui" : "./libs/mui.min",
		"underscore" : "./libs/underscore-min",
		"zepto" : "./libs/zepto.min",
		"touch" : "./libs/touch",
		"fx" : "./libs/fx",
		"fx_methods" : "./libs/fx_methods",
		"class" : "./libs/class",
		"utils" : "./utils",
		"IScroll" : "./libs/iscroll-lite",
		"doT" : "./libs/doT.min"
	},
	shim : {
		//"mui" : {exports : "mui"},
		"zepto" : {exports : "$"},
		"touch" : {deps : ["zepto"]},
		"fx" : {deps : ["zepto"]},
		"fx_methods" : {deps : ["zepto"]},
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