define([
'zepto',
'utils',
'touch'
], function($,Utils) {
	var UploadModle = {
		// 初始化
		initialize : function() {
			$('.loading').hide();
			this.images = {
				localId: [],
				serverId: []
			};
			this.canSub = true;
			// 禁止输入法go和“前往”强制提交
			$("input").on("keydown", function() {
				var keyCode = event.keyCode|| event.which;
				if(keyCode == 13) {
					return false;
				}
			});
			this.startEvent();
		},
		// 初始事件
		startEvent : function() {
			if($(".errmsgShow").val() != "" && $(".errmsgShow").length != 0) {
				this.popup($(".errmsgShow").val());
			}
			// 弹窗取消关闭弹窗
			$(".popup-con").on("touchend", "div", function() {
				$(".popup").hide();
			});
			$(".close-pan").on("touchend", function() {
				$(".show-pic").hide();
			});
			$(".popup,.show-pic").on("touchstart",function(e) {
				if(e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
			});
			this.takePhoto();
			this.lookWrong();
			this.lookAgreement();
			this.preview();
			this.inputEvent();
			this.showData();
			// 上传图片
			this.subPic();
		},
		// 查看错误示例
		lookWrong : function() {
			$(".tipupload").on("tap", "strong",function() {
				$(".wrong-con").show();
				$(".main-con").hide();
				$(".agreement-iframe").hide();
			});
			$(".back-botton").on("tap", function() {
				$(".main-con").show();
				$(".wrong-con").hide();
				$(".agreement-iframe").hide();
			})
		},
		// 查看协议
		lookAgreement : function() {
			$('.agreement').on("tap",'span', function() {
				$('input').blur();
				$(".agreement-iframe").show();
				$(".main-con").hide();
				$(".wrong-con").hide();
			});
			$('.agreement i').on("tap", function() {
				$(this).parent().toggleClass("disagree");
			})
		},
		// 获取名字脱敏字符串
		returnNameStr : function(name) {
			var stars = '';
			for(var i = 1; i < name.length; i++) {
				stars += '*';
			}
			return stars + name.substr(-1,1);
		},
		// 获取身份证号脱敏字符串
		returnCardStr : function(idcard) {
			return idcard.substr(0,3) + '***********' + idcard.substr(-4,4);
		},
		// 脱敏change
		inputEvent : function() {
			var $this = this;
			// 姓名
			$('#relname').on('focus', function() {
				if($('#relnameShow').val() != '' && /\*/g.test($(this).val())) {
					$(this).val('');
				}
			});
			$('#relname').on('blur', function() {
				if($('#relnameShow').val() != '' && $(this).val() == '') {
					$('#relname').val($this.returnNameStr($('#relnameShow').val()));
				}
			});
			// 身份证号
			$('#idcard').on('focus', function() {
				if($('#idcardShow').val() != '' && /\*/g.test($(this).val())) {
					$(this).val('');
				}
			});
			$('#idcard').on('blur', function() {
				if($('#idcardShow').val() != '' && $(this).val() == '') {
					$('#idcard').val($this.returnCardStr($('#idcardShow').val()));
				}
			});
		},
		// 回显脱敏信息
		showData : function() {
			// 姓名
			if($('#relnameShow').val() != '') {
				$('#relname').val(this.returnNameStr($('#relnameShow').val()));
			}
			// 身份证号
			if($('#idcardShow').val() != '') {
				$('#idcard').val(this.returnCardStr($('#idcardShow').val()));
			}
		},
		// 弹窗提示
		popup : function(p) {
			$(".popup p").html(p);
			$(".popup").show();
		},
		// 拍照显示
		takePhoto : function(e) {
			var $this = this;
			$(".take-photo").on("click", function(e) {
				showLoad();
				var _this = $(this),_index = _this.parent().index();
				console.log( "开始拍照：" );
				var cmr = plus.camera.getCamera();
				cmr.captureImage( function ( p ) {
					plus.io.resolveLocalFileSystemURL( p, function ( entry ) {
						$this.images.localId[_index] = entry.toLocalURL();
						_this.children("img").attr("src", entry.toLocalURL()).show();
						closeLoad();
					}, function ( e ) {
						console.log( "读取拍照文件错误："+e.message );
						closeLoad();
					} );
				}, function ( e ) {
					console.log( "失败："+e.message );
					closeLoad();
				}, {index:1} );
			})
		},
		// 提交照片
		subPic : function() {
			var _this = this;
			$(".sub").on("touchend", function() {
			// 真实姓名
				if($("#relname").val() == "" || $("#relname").val().length == 1 || /\s/.test($("#relname").val())) {
					return _this.popup("请填写真实姓名");
				}
				if($("#relnameShow").val() != '') {
					if(/\*/.test($("#relname").val())) {
						if(_this.returnNameStr($("#relnameShow").val()) != $("#relname").val()) {
							return _this.popup("真实姓名填写有误");
						}
					} else {
						$("#relnameShow").val($("#relname").val());
					}
				} else {
					if(/[\*\s]/.test($("#relname").val())) {
						return _this.popup("真实姓名填写有误");
					} else {
						$("#relnameShow").val($("#relname").val());
					}
				}

				// 身份证号
				if($("#idcard").val() == "") {
					return _this.popup("请填写申请人身份证");
				}
				if($("#idcardShow").val() != '') {
					if(/\*/.test($("#idcard").val())) {
						if(_this.returnCardStr($("#idcardShow").val()) != $("#idcard").val()) {
							return _this.popup("请填写正确的身份证");
						}
					} else {
						if(!Utils.regIdCard($("#idcard").val()).check) {
							return _this.popup("请填写正确的身份证");
						} else {
							$("#idcardShow").val($("#idcard").val());
						}
					}
				} else {
					if(!Utils.regIdCard($("#idcard").val()).check) {
						return _this.popup("请填写正确的身份证");
					} else {
						$("#idcardShow").val($("#idcard").val());
					}
				}

				if (_this.images.localId.length != 3 || _this.images.localId[0] == null || _this.images.localId[1] == null || _this.images.localId[2] == null) {
					if(!_this.images.localId[0] || _this.images.localId[0] == null) {
						return _this.popup('请上传您的身份证人脸照片');
					}
					if(!_this.images.localId[1] || _this.images.localId[1] == null) {
						return _this.popup('请上传您的身份证国徽照');
					}
					if(!_this.images.localId[2] || _this.images.localId[2] == null) {
						return _this.popup('请上传您的手持身份证照片');
					}
				} else {
					if($('.agreement').hasClass('disagree')) {
						return _this.popup('请阅读并同意《个人征信查询及报送授权声明》');
					}
					if(_this.canSub == true) {
						_this.canSub = false;
						localStorage.setItem("relname",$("#relname").val());
						//localStorage.getItem("relname");
						$(".sub").addClass("sub-disabled").html("正在上传图片，请稍等...");
						var i = 0, length = _this.images.localId.length;
						_this.images.serverId = [];
						plus.storage.setItem("relname",$('#relnameShow').val());
						var w = plus.webview.create( "./../html/addPersonalAndWorkUnit.html" );
						showLoad();
						w.show(); // 显示窗口
					}	
				}
			})
		},
		// 预览照片
		preview : function() {
			$(".example-pic").on("tap", function(){
				var _index = $(this).parent().index(),
					tips = "",
					tipStr = "";
				switch(_index) {
					case 0:tips="身份证头像照拍摄示例图";tipStr="<p>温馨提示：</p><p>1.拍摄时将身份证正面置于拍摄界面正中。</p><p>2.必须为本人身份证照片，真实有效，且内容清晰可辨。</p>";break;
					case 1:tips="身份证国徽照拍摄示例图";tipStr="<p>温馨提示：</p><p>1.拍摄时将身份证正面置于拍摄界面正中。</p><p>2.必须为本人身份证照片，真实有效，且内容清晰可辨。</p>";break;
					case 2:tips="申请人手持身份证合影拍摄示例图";tipStr="<p>温馨提示：</p><p>1.拍摄时保证环境光线充足，背景为纯色。</p><p>2.被拍摄者五官清晰，无遮拦。</p><p>3.身份证资料清晰可辨。</p>";break;
				}
				var bigImgSrc = $(this).children("img").attr("big-src");
				$(".show-pic-con h3").html(tips);
				$(".big-img-tips").html(tipStr);
				$(".big-img").children("img").attr("src", bigImgSrc);
				$(".show-pic").show();
			})
		},
	}
	UploadModle.initialize();
})