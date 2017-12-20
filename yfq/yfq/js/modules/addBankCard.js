define([
'zepto',
'utils',
'IScroll',
'touch'
], function($,Utils,IScroll) {
	var AddBank = {
		// 初始化
		initialize : function() {
			var _this = this;
			showLoad();
			$("#relname").val(plus.storage.getItem("relname"));
			closeLoad();
			// 如果有错误提示则显示
			if($(".errmsgShow").val() != "" && $(".errmsgShow").length != 0) {
				this.popup($(".errmsgShow").val());
			}
			// 名字脱敏
			$('.bankusernme').html(this.returnNameStr($('#relname').val()));
			// 初始化事件
			this.initEvent();
			// 滚动组件
			this.myScroll = null;
			this.historyScroll = null;
			// 请求单列表数据，并给所有的单列表绑定相应的事件得到列表内容
			$(".single-list").each(function() {
				var targetId = $(this).attr("id");
				targetId = "#" + targetId;
				_this.aloneList(targetId);
			});
			// 查询银行卡历史记录
			this.lookHistory();
		},
		// 弹窗提示
		popup : function(p) {
			$(".popup p").html(p);
			$(".popup").show();
		},
		// 初始相关事件
		initEvent : function() {
			var _this = this;
			this.aboutStars();
			// 禁止输入法go和“前往”强制提交
			$("input").on("keydown", function() {
				var keyCode = event.keyCode|| event.which;
				if(keyCode == 13) {
					return false;
				}
			});
			// 弹窗取消关闭弹窗
			$(".popup-con").on("touchend", "div", function() {
				$(".popup").hide();
			});
			$(".popup,.banklist").on("touchstart",function(e) {
				if(e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
			});
			// 点击列表
			$(".iscroll").on("tap", "li", function() {
				var controlTarget = $(".iscroll").data("nowControl");
				var preTarget = $(controlTarget).siblings("input");
				if(preTarget.length != 0) {
					preTarget.val($(this).text())
				}
				$(controlTarget).val($(this).attr("data-sub")).siblings(".cover-input").html($(this).text()).addClass("cover");
				$(".iscroll").hide();
			});
			$(".iscroll").on("tap", function(e) {
				if($(e.target).hasClass("iscroll") == true) {
					$(".iscroll").hide();
				}
			});
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
			var stars = '';
			for(var i = 0; i < str.length-8; i++) {
				stars += '*';
			}
			return str.substr(0,4) + stars + str.substr(-4,4);
		},
		// 脱敏相关
		aboutStars : function() {
			var $this = this;
			// 脱敏信息回显
			if($('#bankcardnumShow').val() != '') {
				$('#bankcardnum').val(this.returnBankCardStr($('#bankcardnumShow').val()));
			}
			$('#bankcardnum').on('focus', function() {
				if($('#bankcardnumShow').val() != '' && /\*/g.test($(this).val())) {
					$(this).val('');
				}
			});
			$('#bankcardnum').on('blur', function() {
				if($('#bankcardnumhow').val() != '' && $(this).val() == '') {
					$('#bankcardnum').val($this.returnBankCardStr($('#bankcardnumShow').val()));
				}
			});
		},
		// 历史记录查询
		lookHistory : function() {
			var _this = this;
			$(".his-pan").on("tap", "li", function() {
				$(this).addClass("chosed").siblings().removeClass("chosed");
			})
			$(".subbank").on("tap", "h2 span", function() {
				_this.getHistoryList();
			});
			// 取消功能
			$(".banklist-btn").on("touchend", "span", function() {
				$(".banklist").hide();
			});
			// 确定功能
			$(".banklist-btn").on("touchend", "em", function() {
				var t = $("#bank-his .chosed"),
					c = t.attr("data-code"),
					n = t.attr("data-n"),
					num = t.attr("data-c");
				if(t.length != 0) {
					$(".banklist").hide();
					$("#debitbank").val(c).siblings('input').val(n).siblings(".cover-input").html(n).addClass("cover");
					$("#bankcardnum").val(_this.returnBankCardStr(num));
					$('#bankcardnumShow').val(num);
				} else {
					$(".banklist").hide();
					_this.popup('请选择银行卡！');
				}
			});
		},
		// 请求并初始化历史记录表
		getHistoryList : function() {
			var _this = this;
			var certNo = $('#certNo').val();
			var openid = $('#openid').val();
			$.ajax({
			    type : "POST",
			    url : "/credit-loan-wx-yfq/neworder/application/history/bankCard",
			    data : JSON.stringify({certNo : certNo,openid:openid}),
			    contentType: "application/json",
				dataType : "json",
				success : function(data) {
					if(data.status == "success") {
						var list = data.data.banks,str = "";
						if(list.length != 0) {
							for(var i = 0; i < list.length; i++) {
								str += '<li data-code="'+ list[i].bankcode +'" data-n="' + list[i].bankname  + '" data-c="' + list[i].bankcard + '"><p>' + list[i].bankname + '（' + _this.returnBankCardStr(list[i].bankcard) + '）</p><span></span></li>';
							}
							$("#bank-his ul").html(str);
							$(".banklist").show();
							if(_this.historyScroll) {
								_this.historyScroll.refresh();
							} else {
								_this.historyScroll = new IScroll('#banlpan');
							}
						} else {
							_this.popup("暂无可用银行卡");
						}
					} else {
						_this.popup(data.errmsg);
					}
				},
				error : function() {
					_this.popup("请求数据失败");
				}
			})
		},
		// 单列表
		aloneList : function(targetId) {
			var _this = this;
			// 单列表回显内容样式控制
			var preTarget = $(targetId).siblings("input");
			var preVal = preTarget.val();
			if(preVal != "" && preTarget.length != 0) {
				$(targetId).siblings(".cover-input").html(preVal).addClass("cover");
			}

			$(targetId).siblings(".cover-input").on("tap", function() {
				showLoad();
				var cardType = {
					businessType : 'BID'
				}
				if(targetId == '#creditbank') {
					cardType.creditCard = '1';
				}
				if(targetId == '#debitbank') {
					cardType.creditCard = '0';
				}
				$.ajax({
					type : "GET",
					//url : common.baseUrl + "universal/application/query/debitBankList",
					url : "../js/debitBankList.json",
					//data: JSON.stringify({creditCard:cardType.creditCard,businessType:cardType.businessType}),
					contentType: "application/json",
					dataType : "json",
					success : function(data) {
						if(data.status == 'success') {
							$("input").blur();
							$(".iscroll").data("nowControl", targetId);
							var dataArr = data.data.retData;
							// 获取列表项内的Key
							var dataInfoKey = [];
							for(var key in dataArr[0]) {
								dataInfoKey.push(key);
							}
							var dataId = "";
							var dataCn = "";
							for(var i = 0; i < dataInfoKey.length; i++) {
								if(dataInfoKey[i].match(/.*(code|id)$/gi) != null) {
									dataId = dataInfoKey[i];
								}
								if(dataInfoKey[i].match(/.*(name|cn)$/gi) != null) {
									dataCn = dataInfoKey[i];
								}
							}
							var str = "";
							for(var i = 0; i < dataArr.length; i++) {
								str += '<li data-sub="' + dataArr[i][dataId] + '">' + dataArr[i][dataCn] + '</li>';
							}
							$("#scroller ul").html(str);
							// 组件出现
							$(".iscroll").show();
							if(_this.myScroll) {
								_this.myScroll.refresh();
								_this.myScroll.scrollTo(0,0);
							} else {
								_this.myScroll = new IScroll('#wrapper');
							}
						} else {
							_this.popup(data.errmsg);
						}
						closeLoad();
					}
				});
			})
		},
		// 提交
		subData : function() {
			var _this = this;
			// 如果信息完整才能提交
			$(".next-step").on("tap", function() {

				if($("#debitbank").val() == "" || $("#debitbank").siblings('input').val() == '') {
					return _this.popup("请选择储蓄卡开户行");
				}
				
				if($("#bankcardnum").val() == "") {
					return _this.popup("请输入储蓄卡卡号");
				}
				if($("#bankcardnumShow").val() != '') {
					if(/\*/.test($("#bankcardnum").val())) {
						if(_this.returnBankCardStr($("#bankcardnumShow").val()) != $("#bankcardnum").val()) {
							return _this.popup("请填写正确的储蓄卡卡号");
						}
					} else {
						if(!/^\d{12,20}$/.test($("#bankcardnum").val())) {
							return _this.popup("请填写正确的储蓄卡卡号");
						} else {
							$("#bankcardnumShow").val($("#bankcardnum").val());
						}
					}
				} else {
					if(!/^\d{12,20}$/.test($("#bankcardnum").val())) {
						return _this.popup("请填写正确的储蓄卡卡号");
					} else {
						$("#bankcardnumShow").val($("#bankcardnum").val());
					}
				}
				
				if(!$(this).hasClass("disabled")) {
					$(this).addClass("disabled").html("正在提交，请稍等...");
					plus.storage.setItem("bankcardnum",$('#bankcardnumShow').val());
					var w = plus.webview.create( "./../html/trialCalculate.html" );
					showLoad();
					w.show(); // 显示窗口
				}
			})
		},
	}
	AddBank.initialize();
})