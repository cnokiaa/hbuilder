define([
'zepto',
'utils',
'touch',
], function($,Utils) {
	var ApplyLoan = {
		// 初始化
		initialize : function() {
			this.ls = window.sessionStorage;
			this.getCountdown();
			// 如果有错误提示则显示
			if($(".errmsgShow").val() != "" && $(".errmsgShow").length != 0) {
				popup($(".errmsgShow").val());
			}
			$('.creditcard').html(this.returnBankCardStr($('#creditcardShow').val()));
			$('.bankcard').html(this.returnBankCardStr($('#bankcardShow').val()));
			this.initEvent();
			$(".agreement").on("touchstart", 'i',function() {
				$(this).parent().toggleClass("disagree");
			});
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
			$(".popup-con").on("touchend", "div", function() {
				if(!$('.popup').hasClass('popup-type2')) {
					$(".popup").hide();
				}
			});
			$(".popup-con").on("touchend", "b", function() {
				$(".popup").hide();
			});
			$(".popup").on("touchstart",function(e) {
				if(e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
			});
			this.sendMsg();
			this.subData();
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
						$(".settime").html(num + "s后重发").show();
						$(".send").hide();
						var timer = setInterval(function() {
							num--;
							$(".settime").html(num + "s后重发");
							if(num == 0) {
								$(".settime").hide().html("59s后重发").siblings(".send").show();
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
		// 发送信息
		sendMsg : function() {
			var _this = this;
			// 点击发送验证码进行手机号验证
			$(".send").on("tap", function() {
				var timer = null;
				var num = 59;
				var mobileNumber = $("#userMobile").val();
				if(mobileNumber != "") {
					if(!Utils.regPhone(mobileNumber)) {
						popup("请输入正确的手机号");
					} else {
						// 本地存储状态
						_this.setCountdown();

						$(this).hide().siblings(".settime").show();
						var urla = "hdw/application/send/smsVerifyCode";
						$.ajax({
							type : "POST",
							url : urla,
							data: JSON.stringify({mobile:mobileNumber,openid:$("input[name='openid']").val()}),
							contentType: "application/json"
						});
						timer = setInterval(function() {
							num--;
							$(".settime").html(num + "s后重发");
							if(num <= 0) {
								$(".settime").hide().html("59s后重发").siblings(".send").show();
								clearInterval(timer);
								num = 59;
							}
						}, 1000);
					}
				} else {
					popup("手机号不能为空");
				}
			});
		},
		// 提交
		subData : function() {
			var _this = this;
			$(".next-step").on("click", function() {
				if(!$(this).hasClass('disabled')) {
					//$(this).unbind("click");
					var getcode = $("#verification").val();
					var userTel = $("#userMobile").val();
					if(userTel == "") {
						return popup("请输入手机号");
					}
					if(userTel.match(/^1([38]\d|4[567]|5(?!4)\d|7[01678])\d{8}$/g) == null) {
						return popup("请输入正确的手机号")
					}
					if(getcode == "") {
						return popup("请输入验证码");
					}
					if(getcode.length != 6) {
						return popup("请输入正确的验证码");
					}
					if($('.agreement').hasClass('disagree')) {
						return popup("请阅读并同意《拉卡拉“替你还”服务协议》");
					}
					//if($('#userid').val() != '') {
						$(".next-step").addClass("disabled").html("正在提交，请稍等...");
						openView("success");
					/*} else {
						$.ajax({
							type : "POST",
							url : 'user/application/verify/UserMobile',
							data: JSON.stringify({mobile:userTel}),
							contentType: "application/json",
							success : function(data) {
								if(data.status == 'success') {
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
					}*/
				}
			})
		}
	}
	ApplyLoan.initialize();
})