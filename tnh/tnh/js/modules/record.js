define([
'zepto',
'IScroll',
'fx',
'touch',
], function($,IScroll) {
	var Record = {
		// 初始化
		initialize : function() {
			var $this = this;
			this.myScroll = null;
			this.trdhk = null;
			this.strshz = null;
			this.stryja = null;
			this.strsb = null;

			this.startEvent();

			this.getData();
			// 组件拖拽
			this.dragIscroll();
			// 组件返回
			this.scrollBack();
			$(".mui-action-back").on("tap",function(){
				closeView();
			});
			// 查看详情
			$("#scroller").on('tap', "ul li", function() {plus.storage.clear();
				var a = $(this).attr("data-orderid"),
					b = $(this).attr("data-period"),
					c = $(this).attr("data-contractstatus"),
					d = a + "|" + b + "|" + c;
				plus.storage.setItem("record",d);
				openView("orderDetails");
			});
		},
		// 初始事件
		startEvent : function() {
			// 初始index
			var indexStart = 0,$this = this;
			
			$(".wrap").height($(window).height()-$(".mui-bar").height());
			$(window).on("resize",function() {
				setTimeout(function() {
					$(".wrap").height($(window).height()-$(".mui-bar").height())
					$this.myScroll.refresh();
				}, 500);
			});
			// tab切换
			$("nav").on('tap', "span", function() {
				var _index = $(this).index();
				$(this).addClass("chosed").siblings().removeClass("chosed");
				if(_index != indexStart) {
					$this.refreshTpl(_index);
					if($this.myScroll) {
						$this.myScroll.refresh();
					}
					indexStart = _index;
				}
			});
		},
		refreshData : function(data) {
			// 待还款
			this.strdhk = this.getStr(data.dhkData);
			// 审核中
			this.strshz = this.getStr(data.shzData);
			// 已结案
			this.stryja = this.getStr(data.yjaData);
			// 失败
			this.strsb = this.getStr(data.sbddData);
		},
		// 列表查询
		getData : function() {
			this.AJAX(
				function(data) {
					showLoad();
					if(data.status == "success") {
						var data = data.data;
						this.refreshData(data);
						$("#scroller ul").html(this.strdhk);
					}
					this.myScroll = new IScroll('#wrapper',{
						mouseWheel: true,
					});
				},
				function() {
					closeLoad();
					this.myScroll = new IScroll('#wrapper',{
						mouseWheel: true,
					});
				}
			);
		},
		AJAX : function(successCB, errorCB) {
			var $this = this;
			$.ajax({
				type : "GET",
				// url : "../json/test.json",
				url : "../json/applyLoansRecord.json",
				dataType : "json",
				success : function(data) {
					if(successCB) {
						successCB.call($this,data);
					}
 				},
				error : function() {
					if(errorCB) {
						errorCB.call($this,data);
					}
				}
			})
		},
		// 根据数据获取模板
		getStr : function(arr) {
			var str = "";
			for(var i = 0; i < arr.length; i++) {
				var dataPart = arr[i];
				var time = this.turnTime(dataPart.applytime);
				var sta = this.getTypeClass(dataPart.contractstatus);
				var waiTips = sta.typeIndex == '9' ? '<b>待补件</b>' : '';
				var addTips = sta.typeIndex == '9' ? '<div><i>补充资料</i></div>' : '';
				str += '<li data-contractstatus="'+dataPart.contractstatus+'" data-period="' + dataPart.period + '" data-orderid="' + dataPart.contractno + '" class="' + sta.typeClass + '">'+
								'<div class="list-left">'+
									'<strong>' + sta.type + '</strong>'+
									'<span>' + time + '</span>'+ waiTips+
								'</div>'+
								'<div class="list-right">'+
									'<em>' + dataPart.busstyepName + '</em>'+
									'<b>'+ dataPart.applyamt +'元</b>'+ addTips +
								'</div>'+
							'</li>';
			}
			return str;
		},
		// 生成模板
		refreshTpl : function(index) {
			if(index == 0) {
				$("#scroller ul").html(this.strdhk);
			}
			if(index == 1) {
				$("#scroller ul").html(this.strshz);
			}
			if(index == 2) {
				$("#scroller ul").html(this.stryja);
			}
			if(index == 3) {
				$("#scroller ul").html(this.strsb);
			}
		},
		// 时间格式转换
		turnTime: function(time) {
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
		// 得到类名和相应的状态中文
		getTypeClass : function(x) {
			var o = {}
			switch(x) {
				case "1" : o.type = "审核中";
						 o.typeClass ="in-the-audit"; 
						 o.typeIndex =1;
						 break;
				case "2" : o.type = "放款失败";
						 o.typeClass ="loan-failure";
						 o.typeIndex =2;
						 break;
				case "3" : o.type = "待还款";
						 o.typeClass ="wait-pay";
						 o.typeIndex =3;
						 break;
				case "4" : o.type = "已结案";
						 o.typeClass ="case-closed";
						 o.typeIndex =4;
						 break;
				case "5" : o.type = "已逾期";
						 o.typeClass ="be-overdue";
						 o.typeIndex =5;
						 break;
				case "6" : o.type = "审核失败";
						 o.typeClass ="audit-failure";
						 o.typeIndex =6;
						 break;
				case "9" : o.type = "审核失败";
						 o.typeClass ="wait-add";
						 o.typeIndex =9;
						 break;
			}
			return o;
		},
		// 刷新组件
		refreshDom : function(start) {
			this.myScroll = new IScroll('#wrapper',{
				mouseWheel: true,
				startY : start
			});
		},
		// 组件拖拽
		dragIscroll : function() {
			var $this = this;
			$("#wrapper").on("touchmove", function() {
				if($this.myScroll) {
					var rem = window.rem;
					if($this.myScroll.y > 2.5 * rem) {
						$(".loading-tip strong").html("释放立即刷新");
					} else {
						$(".loading-tip strong").html("下拉刷新");
					}
				}
			})
		},
		// 组件回滚
		scrollBack : function() {
			var $this = this;
			$("#wrapper").on("touchend", function() {
				var rem = window.rem;
				var start = $this.myScroll;
				if($this.myScroll) {
					if($this.myScroll.y > 2.5 * rem) {
						$this.myScroll.destroy();
						$this.myScroll = null;
						$(".loading-tip strong").html("正在刷新");
						$("#scroller").animate({
							"-webkit-transform" : "translateY(" + (2*rem) + "px)",
							"-moz-transform" : "translateY(" + (2*rem) + "px)",
							"-ms-transform" : "translateY(" + (2*rem) + "px)",
							"-o-transform" : "translateY(" + (2*rem) + "px)",
							"transform" : "translateY(" + (2*rem) + "px)"
						}, 400, function() {
							// 设置下拉刷新提示最少停留时间
							var delay = 800;
							var date = new Date();
							var timeStart = date.getMilliseconds();
							$this.AJAX(successDo,errorDo)
							function successDo(data) {
								if(data.status == "success") {
									var data = data.data;
									var _index = $("nav").children(".chosed").index();

									this.refreshData(data);
									this.refreshTpl(_index);
									$(".loading-tip strong").html("刷新成功");

								} else {
									$(".loading-tip strong").html("刷新失败");
								}
								var timeEnd = date.getMilliseconds();
								var timeSpace = timeEnd - timeStart;
								if(timeSpace >= delay) {
									$this.refreshDom(2*rem);
									$("#scroller").animate({
										"transform": "translate(0px, 0px) translateZ(0px)",
										"-webkit-transform" : "translate(0px, 0px) translateZ(0px)",
										"-moz-transform" : "translate(0px, 0px) translateZ(0px)",
										"-ms-transform" : "translate(0px, 0px) translateZ(0px)",
										"-o-transform" : "translate(0px, 0px) translateZ(0px)",
									    "transition-timing-function": "cubic-bezier(0.1, 0.57, 0.1, 1)",
									    "transition-duration": "0ms"
									}, 500);
								//	$this.myScroll.scrollTo(0, 0, 500, IScroll.utils.ease.quadratic);
								} else {
									var needDelay = delay - timeSpace;
									setTimeout(function() {
										$this.refreshDom(2*rem);
										$("#scroller").animate({
											"transform": "translate(0px, 0px) translateZ(0px)",
											"-webkit-transform" : "translate(0px, 0px) translateZ(0px)",
											"-moz-transform" : "translate(0px, 0px) translateZ(0px)",
											"-ms-transform" : "translate(0px, 0px) translateZ(0px)",
											"-o-transform" : "translate(0px, 0px) translateZ(0px)"
										}, 500);
										//$this.myScroll.scrollTo(0, 0, 500, IScroll.utils.ease.quadratic);
										
									}, needDelay);
								}
							}
							function errorDo() {
								$(".loading-tip strong").html("刷新失败");
								var timeEnd = date.getMilliseconds();
								var timeSpace = timeEnd - timeStart;
								if(timeSpace >= delay) {
									this.refreshDom(2*rem);
									this.myScroll.scrollTo(0, 0, 500, IScroll.utils.ease.quadratic)
								} else {
									var needDelay = delay - timeSpace;
									setTimeout(function() {
										$this.refreshDom(2*rem);
										$this.myScroll.scrollTo(0, 0, 500, IScroll.utils.ease.quadratic)
									}, needDelay);
								}
							}
						});
					}
				}
			});
		},
	}
	Record.initialize();
});