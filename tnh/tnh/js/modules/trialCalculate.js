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
			// 控制弹窗队列执行
			this.alertArr = [];
			this.canSub = false;
			// openid
			this.openid = $("#openid").val();
			// 禁止输入法go和“前往”强制提交
			$("input").on("keydown", function() {
				var keyCode = event.keyCode|| event.which;
				if(keyCode == 13) {
					return false;
				}
			});
			this.openUrl();
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
//			this.checkMyLimi();
			// 给选择列表绑定点击事件
			this.choseCycle();
			this.showClearBtn();
			// 失焦事件绑定
			this.inputBlur();
			// 申请点击事件
			this.subDate();
			if($(".errmsgShow").val() != "" && $(".errmsgShow").length != 0) {
				return popup($(".errmsgShow").val());
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
			this.more();
			this.signOut();
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
		openUrl : function() {
			$(".application-record").on("tap",function(){
				openView("record");
			});
			$(".usemoney").on("tap",function(){console.log("123");
				openView("myRedPack");
			});
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
		// 退出
		signOut : function() {
			var $this = this;
			$('header').on('touchend', '.connect-con i', function() {
				var uuid = $('#uuid').val();
				$.ajax({
					type : "post",
					url : "hdw/application/unbind/channeluser",
					data: JSON.stringify({uuid:uuid}),
					contentType: "application/json",
					dataType : "json",
					success : function(data) {
						if(data.status == 'success') {
							// 结构变化
							$('.connect').remove();
							$('header').append('<a href="" class="no-connect">业务说明</a>');
						} else {
							return popup(data.errmsg);
						}
					},
					error : function() {
						return popup('请求失败');
					}
				})
			});
		},
		// 查询个人可用借款额度
		/*checkMyLimi : function() {
			var $this = this;
			$(".loading").show();
			$.ajax({
				type : 'get',
				url : 'hdw/application/query/userLimitInfo',
				dataType : 'json',
				success : function(data) {
					$(".loading").hide();
					if(data.status == 'success') {
						$this.tarLimit = data.data.tarLimit;
						if($this.limitMax) {
							$this.limitMax = $this.tarLimit ? Math.min($this.tarLimit, $this.limitMax) : $this.limitMax;
							$('.input-apply input').attr('placeholder','最低' + $this.limitMin + '元，最高' + $this.limitMax + '元');
						}
						if(data.data.tarLimit != 0) {
							$('.quota-tip').html('您当前可用借款额度' + data.data.tarLimit + '元').show();
						}
					} else {
						$('.quota-tip').hide();
						$this.popup(data.errmsg);
					}
				},
				error : function() {
					$(".loading").hide();
					$this.popup('查询个人额度失败！')
				}
			})
		},*/
		// 请求周期列表
		getChoseList : function() {
			var _this = this;
			closeLoad();
			$.ajax({
				//type : "post",
				type : "get",
				url : "../json/product.json",
				//data: JSON.stringify({openid:this.openid, platform:this.deviceType}),
				contentType: "application/json",
				dataType : "json",
				success : function(data) {
					if(data.status == "success") {
						var rateDate = data.data.ratelist;
						var str = "";
						_this.limitMax = _this.tarLimit ? Math.min(_this.tarLimit,data.data.hiappamt) : data.data.hiappamt;
						_this.limitMin = data.data.lowappamt;
						$('.input-apply input').attr('placeholder','最低' + _this.limitMin + '元，最高' + _this.limitMax + '元');
						for(var i = 0; i < rateDate.length; i++) {
							var muchNum = rateDate[i].periods,
								type = rateDate[i].productno,
								numUnit = rateDate[i].lenunit,
								lenunit = rateDate[i].lenunit,
								rate = rateDate[i].rate,
								periodlen = rateDate[i].periodlen;
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
							str += '<span data-productno="' + type + '" data-period="' + muchNum + '" data-rate="' + rate + '" data-periodlen="' + periodlen + '" data-lenunit="' + lenunit + '">' + muchNum + numUnit +'</span>';
						}
						str = '<div class="cycle-part-con clearfix">' + str + '</div>';
						$(".cycle-part").html(str);
						_this.showHty();
						$(".cycle").show();
					} else {
						return popup(data.errmsg);
					}
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
				$("#period").val($(".selected").attr("data-period"));
				// productno
				$("#productno").val($(".selected").attr("data-productno"));
				_this.runAjax();
			});
		},
		runAjax : function() {
			var muchM = $(".input-apply input").val();
			if(muchM != "") {
				var productno = $(".selected").attr("data-productno"),
					periodData = $(".selected").attr("data-period"),
					rate = $(".selected").attr("data-rate"),
					periodlen = $(".selected").attr("data-periodlen"),
					lenunit = $(".selected").attr("data-lenunit");
				this.ajaxDate(productno);
			}
		},
		// 请求详细列表
		ajaxDate : function(productno) {
			this.BeforeAjaxPublic(function(applyamt) {
				var _this = this;
				this.canSub = false;
				showLoad();
				//$(".loading").show();
				$.ajax({
					//type : "POST",
					type : "get",
					url : "../json/plan.json",
					//data: JSON.stringify({productno: productno, applyamt : applyamt}),
					contentType: "application/json",
					dataType : "json",
					success : function(data) {
						closeLoad()
						//$(".loading").hide();
						if(data.status == "success") {
							_this.canSub = true;
							// 手续费
							var timeFree = data.data.oneOffPayment,
							// 到账金额
								ownMoney = data.data.accountMoney,
							// 月还款额
								monthTotalMoney = data.data.eachMoney;
                            //还款时间
							var dueTime=data.data.dueTime;
							//一次性服务费
							var oneMoney = data.data.oneMoney,
							//红包抵扣金额
								freeMoney = data.data.freeMoney,
							//一次性还款金额
								payMent = data.data.payMent;


							var dataTem = {
								// 一次性服务费
								timeFree : timeFree,
								// 到账金额
								ownMoney : ownMoney,
								// 每期还款
								monthTotalMoney : monthTotalMoney,
								// 每月还款日
								dueTime : dueTime,
								//一次性服务费
								oneMoney : oneMoney,
							   	//红包抵扣金额
								freeMoney : freeMoney,
								//一次性还款金额
								payMent : payMent
							}
							// 插入模板
							var tpl = _this.detTemplate(dataTem);
							/*if($(".repay-det").length != 0) {
								$(".repay-det").remove();
							}*/
							if($('.replay-det').length != 0) {
								$('.replay-det,.usemoney').remove();
							}
							$(".apply-cycle").append(tpl);
							_this.openUrl();
						} else {
							_this.canSub = false;
							return popup(data.errmsg);
						}
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
						var productno = $(".selected").attr("data-productno"),
							periodData = $(".selected").attr("data-period"),
							rate = $(".selected").attr("data-rate"),
							periodlen = $(".selected").attr("data-periodlen"),
							lenunit = $(".selected").attr("data-lenunit");
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
					popup("请输入有效的数字");
					// 清除模板
					$(".replay-det,.usemoney").remove();
				} else {
					if(applyamt % 1 != 0) {
						popup("申请金额只能为整数");
						applyamt = parseInt(applyamt);
						$(".part-con input").val(applyamt);
					}
					if(applyamt >= this.limitMin && applyamt <= this.limitMax) {
						$.proxy(callBack,this)(applyamt);
					} else {
						popup("最低" + this.limitMin + "元，最高" + this.limitMax + "元");
						// 清除模板
						$(".replay-det,.usemoney").remove();
					}
				}
			} else {
				popup("请填写金额");
				// 清除模板
				$(".replay-det,.usemoney").remove();
			}
		},
		// 回显函数
		showHty : function() {
			var _this = this,p = $("#productno").val(),n = $("#applamtNum").val();
			if(p != "") {
				$(".cycle-part-con span").each(function() {
					if($(this).attr("data-productno") == p) {
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
					return popup("请输入申请金额");
				} else {
					if(applyamt.toString() == "NaN") {
						return popup("请输入有效的数字");
					} else {
						// 是数字，判断输入范围
						if(applyamt < _this.limitMin || applyamt > _this.limitMax) {
							return popup("最低" + _this.limitMin + "元，最高" + _this.limitMax + "元");
						} else {
							// 判断是否选择类型
							if($(".cycle-part-con").children().length == 0) {
								_this.getChoseList();
							} else {
								if($(".selected").length == 0) {
									return popup("请选择申请周期");
								} else {
									if(_this.canSub) {
										// 周期数periods
										$("#period").val($(".selected").attr("data-period"));
										// productno
										$("#productno").val($(".selected").attr("data-productno"));
										// lenunit
										$("#lenunit").val($(".selected").attr("data-lenunit"));
										$(".next-step").addClass("disabled").html("正在提交请稍后...");
										openView("uploadImages");
									} else {
										return popup("再等一等");
									}
								}
							}
						}
					}
				}
			});
		},
		// 还款明细模板
		detTemplate : function(payData) {
			var compiled = _.template($("#tpl").text());
			return compiled(payData);
		}
	}
	Trial.initialize();
})