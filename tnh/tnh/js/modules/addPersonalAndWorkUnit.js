define([
'zepto',
'underscore',
'IScroll',
'utils',
'touch',
], function($,_,IScroll,Utils) {
	var AddInf = {
		// 初始化
		initialize : function() {
			var $this = this;
			this.inputEvent();
			this.showData();
			// 如果有错误提示则显示
			if($(".errmsgShow").val() != "" && $(".errmsgShow").length != 0) {
				popup($(".errmsgShow").val());
			}
			// 弹窗层取消隐藏
			$(".popup-con").on("tap", "div",function() {
				$(".popup").hide();
			})
			$(".popup").on("tap",function(e) {
				if(e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
			});
			// 确保真实信息
			$(".agree-btn").on("tap", function() {
				$(this).toggleClass("noagree")
			});
			// 回显电话
			this.showTel();
			// 存储用户选择的地址
			var userProvinceCn = "";
			var userProvinceId = "";
			var userCityCn = "";
			var userCityId = "";
			var userAreaCn = "";
			var userAreaId = "";

			var myScroll = null;
			$(".iscroll").data("address", false);
			$(".iscroll").on("tap", "li", function() {
				var _this = $(this);
				$(this).addClass("iscroll-chosed").siblings().removeClass("iscroll-chosed");
				// 如果此时不是地址栏则直接渐变
				if($(".iscroll").data("address") == false) {
					var controlTarget = $(".iscroll").data("nowControl");
					var preTarget = $(controlTarget).siblings("input");
					if(preTarget.length != 0) {
						preTarget.val($(this).text())
					}
					$(controlTarget).val($(this).attr("data-sub")).siblings(".cover-input").html($(this).text()).addClass("cover");
					$(".iscroll").hide();
					$("#wrapper").off();
					myScroll = null;
				} else {
					if($(".iscroll").data("ajaxStatus") == 1) {
						$("#wrapper").off();
						myScroll = null;
						userProvinceCn = _this.text();
						userProvinceId = _this.attr("data-sub");
						getCity(_this.attr("data-sub"));
					}
					if($(".iscroll").data("ajaxStatus") == 2) {
						$("#wrapper").off();
						myScroll = null;
						userCityCn = _this.text();
						userCityId = _this.attr("data-sub");
						getArea(_this.attr("data-sub"));
					}
					if($(".iscroll").data("ajaxStatus") == 3) {
						$(".iscroll").data("ajaxStatus", 0)
						userAreaCn = _this.text();
						userAreaId = _this.attr("data-sub");
						var placeCn = userProvinceCn + "|" + userCityCn +"|" + userAreaCn;
						var placeCode = userProvinceId + "|" + userCityId +"|" + userAreaId;
						var nowControl = $(".iscroll").data("nowControl");
						$(nowControl).val(placeCode).siblings("input").val(placeCn).siblings(".cover-input").html(placeCn).addClass("cover");
						$(".iscroll").hide();
						$("#wrapper").off();
						myScroll = null;
					}
				}
			});
			$(".iscroll").on("tap", function(e) {
				if($(e.target).hasClass("iscroll") == true) {
					$(".iscroll").data("ajaxStatus", 0);
					$(".iscroll").hide();
					$("#wrapper").off();
					myScroll = null;
					// 重置地址信息
					userProvinceCn = "";
					userProvinceId = "";
					userCityCn = "";
					userCityId = "";
					userAreaCn = "";
					userAreaId = "";
				}
			});
			// 请求单列表数据，并给所有的单列表绑定相应的事件得到列表内容
			$(".single-list").each(function() {
				var targetId = $(this).attr("id");
				targetId = "#" + targetId;
				aloneList(targetId);
			});
			function aloneList(targetId) {
				// 单列表回显内容样式控制
				var preTarget = $(targetId).siblings("input");
				var preVal = preTarget.val();
				if(preVal != "" && preTarget.length != 0) {
					$(targetId).siblings(".cover-input").html(preVal).addClass("cover");
				}

				$(targetId).siblings(".cover-input").on("tap", function() {
					showLoad();
					$(".iscroll").data("address", false);
					//var dataUrl = common.baseUrl + "universal/application/query/" + $(targetId).attr("data-aj");
					var dataUrl = "../json/contactRelationList.json";
					$.get(dataUrl, function(data) {
						if(data.status == "success") {
							$("input").blur();
							$(".iscroll").data("nowControl", targetId);
							var data = data.data;
							var dataArr = [];
							for(key in data) {
								dataArr = data[key];
							}
							// 获取列表项内的Key
							var dataInfoKey = [];
							for(var key in dataArr[0]) {
								dataInfoKey.push(key);
							}
							var dataId = "";
							var dataCn = "";
							for(var i = 0; i < dataInfoKey.length; i++) {
								if(dataInfoKey[i].match(/.*id$/gi) != null) {
									dataId = dataInfoKey[i];
								} else {
									dataCn = dataInfoKey[i];
								}
							}
							var str = "";
							for(var i = 0; i < dataArr.length; i++) {
								str += '<li data-sub="' + dataArr[i][dataId] + '">' + dataArr[i][dataCn] + '</li>';
							}
							str = '<div id="wrapper">' +
										'<div id="scroller">' +
											'<ul>' + str + '</ul>' +
										'</div>' +
									'</div>';
							$("#wrapper").remove();
							$(".iscroll").html(str);
							// 组件出现
							$(".iscroll").show();
							myScroll = new IScroll('#wrapper');
						} else {
							closeLoad();
							popup(data.errmsg);
						}
						closeLoad();
					}, "json")
				})
			}
			// 省市区联动
			// 居住城市地址
			// 地址内容回显
			var address1 =  $("#address").siblings("input").val();
			var address2 =  $("#companycity").siblings("input").val();
			if(address1 != "") {
				$("#address").siblings(".cover-input").html(address1).addClass("cover");
			}
			if(address2 != "") {
				$("#companycity").siblings(".cover-input").html(address2).addClass("cover");
			}
			var proviceListStr = "";
			$("#address").siblings(".cover-input").data("nowControl", "#address");
			$("#companycity").siblings(".cover-input").data("nowControl", "#companycity");
			$("#address, #companycity").siblings(".cover-input").on("tap", function() {
				showLoad();
				$("input").blur();
				$(".iscroll").data("nowControl", $(this).data("nowControl"));
				$(".iscroll").data("address", true);
				if(proviceListStr == "") {
					getProvince();
				} else {
					closeLoad();
					$(".iscroll").data("ajaxStatus", 1);
					myScroll = null;
					$("#wrapper").remove();
					$(".iscroll").html(proviceListStr);
					$("#wrapper").off();
					// 组件出现
					$(".iscroll").show();
					myScroll = new IScroll('#wrapper');
				}
			});
			// 请求省份
			function getProvince() {
				$.get(//common.baseUrl + "universal/application/query/provinceList", function(data) {
					"../json/provinceList.json",function(data){
					if(data.status == "success") {
						$("input").blur();
						$(".iscroll").data("ajaxStatus", 1);
						var data = data.data.provinces;
						data = _.sortBy(data, "provinceid");
						var str = "";
						for(var i = 0; i < data.length; i++) {
							str += '<li data-sub="'+ data[i].provinceid + '">' + data[i].provincecn + '</li>'
						}
						str = '<div id="wrapper">' +
									'<div id="scroller">' +
										'<ul>' + str + '</ul>' +
									'</div>' +
								'</div>';
						proviceListStr = str;
						$("#wrapper").remove();
						$(".iscroll").html(str);
						// 组件出现
						$(".iscroll").show();
						myScroll = new IScroll('#wrapper');
					}
					closeLoad();
				}, "json");
			}
			// 请求市区
			function getCity(provice) {
				$.ajax({
					type : "GET",
					url : '../json/cityList.json',
					type : "POST",
					/*url : common.baseUrl + "universal/application/query/cityList",
					data: JSON.stringify({provinceid : provice}),*/
					contentType: "application/json",
					dataType : "json",
					success : function(data) {
						$(".iscroll").data("ajaxStatus", 2);
						var data = data.data.citys;
						data = _.sortBy(data, "cityid");
						var str = "";
						for(var i = 0; i < data.length; i++) {
							str += '<li data-sub="'+ data[i].cityid + '">' + data[i].citycn + '</li>'
						}
						str = '<div id="wrapper">' +
									'<div id="scroller">' +
										'<ul>' + str + '</ul>' +
									'</div>' +
								'</div>';
						$("#wrapper").remove();
						$(".iscroll").html(str);
						// 组件重新声明
						myScroll = new IScroll('#wrapper');
						closeLoad();
					}
				})
			}
			// 请求地区
			function getArea(city) {
				$.ajax({
					type : "GET",
					url : "../json/cityAreaList.json",
					/*type : "POST",
					url : common.baseUrl + "universal/application/query/cityAreaList",*/
					data : JSON.stringify({cityid : city}),
					contentType: "application/json",
					dataType : "json",
					success : function(data) {
						$(".iscroll").data("ajaxStatus", 3);
						var data = data.data.areas;
						data = _.sortBy(data, "areaid");
						var str = "";
						for(var i = 0; i < data.length; i++) {
							str += '<li data-sub="'+ data[i].areaid + '">' + data[i].areacn + '</li>'
						}
						str = '<div id="wrapper">' +
									'<div id="scroller">' +
										'<ul>' + str + '</ul>' +
									'</div>' +
								'</div>';
						$("#wrapper").remove()
						$(".iscroll").html(str);
						// 组件重新声明
						myScroll = new IScroll('#wrapper');
						closeLoad();
					}
				})
			}	
			// 点击下一步判断所有表单状态并存入数组当前表单状态,输出第一个不符合要求的提示
			$(".next-step").on("tap", function() {
				if($this.subData() == true) {
					if(!$(this).hasClass("sub-disabled")) {
						$(this).addClass("sub-disabled").html("正在提交，请稍等...");
						openView("addBankCard");
					}
				}
			})
		},
		// 回显电话
		showTel : function() {
			var num = $("#companynum").val();
			if(num != "" && /\|/g.test(num)) {
				var tel = $("#companynum").val().split("|");
				var starsMain = this.returnMainNum(tel[1]);
				$(".phone-area input").val(tel[0]);
				$(".phone-main input").val(starsMain);
				if(tel[2] != "") {
					$(".phone-ext input").val(tel[2]);
				}
			} else {
				$("#companynum").val("")
			}
		},
		// 脱敏change
		inputEvent : function() {
			var $this = this;
			// 邮箱
			$('#mail').on('focus', function() {
				if($('#mailShow').val() != '' && /\*/g.test($(this).val())) {
					$(this).val('');
				}
			});
			$('#mail').on('blur', function() {
				if($('#mailShow').val() != '' && $(this).val() == '') {
					$('#mail').val($this.returnEmailStr($('#mailShow').val()));
				}
			});
			// 座机号脱敏事件
			$('.phone-main input').on('focus', function() {
				if($('#companynum').val() != '' && /\*/g.test($(this).val())) {
					$(this).val('');
				}
			});
			// 亲属联系人姓名
			$('#relationshipname').on('focus', function() {
				if($('#relationshipnameShow').val() != '' && /\*/g.test($(this).val())) {
					$(this).val('');
				}
			});
			$('#relationshipname').on('blur', function() {
				if($('#relationshipnameShow').val() != '' && $(this).val() == '') {
					$('#relationshipname').val($this.returnNameStr($('#relationshipnameShow').val()));
				}
			});
			// 亲属手机号
			$('#relationshiptel').on('focus', function() {
				if($('#relationshiptelShow').val() != '' && /\*/g.test($(this).val())) {
					$(this).val('');
				}
			});
			$('#relationshiptel').on('blur', function() {
				if($('#relationshiptelShow').val() != '' && $(this).val() == '') {
					$('#relationshiptel').val($this.returnTelStr($('#relationshiptelShow').val()));
				}
			});
			// 紧急联系人姓名
			$('#contactsname').on('focus', function() {
				if($('#contactsnameShow').val() != '' && /\*/g.test($(this).val())) {
					$(this).val('');
				}
			});
			$('#contactsname').on('blur', function() {
				if($('#contactsnameShow').val() != '' && $(this).val() == '') {
					$('#contactsname').val($this.returnNameStr($('#contactsnameShow').val()));
				}
			});
			// 紧急联系人手机号
			$('#contactstel').on('focus', function() {
				if($('#contactstelShow').val() != '' && /\*/g.test($(this).val())) {
					$(this).val('');
				}
			});
			$('#contactstel').on('blur', function() {
				if($('#contactstelShow').val() != '' && $(this).val() == '') {
					$('#contactstel').val($this.returnTelStr($('#contactstelShow').val()));
				}
			});
		},
		// 回显脱敏信息
		showData : function() {
			// 邮箱
			if($('#mailShow').val() != '') {
				$('#mail').val(this.returnEmailStr($('#mailShow').val()));
			}
			// 亲属联系人姓名
			if($('#relationshipnameShow').val() != '') {
				$('#relationshipname').val(this.returnNameStr($('#relationshipnameShow').val()));
			}
			// 亲属手机号
			if($('#relationshiptelShow').val() != '') {
				$('#relationshiptel').val(this.returnTelStr($('#relationshiptelShow').val()));
			}
			// 紧急联系人姓名
			if($('#contactsnameShow').val() != '') {
				$('#contactsname').val(this.returnNameStr($('#contactsnameShow').val()));
			}
			// 紧急联系人手机号
			if($('#contactstelShow').val() != '') {
				$('#contactstel').val(this.returnTelStr($('#contactstelShow').val()));
			}

		},
		// 细化脱敏返回字符串
		// 获取名字脱敏字符串
		returnNameStr : function(name) {
			var stars = '';
			for(var i = 1; i < name.length; i++) {
				stars += '*';
			}
			return stars + name.substr(-1,1);
		},
		// 获取邮件脱敏字符串
		returnEmailStr : function(mail) {
			var email = mail.split('@');
			var stars = '';
			if(email[0].length > 3) {
				for(var i = 0; i < email[0].length; i++) {
					stars += '*';
				}
			} else {
				stars = '*';
			}
			return email[0].substr(0,3) + stars + '@' + email[1];
		},
		// 获取座机7-8位字符串
		returnMainNum : function(main) {
			return main.replace(/^(\d{4})(\d{4})$|^(\d{3})(\d{4})$/,function($0,$1,$2,$3,$4) {
				if($1) {
					return '****' + $2;
				}
				if($3) {
					return '***' + $4;
				}
			});
		},
		// 获取手机号脱敏字符串
		returnTelStr : function(tel) {
			return tel.substr(0,3) + '****' + tel.substr(-4,4);
		},
		// 提交
		subData : function() {
			//return true;
			// 电子邮箱
			if($("#mail").val() == "") {
				return popup("请填写电子邮箱");
			}
			if($("#mailShow").val() != '') {
				if(/\*/.test($("#mail").val())) {
					if(this.returnEmailStr($("#mailShow").val()) != $("#mail").val()) {
						return popup("请填写正确的电子邮箱");
					}
				} else {
					if(!Utils.regEmail($("#mail").val())) {
						return popup("请填写正确的电子邮箱");
					} else {
						$("#mailShow").val($("#mail").val());
					}
				}
			} else {
				if(!Utils.regEmail($("#mail").val())) {
					return popup("请填写正确的电子邮箱");
				} else {
					$("#mailShow").val($("#mail").val());
				}
			}

			// 居住城市
			if($("#address").val() == "" || $("#address").siblings('input').val() == "") {
				return popup("请选择居住城市");
			}
			// 详细地址
			if($("#detaddr").val() == "") {
				return popup("请填写居住城市详细地址");
			}

			// 单位全称
			if($("#company").val() == "") {
				return popup("请填写单位全称");
			}
			// 单位城市
			if($("#companycity").val() == "" || $("#companycity").siblings('input').val() == "") {
				return popup("请选择单位城市");
			}
			// 单位地址
			if($("#companyaddr").val() == "") {
				return popup("请填写单位城市详细地址");
			}
			// 单位电话
			// 检验区号
			if($(".phone-area input").val() == "") {
				return popup("请填写区号");
			} else if(!/\d{3,4}/.test($(".phone-area input").val())) {
				return popup("请填写正确的区号");
			}
			// 号码验证

			if($(".phone-area input").val() == "") {
				return popup("请填写固定电话");
			} else {
				if(/\*/.test($(".phone-main input").val())) {
					var m = $("#companynum").val().split("|")[1];
					if(this.returnMainNum(m) != $(".phone-main input").val()) {
						return popup("请填写正确的固定电话");
					}
				} else {
					if(!/\d{7,8}/.test($(".phone-main input").val())) {
						return popup("请填写正确的固定电话");
					} else {
						// 处理固定电话
						$("#companynum").val($(".phone-area input").val() + "|" + $(".phone-main input").val() + "|" + $(".phone-ext input").val())
					}
				}
			}

			// 亲属关系
			if($("#contactrelation").val() == "" || $("#contactrelation").siblings('input').val() == '') {
				return popup("请选择亲属关系");
			}
			// 亲属联系人姓名
			if($("#relationshipname").val() == "") {
				return popup("请填写亲属联系人姓名");
			}

			if($("#relationshipname").val() == "" || $("#relationshipname").val().length == 1) {
				return popup("请填写亲属联系人姓名");
			}
			if($("#relationshipnameShow").val() != '') {
				if(/\*/.test($("#relationshipname").val())) {
					if(this.returnNameStr($("#relationshipnameShow").val()) != $("#relationshipname").val()) {
						return popup("亲属联系人姓名填写有误");
					}
				} else {
					$("#relationshipnameShow").val($("#relationshipname").val());
				}
			} else {
				if(/\*/.test($("#relationshipname").val())) {
					return popup("亲属联系人姓名填写有误");
				} else {
					$("#relationshipnameShow").val($("#relationshipname").val());
				}
			}

			// 亲属联系人电话验证
			if($("#relationshiptel").val() == "") {
				return popup("请填写亲属联系人电话");
			}
			if($("#relationshiptelShow").val() != '') {
				if(/\*/.test($("#relationshiptel").val())) {
					if(this.returnTelStr($("#relationshiptelShow").val()) != $("#relationshiptel").val()) {
						return popup("请填写正确的亲属联系人电话");
					}
				} else {
					if(!Utils.regPhone($("#relationshiptel").val())) {
						return popup("请填写正确的亲属联系人电话");
					} else {
						$("#relationshiptelShow").val($("#relationshiptel").val());
					}
				}
			} else {
				if(!Utils.regPhone($("#relationshiptel").val())) {
					return popup("请填写正确的亲属联系人电话");
				} else {
					$("#relationshiptelShow").val($("#relationshiptel").val());
				}
			}

			// 紧急联系人关系
			if($("#emergencyrelation").val() == "" || $("#emergencyrelation").siblings('input').val() == '') {
				return popup("请选择紧急联系人");
			}

			// 紧急联系人姓名
			if($("#contactsname").val() == "" || $("#contactsname").val().length == 1) {
				return popup("请填写紧急联系人姓名");
			}
			if($("#contactsnameShow").val() != '') {
				if(/\*/.test($("#contactsname").val())) {
					if(this.returnNameStr($("#contactsnameShow").val()) != $("#contactsname").val()) {
						return popup("紧急联系人姓名填写有误");
					}
				} else {
					$("#contactsnameShow").val($("#contactsname").val());
				}
			} else {
				if(/\*/.test($("#contactsname").val())) {
					return popup("紧急联系人姓名填写有误");
				} else {
					$("#contactsnameShow").val($("#contactsname").val());
				}
			}

			// 紧急联系人电话验证
			if($("#contactstel").val() == "") {
				return popup("请填写紧急联系人电话");
			}
			if($("#contactstelShow").val() != '') {
				if(/\*/.test($("#contactstel").val())) {
					if(this.returnTelStr($("#contactstelShow").val()) != $("#contactstel").val()) {
						return popup("请填写正确的紧急联系人电话");
					}
				} else {
					if(!Utils.regPhone($("#contactstel").val())) {
						return popup("请填写正确的紧急联系人电话");
					} else {
						$("#contactstelShow").val($("#contactstel").val());
					}
				}
			} else {
				if(!Utils.regPhone($("#contactstel").val())) {
					return popup("请填写正确的紧急联系人电话");
				} else {
					$("#contactstelShow").val($("#contactstel").val());
				}
			}

			// 推荐人电话如果有就判断是否符合规则
			if($(".recommend input").val() != "") {
				if($(".recommend input").val().length == 6) {
					if(!/^\d{6}$/.test($(".recommend input").val())) {
						return popup("请填写正确的推荐人工号");
					}
				} else if($(".recommend input").val().length == 11) {
					if(!Utils.regPhone($(".recommend input").val())) {
						return popup("请填写正确的推荐人电话");
					}
				} else {
					return popup("请填写正确的推荐人电话或工号");
				}
			}
			// 姓名重复判断
			if($("#relnameShow").val() == $("#relationshipnameShow").val() || $("#relnameShow").val() == $("#contactsnameShow").val()) {
				return popup("联系人不可与申请人姓名相同");
			}
			if($("#relationshipnameShow").val() == $("#contactsnameShow").val()) {
				return popup("亲属联系人姓名不能和紧急联系人姓名一致");
			}

			// 手机号重复
			if($("#relationshiptelShow").val() == $("#contactstelShow").val()) {
				return popup("亲属联系人手机号不能和紧急联系人手机号一致");
			}
			return true;
		},
	}
	AddInf.initialize();
})