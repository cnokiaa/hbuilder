define([
'zepto',
'IScroll',
'utils',
'touch'
], function($,Utils) {
	var touchend = 'ontouchstart' in document ? 'touchend' : 'click';
	var touchstart = 'ontouchstart' in document ? 'touchstart' : 'click';
	var tap = 'ontouchstart' in document ? 'tap' : 'click';
	var ApplyLoan = {
		// 初始化
		initialize : function() {
			this.ls = window.sessionStorage;
			if(!this.ls.getItem('sendMsgTimes')) {
				this.ls.setItem('sendMsgTimes', 0);
			}
			var dataStr = plus.storage.getItem("dataStr").split("|");
			console.log(dataStr);
			$(".accountMoney").html(dataStr[1]);
			$(".applyamt").html(dataStr[4]);
			$("#relnameShow").val(plus.storage.getItem("relname"));
			$("#bankCardNumShow").val(plus.storage.getItem("bankcardnum"));
			$('.bankcard').html(this.returnBankCardStr($("#bankCardNumShow").val()));
			$('.username').html(this.returnNameStr($("#relnameShow").val()));
			this.getCountdown();
			// 如果有错误提示则显示
			if($(".errmsgShow").val() != "" && $(".errmsgShow").length != 0) {
				this.popup($(".errmsgShow").val());
			}
			this.initEvent();
		},
		// 初始化事件
		initEvent : function() {
			// 禁止输入法go和“前往”强制提交
			$("input").on("keydown", function(event) {
				var keyCode = event.keyCode|| event.which;
				if(keyCode == 13) {
					return false;
				}
			});
			// 弹窗取消关闭弹窗
			$(".popup-con").on(touchend, "div", function() {
				if(!$('.popup').hasClass('popup-type2')) {
					$(".popup").hide();
				}
			});
			$(".popup-con").on(touchend, "b", function() {
				$(".popup").hide();
			});
			$(".popup").on(touchstart,function(e) {
				if(e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
			});
			// 复选框选择
			$(".agreement").on("tap", 'i',function() {
				$(this).parent().toggleClass("disagree");
			});
			$(".agreement").on("tap", 'span', function() {
				setTimeout(function() {
					$(".agreement-list").show();
				}, 400);
			});
			$(".agreement-list").on("tap", function(e) {
				if($(e.target).hasClass("agreement-list") == true) {
					$(".agreement-list").hide();
				}
			});
			$(".agreement-list").on("touchstart",function(e) {
				if(e.target.tagName != "A") {
					if(e.preventDefault) {
						e.preventDefault();
					} else {
						e.returnValue = false;
					}
				}
			});
			this.sendMsg();
			this.subData();
		},
		// 获取名字脱敏字符串
		returnNameStr : function(name) {
			var stars = '';
			for(var i = 1; i < name.length; i++) {
				stars += '*';
			}
			return stars + name.substr(-1,1);
		},
		// 返回脱敏字符串
		returnBankCardStr : function(str) {
			return str.substr(0,6) + '******' + str.substr(-4,4);
		},
		// 本地存储控制倒计时
		getCountdown : function() {
			var _this = this;
			if(this.ls.getItem("countdownTime") || this.ls.getItem("countdownTime") == "") {
				var t = this.ls.getItem("countdownTime");
				if(t != "") {
					var num = 60 - Math.ceil(((new Date).getTime() - t)/ 1000);
					if(num <= 0) {
						this.resetCountdown();
					} else {
						$(".settime").html(num + "s").show();
						$(".send").hide();
						var timer = setInterval(function() {
							num--;
							$(".settime").html(num + "s");
							if(num == 0) {
								$(".settime").hide().html("59s").siblings(".send").show();
								clearInterval(timer);
								_this.resetCountdown();
							}
						}, 1000)
					}
				}
			} else {
				this.ls.setItem("countdownTime", "");
			}
		},
		setCountdown : function() {
			this.ls.setItem("countdownTime", (new Date()).getTime());
		},
		resetCountdown : function() {
			this.ls.setItem("countdownTime", "");
		},
		// 弹窗提示
		popup : function(p,type) {
			$(".popup").removeClass('popup-type2');
			if(type == 2) {
				$(".popup").addClass('popup-type2');
			}
			$(".popup p").html(p);
			$(".popup").show();
		},
		// 发送信息
		sendMsg : function() {
			var _this = this;
			// 点击发送验证码进行手机号验证
			$(".send").on(tap, function() {
				var timer = null;
				var num = 59;
				var mobileNumber = $("#userMobile").val();
				if(mobileNumber != "") {
					/*if(!Utils.regPhone(mobileNumber)) {
						_this.popup("请输入正确的手机号");
					} else {*/
						// 本地存储状态
						_this.setCountdown();
						_this.ls.setItem('sendMsgTimes', 1);
						$(this).hide().siblings(".settime").show();
						/*var urla = common.baseUrl + "shanyin/application/send/smsVerifyCode";
						$.ajax({
							type : "POST",
							url : urla,
							data: JSON.stringify({mobile:mobileNumber,openid:$("input[name='openid']").val()}),
							contentType: "application/json"
						});*/
						timer = setInterval(function() {
							num--;
							$(".settime").html(num + "s");
							if(num <= 0) {
								$(".settime").hide().html("59s").siblings(".send").show();
								clearInterval(timer);
								num = 59;
							}
						}, 1000);
					//}
				} else {
					_this.popup("手机号不能为空");
				}
			});
		},
		// 提交
		subData : function() {
			var _this = this;
			$(".next-step").on(touchend, function() {
				if(!$(this).hasClass('disabled')) {
					var getcode = $("#verification").val();
					var userTel = $("#userMobile").val();
					if(userTel == "") {
						return _this.popup("请输入手机号");
					}
					if(userTel.match(/^1([38]\d|4[567]|5(?!4)\d|7[01678])\d{8}$/g) == null) {
						return _this.popup("请输入正确的手机号")
					}
					// 提示发送短信
					if(_this.ls.getItem('sendMsgTimes') == 0) {
						if($('.send').css('display') == 'block') {
							return _this.popup('请发送验证码');
						}
					}
					if(getcode == "") {
						return _this.popup("请输入验证码");
					}
					if(getcode.length != 6) {
						return _this.popup("请输入正确的验证码");
					}
					if($('.agreement').hasClass('disagree')) {
						return _this.popup("请阅读并同意《拉卡拉“易分期”借贷相关协议》");
					}
					if($('#userid').val() != '') {
						$(".next-step").addClass("disabled").html("正在提交，请稍等...");
						var w = plus.webview.create( "./../html/success.html" );
						showLoad();
						setTimeout(function() {
							w.show();
						},100);
					} else {
						$.ajax({
							type : "POST",
							url : '/credit-loan-app-shanyin/user/application/verify/UserMobile',
							data: JSON.stringify({mobile:userTel}),
							contentType: "application/json",
							success : function(data) {
								if(data.status == 'success') {
									$('#userid').val(data.userid);
									$(".next-step").addClass("disabled").html("正在提交，请稍等...");
									setTimeout(function() {
										$("form")[0].submit();
									},100);
								} else {
									_this.popup(data.errmsg);
								}
							},
							error : function() {
								_this.popup("请求失败，请重试！");
							}
						});
					}
				}
			})
		}
	}
	ApplyLoan.initialize();
})