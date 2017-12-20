define([
'zepto',
'underscore',
'touch'
], function($,_) {
	var Trial = {
		// 初始化
		initialize : function() {
			_.templateSettings = {
				evaluate: /\{\{([\s\S]+?)\}\}/g,
				interpolate: /\{\{=(.+?)\}\}/g,
				escape: /\{\{-(.+?)\}\}/g
			};
			// openid
			this.openid = $("#openid").val();
			this.dataStr;
			// 禁止输入法go和“前往”强制提交
			$("input").on("keydown", function() {
				var keyCode = event.keyCode|| event.which;
				if(keyCode == 13) {
					return false;
				}
			});
			// 检查设备
			this.deviceType = this.checkDevice();
			// 获取周期列表
			this.getChoseList();
			this.startEvent();
		},
		// 初始事件
		startEvent : function() {
			var _this = this;
			// 清除输入
			this.clearNum();
			// 给选择列表绑定点击事件
			this.choseCycle();
			this.showClearBtn();
			// 失焦事件绑定
			this.inputBlur();
			// 申请点击事件
			this.subDate();
			if($(".errmsgShow").val() != "" && $(".errmsgShow").length != 0) {
				this.popup($(".errmsgShow").val());
			}
			// 弹窗取消关闭弹窗
			$(".popup-con").on("touchend", "div", function() {
				$(".popup").hide();
			});
			$(".popup").on("touchstart",function(e) {
				if(e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
			});
		},
		showLoad: function() {
			plus.nativeUI.showWaiting( "等待中..." );
		},
		closeLoad: function() {
			setTimeout( function(){
				plus.nativeUI.closeWaiting();
			}, 500 );
		},
		// 检测设备类型
		checkDevice : function() {
			// 默认设备为安卓
			var deviceType = "1";
			var sUserAgent = navigator.userAgent.toLowerCase();
			var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
			var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
			var bIsAndroid = sUserAgent.match(/android/i) == "android";
			if(bIsIpad || bIsIphoneOs) {
				deviceType = "2";
			}
			if(bIsAndroid) {
				deviceType = "1";
			}
			return deviceType;
		},
		// 清除输入
		clearNum : function() {
			$('.input-apply').on('touchend', '.remove', function() {
				$('.input-apply input').val('');
				$(this).removeClass('remove');
				$('.replay-det').remove();
			});
		},
		// 输入时有内容出现叉叉
		showClearBtn : function() {
			$('.input-apply input').on('keyup', function() {
				if($(this).val() != '') {
					$('.input-apply b').addClass('remove');
				}
			})
		},
		// 点击弹出协议和退出
		more : function() {
			$('header').on('click', '.connect', function() {
				if($(this).data('show')) {
					$(this).data('show', false);
					$(".connect-con").hide();
				} else {
					$(this).data('show', true);
					$(".connect-con").show();
				}
			});
		},
		// 请求周期列表
		getChoseList : function() {
			this.showLoad();
			var _this = this;
			$.ajax({
				type : "get",
				url : "../js/product.json",
				//type : "post",
				//url : common.baseUrl + "order/application/query/product",
				//data: JSON.stringify({keyPrefix:'FLW30467666452677632', platform:this.deviceType}),
				contentType: "application/json",
				dataType : "json",
				success : function(data) {
					if(data.status == "success") {
						var rateDate = data.data.ratelist;
						var str = "";
						_this.limitMax = data.data.hiappamt;
						_this.limitMin = data.data.lowappamt;
						$('.user-tips strong').html('￥' + _this.limitMax).parent().show();
						$('.input-apply input').attr('placeholder','最低' + _this.limitMin + '元，最高' + _this.limitMax + '元');
						for(var i = 0; i < rateDate.length; i++) {
							var muchNum = rateDate[i].periods,
								numUnit = rateDate[i].lenunit,
								lenunit = rateDate[i].lenunit;
							if(numUnit == "D") {
								numUnit = "天";
							}
							if(numUnit == "W") {
								numUnit = "周";
							}
							if(numUnit == "M") {
								numUnit = "月";
							}
							if(numUnit == "Y") {
								numUnit = "年";
							}
							str += '<span>' + muchNum + numUnit +'</span>';
						}
						str = '<div class="cycle-part-con clearfix">' + str + '</div>';
						$(".cycle-part").html(str);
						$(".cycle-part span").each(function() {
							var i = $(this).index();
							$(this).data('productno', rateDate[i].productno).data('period',rateDate[i].periods).data('rate',rateDate[i].rate).data('periodlen',rateDate[i].periodlen).data('lenunit',rateDate[i].lenunit);
						});
						_this.showHty();
						$(".apply-cycle").show();
					} else {
						_this.popup(data.errmsg);
					}
					_this.closeLoad();
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					_this.closeLoad();
					_this.popup('请求失败请重试');
				}
			});
		},
		// 选择周期
		choseCycle : function() {
			var _this = this;
			// 选择周期请求计算
			$(".apply-cycle").on("tap", ".cycle-part-con span", function() {
				$("input").blur();
				$(this).addClass("selected").siblings().removeClass("selected");
				// 周期数periods
				$("#period").val($(".selected").data("period"));
				// productno
				$("#productno").val($(".selected").data("productno"));
				_this.runAjax();
			});
		},
		runAjax : function() {
			var muchM = $(".input-apply input").val();
			if(muchM != "") {
				var productno = $(".selected").data("productno"),
					periodData = $(".selected").data("period"),
					rate = $(".selected").data("rate"),
					periodlen = $(".selected").data("periodlen"),
					lenunit = $(".selected").data("lenunit");
				this.ajaxDate(productno);
			}
		},
		// 请求详细列表
		ajaxDate : function(productno) {
			this.BeforeAjaxPublic(function(applyamt) {
				var _this = this;
				this.showLoad();
				$.ajax({
					type : "POST",
					//url : common.baseUrl + "order/application/query/plan",
					url : "../js/plan.json",
					data: JSON.stringify({keyPrefix:'FLW30467666452677632',period:"6",lenunit:"M",productno: productno, applyamt : applyamt}),
					contentType: "application/json",
					dataType : "json",
					success : function(data) {
						if(data.status == "success") {
							// 手续费
							var timeFree = data.data.oneOffPayment,
							// 到账金额
								ownMoney = data.data.accountMoney,
							// 月还款额
								eachMoney = data.data.eachMoney;
                            //还款时间
							var dueTime=data.data.dueTime;

							var dataTem = {
								// 一次性服务费
								timeFree : timeFree,
								// 到账金额
								ownMoney : ownMoney,
								// 一次性还还款
								eachMoney : eachMoney,
								// 每月还款日
								dueTime : dueTime
							}
							_this.dataStr = timeFree + "|" + ownMoney +"|"+ eachMoney +"|"+ dueTime;
							// 插入模板
							var tpl = _this.detTemplate(dataTem);
							if($(".replay-det").length != 0) {
								$(".replay-det").remove();
							}
							$(".apply-cycle").append(tpl);
							$(".replay-det").data('much',applyamt);
						} else {
							_this.popup(data.errmsg);
						}
						_this.closeLoad();
					}
				})
			})
		},
		// input失焦事件
		inputBlur : function() {
			var _this = this;
			$(".input-apply input").blur(function() {
				_this.BeforeAjaxPublic(function(applyamt) {
					// 符合数据要求，检测是否有选择周期
					if($(".selected").length != 0) {
						var productno = $(".selected").data("productno"),
							periodData = $(".selected").data("period"),
							rate = $(".selected").data("rate"),
							periodlen = $(".selected").data("periodlen"),
							lenunit = $(".selected").data("lenunit");
						this.ajaxDate(productno);
					}
				})
			})
		},
		// 请求数据前的判断
		BeforeAjaxPublic : function(callBack) {
			// 判断输入内容是否符合输入范围
			var muchM = $(".input-apply input").val();
			var applyamt = Number(muchM);
			if(muchM != "") {
				if(applyamt.toString() == "NaN") {
					this.closeLoad();
					this.popup("请输入有效的数字");
					// 清除模板
					$(".replay-det").remove();
				} else {
					if(applyamt % 1 != 0) {
						this.closeLoad();
						return this.popup("申请金额只能为整数");
					}
					applyamt = parseInt(applyamt);
					$(".input-apply input").val(applyamt);
					if(applyamt >= this.limitMin && applyamt <= this.limitMax) {
						$.proxy(callBack,this)(applyamt);
					} else {
						this.closeLoad();
						this.popup("最低" + this.limitMin + "元，最高" + this.limitMax + "元");
						// 清除模板
						$(".replay-det").remove();
					}
				}
			} else {
				// 清除模板
				$(".replay-det").remove();
			}
		},
		// 回显函数
		showHty : function() {
			var _this = this,p = $("#productno").val(),n = $("#applamtNum").val();
			if(p != "") {
				$(".cycle-part-con span").each(function() {
					if($(this).data("productno") == p) {
						$(this).addClass("selected").siblings().removeClass("selected");
						if(n != "") {
							_this.ajaxDate(p);
						}
					}
				})
			}
		},
		// 提交
		subDate : function() {
			var _this = this;
			// 点击立即申请，判断申请金额和申请周期
			$(".next-step").on("tap", function() {
				// 判断输入框是否是数字
				var muchM = $(".input-apply input").val();
				var applyamt = Number(muchM);
				if(muchM == "") {
					return _this.popup("请输入申请金额");
				}
				if(applyamt.toString() == "NaN") {
					return _this.popup("请输入有效的数字");
				}
				// 是数字，判断输入范围
				if(applyamt < _this.limitMin || applyamt > _this.limitMax) {
					return _this.popup("最低" + _this.limitMin + "元，最高" + _this.limitMax + "元");
				}
				// 判断是否选择类型
				if($(".cycle-part-con").children().length == 0) {
					return _this.getChoseList();
				}
				if($(".selected").length == 0) {
					return _this.popup("请选择申请周期");
				}
				if($('.replay-det').length == 0) {
					return _this.popup("再等一等");
				}
				if($(".replay-det").data('much') != applyamt) {
					return _this.popup("再等一等");
				}

				// 周期数periods
				$("#period").val($(".selected").data("period"));
				// productno
				$("#productno").val($(".selected").data("productno"));
				// lenunit
				$("#lenunit").val($(".selected").data("lenunit"));
				$(".next-step").addClass("disabled").html("正在提交请稍后...");
				_this.dataStr = _this.dataStr +"|"+ $("#applyamt").val();
				console.log(_this.dataStr);
				plus.storage.setItem("dataStr",_this.dataStr);
				var w = plus.webview.create( "./../html/applyLoan.html" );
				showLoad();
				w.show();
			});
		},
		// 还款明细模板
		detTemplate : function(payData) {
			var compiled = _.template($("#tpl").text());
			return compiled(payData);
		},
		// 弹窗提示
		popup : function(p) {
			$(".popup p").html(p);
			$(".popup").show();
		},
	}
	Trial.initialize();
})