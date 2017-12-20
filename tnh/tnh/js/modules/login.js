define([
'zepto',
'touch',
'utils',
'fx',
'fx_methods'
], function($,utils) {
	var loginE = {
		// 初始化
		initialize : function() {
			var _this = this;
			this.ls = window.sessionStorage;
			if(!this.ls.getItem('sendMsgTimes')) {
				this.ls.setItem('sendMsgTimes', 0);
			}
			this.getCountdown();
			// 如果有错误提示则显示
			if($(".errmsgShow").val() != "" && $(".errmsgShow").length != 0) {
				this.popup($(".errmsgShow").val());
			}
			// 禁止输入法go和“前往”强制提交
			$("input").on("keydown", function() {
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
		// 弹窗提示
		popup : function(p) {
			$(".popup p").html(p);
			$(".popup").show();
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
								$(".settime").hide().html("60s后重发").siblings(".send").show();
								clearInterval(timer);
								_this.resetCountdown();
							}
						}, 1000)
					}
				}
			} else {
				this.ls.setItem("countdownTime", "");$(".send").removeClass("db");
			}
		},
		setCountdown : function() {
			this.ls.setItem("countdownTime", (new Date()).getTime());
		},
		resetCountdown : function() {
			this.ls.setItem("countdownTime", "");$(".send").removeClass("db");
		},
		// 发送信息
		sendMsg : function() {
			var _this = this;
			// 点击发送验证码进行手机号验证
			$(".send").on("tap", function() {
				var timer = null;
				var num = 60;
				var mobileNumber = $("#reservePhone").val();
				if(mobileNumber != "") {
					if(!Utils.regPhone(mobileNumber)) {
						_this.popup("请输入正确的手机号");
					} else {
						if(!$(".send").hasClass("db")){
							$(".send").addClass("db");
							// 本地存储状态
							_this.setCountdown();
							_this.ls.setItem('sendMsgTimes', 1);

							$(this).hide().siblings(".settime").show();
							var urla = "/";
							console.log(1);
							/*$.ajax({
								type : "POST",
								url : urla,
								data: JSON.stringify({mobile:mobileNumber}),
								contentType: "application/json"
							});*/
							timer = setInterval(function() {
								num--;
								$(".settime").html(num + "s后重发");
								if(num <= 0) {
									$(".settime").hide().html("60s后重发").siblings(".send").show();
									clearInterval(timer);
									num = 60;
								}
							}, 1000);
						}
					}
				} else {
					_this.popup("手机号不能为空");
				}
			});
		},
		// 校验是否已激活
		activated : function() {
			var $this = this;
			$.ajax({
				type : 'post',
				url : '',
				data : JSON.stringify({mobile : $('#reservePhone').val()}),
				contentType: "application/json",
				success : function(data) {
					if(data.status == 'success') {
						if(data.errorType == '1') {
							$('.next-step').removeClass("disabled").html("立即申请");
							$this.popup(data.errmsg, 2);
						} else {
							setTimeout(function() {
								$('form')[0].submit();
							},100);
						}
					} else {
						$('.next-step').removeClass("disabled").html("立即申请");
						$this.popup(data.errmsg);
					}
				},
				error : function() {
					$('.next-step').removeClass("disabled").html("下立即申请");
					$this.popup('请求失败,请重试');
				}
			})
		},
		// 提交
		subData : function() {
			var _this = this;
			// 如果信息完整才能提交
			$(".sub").on("tap", function() {
				// 校验
				if($('#reservePhone').val() == '') {
					return _this.popup("请输入手机号");
				} else if(!Utils.regPhone($('#reservePhone').val())) {
					return _this.popup("请输入正确的手机号");
				}
				// 提示发送短信
				if(_this.ls.getItem('sendMsgTimes') == 0) {
					if($('.send').css('display') == 'block') {
						return _this.popup('请发送验证码');
					}
				}
				if($('.ver-code').val() == '') {
					return _this.popup("请输入验证码");
				} else if($('.ver-code').val().length != 6) {
					return _this.popup("请输入正确的验证码");
				}
				// 提交
				if(!$(this).hasClass("disabled")) {
					_this.resetCountdown();
					_this.ls.setItem('sendMsgTimes', 0);
					$('.send').show().siblings(".settime").hide();
					$(this).addClass("disabled").html("正在提交，请稍等...");
					_this.activated();
				}
			})
		}
	}
	return loginE;
});