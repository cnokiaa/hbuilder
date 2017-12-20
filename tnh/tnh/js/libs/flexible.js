;(function(win, lib) {
    var doc = win.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');
    var dpr = 0;
    var scale = 0;
    var tid;
    var flexible = lib.flexible || (lib.flexible = {});
    
    if (metaEl) {
        console.warn('将根据已有的meta标签来设置缩放比例');
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if (match) {
            scale = parseFloat(match[1]);
            dpr = parseInt(1 / scale);
        }
    } else if (flexibleEl) {
        var content = flexibleEl.getAttribute('content');
        if (content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
            if (initialDpr) {
                dpr = parseFloat(initialDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));    
            }
            if (maximumDpr) {
                dpr = parseFloat(maximumDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));    
            }
        }
    }

    if (!dpr && !scale) {
        var isAndroid = win.navigator.appVersion.match(/android/gi);
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;
        if (isIPhone) {
            // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {                
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
            // 其他设备下，仍旧使用1倍的方案
            dpr = 1;
        }
        scale = 1 / dpr;
    }

    docEl.setAttribute('data-dpr', dpr);
    if (!metaEl) {
        metaEl = doc.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }

    function refreshRem(){
        var width = docEl.getBoundingClientRect().width;
        if (width / dpr > 540) {
            width = 540 * dpr;
        }
        var rem = width / 16;
        docEl.style.fontSize = rem + 'px';
        flexible.rem = win.rem = rem;
    }

    win.addEventListener('resize', function() {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, 300);
    }, false);
    win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
        }
    }, false);

    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function(e) {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }
    

    refreshRem();

    flexible.dpr = win.dpr = dpr;
    flexible.refreshRem = refreshRem;
    flexible.rem2px = function(d) {
        var val = parseFloat(d) * this.rem;
        if (typeof d === 'string' && d.match(/rem$/)) {
            val += 'px';
        }
        return val;
    }
    flexible.px2rem = function(d) {
        var val = parseFloat(d) / this.rem;
        if (typeof d === 'string' && d.match(/px$/)) {
            val += 'rem';
        }
        return val;
    }

})(window, window['lib'] || (window['lib'] = {}));



//设置缓存数据
//plus.storage.setItem("relname",$('#relnameShow').val());
//获取缓存数据
//plus.storage.getItem("")
//已有缓存参数
//record : {a  orderid | b period | c contractstatus}
var common = {
	baseUrl : "http://b.lakala.com/cl_wx/credit-loan-fls-wx-yfq/"	//测试地址
};
/// 扩展API加载完毕，现在可以正常调用扩展API 
function plusReady(){
    // 在这里调用plus api
    console.log("fuck you plusready");
    document.addEventListener( "pause", onAppPause, false );
    document.addEventListener( "resume", onAppReume, false );
    var h=plus.webview.getLaunchWebview();
	var ws=plus.webview.currentWebview();
    plus.key.addEventListener("backbutton",function(){
    	if(h == ws){
    		plus.nativeUI.confirm( "确认退出？", function(e){
				if(e.index==0){
					plus.runtime.quit()
				}
				return false;
			}, "替你还", ["确定","取消"] );
    	} else {
    		closeView();
    	}
	});
    closeLoad();
}
// 扩展API加载完毕后调用onPlusReady回调函数 
if(window.plus){
    plusReady();
}else{
    document.addEventListener('plusready',plusReady,false);
}

function onAppPause() {
	console.log( "Application paused!" ); 
}

function onAppReume() {
	console.log( "Application resumed!" ); 
}

function showLoad() {
	plus.nativeUI.showWaiting( "等待中..." );
}

function closeLoad() {
	setTimeout( function(){
		plus.nativeUI.closeWaiting();
	}, 500 );
}

// 弹窗提示
function popup(p) {
	$(".popup p").html(p);
	$(".popup").show();
}

function closeView() {
	var ws=plus.webview.currentWebview();
	plus.webview.close(ws);
}

function openView(url) {
	var w = plus.webview.create("./../html/"+url+".html");
	showLoad();
	w.show(); 
}
