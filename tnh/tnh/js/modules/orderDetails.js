define([
'zepto',
'doT',
'touch'
], function($,doT) {
	var OrderDetails = {
		// 初始化
		initialize : function() {
			// 模块组件方法扩展
			$.fn.template = function(data) {
				if(this.attr("type") == "text/x-dot-template") {
					var scource = this.text();
					var template = doT.template(scource);
					var result = template(data);
					return result;
				} else {
					return "error";
				}
			}
			
			$(".mui-action-back").on("tap",function(){
				closeView();
			});
			var record = plus.storage.getItem("record").split("|");
			this.tplType = record[2];
			//this.tplType = 2;
			this.init();
		},
		// 初始化数据
		init : function() {
			var $this = this;
			$.ajax({
			    type : "GET",
			    url : "../json/orderDetails.json",
			    contentType: "application/json",
				dataType : "json",
				success : function(data) {
					if(data.status == "success") {
						$this.tpldata = data.data;	
						$this.initTpl($this.tpldata, $this.tplType);
					}
				}
			});
		},
		// 初始化模板
		initTpl : function(data,type) {
			// 审核中
			var str1 = $("#tpl1").template(data);
			// 放款失败
			var str2 = $("#tpl2").template(data);
			// 待还款
			var str3 = $("#tpl3").template(data);
			// 已结案
			var str4 = $("#tpl4").template(data);
			// 已逾期
			var str5 = $("#tpl5").template(data);
			// 审核失败
			var str6 = $("#tpl6").template(data);
			if(type == 1) {
				$(".btn-part").hide();
				$(".wrap").html(str1);
			}
			if(type == 2) {
				$(".btn-part").hide();
				$(".wrap").html(str2);
			}
			if(type == 3) {
				$(".wrap").html(str3);
				$(".btn-part").show();
			}
			if(type == 4) {
				$(".btn-part").hide();
				$(".wrap").html(str4);
			}
			if(type == 5) {
				$(".wrap").html(str5);
				$(".btn-part").show();
			}
			if(type == 6 || type == 9) {
				$(".btn-part").hide();
				$(".wrap").html(str6);
			}
		},
		// 时间格式转换
		turnTime : function(time) {
			var timeStr = time;
			if(time.length >= 8) {
				if(timeStr.match(/^\d{8}/gi)) {
					timeStr = timeStr.match(/^\d{8}/gi)[0];
					var year = timeStr.slice(0,4);
					var month = timeStr.slice(4,6);
					var day = timeStr.slice(6,8);
					timeStr = year + "-" + month + "-" + day;
				}
			}
			return timeStr;
		},
		// 返回脱敏字符串
		returnBankCardStr : function(str) {
			return str.substr(0,6) + '******' + str.substr(-4,4);
		},
	}
	OrderDetails.initialize();
});