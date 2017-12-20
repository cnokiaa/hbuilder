define([
'zepto',
'IScroll',
'touch'
], function($,IScroll) {
	var redPackList = {
		// 初始化
		initialize : function() {
			this.pageIndex = 0;
			this.setHeight();
			this.myScroll = new IScroll('#wrapper',{
				mouseWheel: true,
				snap:true
			});
			this.hrefJump();
			this.dragIscroll();
			this.scrollBack();
		},
		setHeight:function(){
			var oheight = document.documentElement.clientHeight - $("header").height();
			$("#wrapper").css("height",oheight);
		},
		hrefJump: function() {
			$('#scroller').delegate('.btn','tap', function() {
				openView("trialCalculate");
			});
			$(".mui-action-back").on("tap",function(){
				closeView();
			});
		},
		// 组件拖拽
		dragIscroll : function() {
			var myScroll = this.myScroll;
			$("body").delegate("#wrapper","touchmove", function() {
				if(myScroll) {
					var rem = window.rem;
					if(myScroll.maxScrollY - myScroll.y > 2.5 * rem) {
						$(".loading-tip strong").html("释放立即刷新");
					} else {
						$(".loading-tip strong").html("加载更多");
					}
				}
			})
		},
		// 组件回滚
		scrollBack: function() {
			var myScroll = this.myScroll;
			var $this = this;
			$("body").delegate("#wrapper","touchend", function() {
				var rem = window.rem;
				if(myScroll.maxScrollY - myScroll.y > 2.5 * rem) {
					$(".loading-tip strong").html("正在更新");
					$this.scrollPause(myScroll.maxScrollY, 2*rem)
					
				} else {
					$(".loading-tip strong").html("加载更多");
				}
			});
		},
		// 获取新内容
		getPage: function(index,successCB, errorCB) {
			$.ajax({
				type: 'get',
				url: '/dsdsd/c',
				data: {page:index},
				dataType: 'json',
				success: function(data) {
					if(successCB) {
						successCB(data)
					}
				}.bind(this),
				error: function() {
					if(errorCB) {
						errorCB();
					}
				}.bind(this)
			})
		},
		// 运动暂停
		scrollPause: function(start,offset) {
			var $this = this;
			var mscroll = this.myScroll;
			/*if(this.myScroll) {
				this.myScroll.destroy();
				this.myScroll = null;
				
			}*/
			var offsetY = start-offset;
			$("#scroller").animate({
				"-webkit-transform" : "translateY(" + offsetY + "px)",
				"-moz-transform" : "translateY(" + offsetY + "px)",
				"-ms-transform" : "translateY(" + offsetY + "px)",
				"-o-transform" : "translateY(" + offsetY + "px)",
				"transform" : "translateY(" + offsetY + "px)"
			}, 400, function() {
				// 设置下拉刷新提示最少停留时间
				var delay = 800;
				var date = new Date();
				var timeStart = date.getMilliseconds();
				// 数据请求
				$this.getPage($this.pageIndex,successDo,errorDo);

				function successDo(data) {
					if(data.status == "success") {
						$(".loading-tip strong").html("获取成功");
						// ajax获取成功执行
						/*$this.pageIndex++;*/
						

					} else {
						$(".loading-tip strong").html("获取失败");
					}
					var timeEnd = date.getMilliseconds();
					var timeSpace = timeEnd - timeStart;
					if(timeSpace >= delay) {
						this.refreshDom(mscroll);
					//	this.myScroll.scrollTo(0, start, 500, IScroll.utils.ease.quadratic)
					} else {
						var needDelay = delay - timeSpace;
						setTimeout(function() {
							$this.refreshDom(mscroll);
						//	$this.myScroll.scrollTo(0, start, 500, IScroll.utils.ease.quadratic)
						}, needDelay);
					}
				}
				function errorDo() {
					$(".loading-tip strong").html("获取失败");
					var timeEnd = date.getMilliseconds();
					var timeSpace = timeEnd - timeStart;
					if(timeSpace >= delay) {
						this.refreshDom(mscroll);
					//	this.myScroll.scrollTo(0, start, 500, IScroll.utils.ease.quadratic)
					} else {
						var needDelay = delay - timeSpace;
						setTimeout(function() {
							$this.refreshDom(mscroll);
						//	$this.myScroll.scrollTo(0, start, 500, IScroll.utils.ease.quadratic)
						}, needDelay);
					}
				}
			})
		},
		// 刷新组件
		refreshDom : function(mscroll) {
			mscroll.refresh();
			
		},
	}
	redPackList.initialize();
})