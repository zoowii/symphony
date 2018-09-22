/*!
 * pjax(ajax + history.pushState) for jquery
 *
 * by welefen
 */
(function($) {
	var Util = {
		support : {
			pjax : window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/(iPod|iPhone|iPad|WebApps\/.+CFNetwork)/),
			storage : !!window.localStorage
		},
		toInt : function(obj) {
			return parseInt(obj);
		},
		stack : {},
		getTime : function() {
			return new Date * 1;
		},
		// \u83b7\u53d6URL\u4e0d\u5e26hash\u7684\u90e8\u5206,\u5207\u53bb\u6389pjax=true\u90e8\u5206
		getRealUrl : function(url) {
			url = (url || '').replace(/\#.*?$/, '');
			url = url.replace('?pjax=true&', '?').replace('?pjax=true', '').replace('&pjax=true', '');
			return url;
		},
		// \u83b7\u53d6url\u7684hash\u90e8\u5206
		getUrlHash : function(url) {
			return url.replace(/^[^\#]*(?:\#(.*?))?$/, '$1');
		},
		// \u83b7\u53d6\u672c\u5730\u5b58\u50a8\u7684key
		getLocalKey : function(src) {
			var s = 'pjax_' + encodeURIComponent(src);
			return {
				data : s + '_data',
				time : s + '_time',
				title : s + '_title'
			};
		},
		// \u6e05\u9664\u6240\u6709\u7684cache
		removeAllCache : function() {
			if (!Util.support.storage)
				return;
			for ( var name in localStorage) {
				if ((name.split('_') || [ '' ])[0] === 'pjax') {
					delete localStorage[name];
				}
			}
		},
		// \u83b7\u53d6cache
		getCache : function(src, time, flag) {
			var item, vkey, tkey, tval;
			time = Util.toInt(time);
			if (src in Util.stack) {
				item = Util.stack[src], ctime = Util.getTime();
				if ((item.time + time * 1000) > ctime) {
					return item;
				} else {
					delete Util.stack[src];
				}
			} else if (flag && Util.support.storage) { // \u4ecelocalStorage\u91cc\u67e5\u8be2
				var l = Util.getLocalKey(src);
				vkey = l.data;
				tkey = l.time;
				item = localStorage.getItem(vkey);
				if (item) {
					tval = Util.toInt(localStorage.getItem(tkey));
					if ((tval + time * 1000) > Util.getTime()) {
						return {
							data : item,
							title : localStorage.getItem(l.title)
						};
					} else {
						localStorage.removeItem(vkey);
						localStorage.removeItem(tkey);
						localStorage.removeItem(l.title);
					}
				}
			}
			return null;
		},
		// \u8bbe\u7f6ecache
		setCache : function(src, data, title, flag) {
			var time = Util.getTime(), key;
			Util.stack[src] = {
				data : data,
				title : title,
				time : time
			};
			if (flag && Util.support.storage) {
				key = Util.getLocalKey(src);
				localStorage.setItem(key.data, data);
				localStorage.setItem(key.time, time);
				localStorage.setItem(key.title, title);
			}
		},
		// \u6e05\u9664cache
		removeCache : function(src) {
			src = Util.getRealUrl(src || location.href);
			delete Util.stack[src];
			if (Util.support.storage) {
				var key = Util.getLocalKey(src);
				localStorage.removeItem(key.data);
				localStorage.removeItem(key.time);
				localStorage.removeItem(key.title);
			}
		}
	};
	// pjax
	var pjax = function(options) {
		options = $.extend({
			selector : '',
			container : '',
			callback : function() {},
			filter : function() {}
		}, options);
		if (!options.container || !options.selector) {
			throw new Error('selector & container options must be set');
		}
		$('body').delegate(options.selector, 'click', function(event) {
			if (event.which > 1 || event.metaKey) {
				return true;
			}
			var $this = $(this), href = $this.attr('href');
			// \u8fc7\u6ee4
			if (typeof options.filter === 'function') {
				if (options.filter.call(this, href, this) === true){
					return true;
				}
			}
			if (href === location.href) {
				return true;
			}
			// \u53ea\u662fhash\u4e0d\u540c
			if (Util.getRealUrl(href) == Util.getRealUrl(location.href)) {
				var hash = Util.getUrlHash(href);
				if (hash) {
					location.hash = hash;
					options.callback && options.callback.call(this, {
						type : 'hash'
					});
				}
				return true;
			}
			event.preventDefault();
			options = $.extend(true, options, {
				url : href,
				element : this,
				push: true
			});
			// \u53d1\u8d77\u8bf7\u6c42
			pjax.request(options);
		});
	};
	pjax.xhr = null;
	pjax.options = {};
	pjax.state = {};

	// \u9ed8\u8ba4\u9009\u9879
	pjax.defaultOptions = {
		timeout : 2000,
		element : null,
		cache : 24 * 3600, // \u7f13\u5b58\u65f6\u95f4, 0\u4e3a\u4e0d\u7f13\u5b58, \u5355\u4f4d\u4e3a\u79d2
		storage : true, // \u662f\u5426\u4f7f\u7528localstorage\u5c06\u6570\u636e\u4fdd\u5b58\u5230\u672c\u5730
		url : '', // \u94fe\u63a5\u5730\u5740
		push : true, // true is push, false is replace, null for do nothing
		show : '', // \u5c55\u793a\u7684\u52a8\u753b
		title : '', // \u6807\u9898
		titleSuffix : '',// \u6807\u9898\u540e\u7f00
		type : 'GET',
		data : {
			pjax : true
		},
		dataType : 'html',
		callback : null, // \u56de\u8c03\u51fd\u6570
		// for jquery
		beforeSend : function(xhr) {
			$(pjax.options.container).trigger('pjax.start', [ xhr, pjax.options ]);
			xhr && xhr.setRequestHeader('X-PJAX', true) && xhr.setRequestHeader('X-PJAX-Container', pjax.options.container);
		},
		error : function() {
			pjax.options.callback && pjax.options.callback.call(pjax.options.element, {
				type : 'error'
			});
			location.href = pjax.options.url;
		},
		complete : function(xhr) {
			$(pjax.options.container).trigger('pjax.end', [ xhr, pjax.options ]);
		}
	};
	// \u5c55\u73b0\u52a8\u753b
	pjax.showFx = {
		"_default" : function(data, callback, isCached) {
			this.html(data);
			callback && callback.call(this, data, isCached);
		},
		fade: function(data, callback, isCached){
			var $this = this;
			if(isCached){
				$this.html(data);
				callback && callback.call($this, data, isCached);
			}else{
				this.fadeOut(200, function(){
					$this.html(data).fadeIn(200, function(){
						callback && callback.call($this, data, isCached);
					});
				});
			}
		}
	}
	// \u5c55\u73b0\u51fd\u6570
	pjax.showFn = function(showType, container, data, fn, isCached) {
		var fx = null;
		if (typeof showType === 'function') {
			fx = showType;
		} else {
			if (!(showType in pjax.showFx)) {
				showType = "_default";
			}
			fx = pjax.showFx[showType];
		}
		fx && fx.call(container, data, function() {
			var hash = location.hash;
			if (hash != '') {
				location.href = hash;
				//for FF
				if(/Firefox/.test(navigator.userAgent)){
					history.replaceState($.extend({}, pjax.state, {
						url : null
					}), document.title);
				}
			} else if (location.search.length > 1) {
				window.scrollTo(0, 0);
			}
			fn && fn.call(this, data, isCached);
		}, isCached);
	}
	// success callback
	pjax.success = function(data, isCached) {
		// isCached default is success
		if (isCached !== true) {
			isCached = false;
		}
		//accept Whole html
		if (pjax.html) {
			data = $(data).find(pjax.html).html();
		}
		if ((data || '').indexOf('<html') != -1) {
			pjax.options.callback && pjax.options.callback.call(pjax.options.element, {
				type : 'error'
			});
			location.href = pjax.options.url;
			return false;
		}

		var title = $(pjax.options.element).attr('pjax-title');
		if (!title) {
            title = pjax.options.title || "";
            if (title == "" && pjax.options.element) {
                var el = $(pjax.options.element);
                title = el.attr('title') || el.text();
            }
            var matches = data.match(/<title>(.*?)<\/title>/);
            if (matches) {
                title = matches[1];
            }
		}

		if (title) {
			if (title.indexOf(pjax.options.titleSuffix) == -1) {
				title += pjax.options.titleSuffix;
			}
		}
		document.title = title;
		pjax.state = {
			container : pjax.options.container,
			timeout : pjax.options.timeout,
			cache : pjax.options.cache,
			storage : pjax.options.storage,
			show : pjax.options.show,
			title : title,
			url : pjax.options.oldUrl
		};
		var query = $.param(pjax.options.data);
		if (query != "") {
			pjax.state.url = pjax.options.url + (/\?/.test(pjax.options.url) ? "&" : "?") + query;
		}
		if (pjax.options.push) {
			if (!pjax.active) {
				history.replaceState($.extend({}, pjax.state, {
					url : null
				}), document.title);
				pjax.active = true;
			}
			history.pushState(pjax.state, document.title, pjax.options.oldUrl);
		} else if (pjax.options.push === false) {
			history.replaceState(pjax.state, document.title, pjax.options.oldUrl);
		}
		pjax.options.showFn && pjax.options.showFn(data, function() {
			pjax.options.callback && pjax.options.callback.call(pjax.options.element,{
				type : isCached? 'cache' : 'success'
			});
		}, isCached);
		// \u8bbe\u7f6ecache
		if (pjax.options.cache && !isCached) {
			Util.setCache(pjax.options.url, data, title, pjax.options.storage);
		}
	};

	// \u53d1\u9001\u8bf7\u6c42
	pjax.request = function(options) {
		if(options.hasOwnProperty('data')){
			pjax.defaultOptions.data=options.data;
		}
		options = $.extend(true, pjax.defaultOptions, options);
		var cache, container = $(options.container);
		options.oldUrl = options.url;
		options.url = Util.getRealUrl(options.url);
		if($(options.element).length){
			cache = Util.toInt($(options.element).attr('data-pjax-cache'));
			if (cache) {
				options.cache = cache;
			}
		}
		if (options.cache === true) {
			options.cache = 24 * 3600;
		}
		options.cache = Util.toInt(options.cache);
		// \u5982\u679c\u5c06\u7f13\u5b58\u65f6\u95f4\u8bbe\u4e3a0\uff0c\u5219\u5c06\u4e4b\u524d\u7684\u7f13\u5b58\u4e5f\u6e05\u9664
		if (options.cache === 0) {
			Util.removeAllCache();
		}
		// \u5c55\u73b0\u51fd\u6570
		if (!options.showFn) {
			options.showFn = function(data, fn, isCached) {
				pjax.showFn(options.show, container, data, fn, isCached);
			};
		}
		pjax.options = options;
		pjax.options.success = pjax.success;
		if (options.cache && (cache = Util.getCache(options.url, options.cache, options.storage))) {
			options.beforeSend();
			options.title = cache.title;
			pjax.success(cache.data, true);
			options.complete();
			return true;
		}
		if (pjax.xhr && pjax.xhr.readyState < 4) {
			pjax.xhr.onreadystatechange = $.noop;
			pjax.xhr.abort();
		}
		pjax.xhr = $.ajax(pjax.options);
	};

	// popstate event
	var popped = ('state' in window.history), initialURL = location.href;
	$(window).bind('popstate', function(event) {
		var initialPop = !popped && location.href == initialURL;
		popped = true;
		if (initialPop) return;
		var state = event.state;
		if (state && state.container) {
			if ($(state.container).length) {
				var data = {
					url : state.url,
					container : state.container,
					push : null,
					timeout : state.timeout,
					cache : state.cache,
					storage : state.storage,
					title: state.title,
					element: null
				};
				pjax.request(data);
			} else {
				window.location = location.href;
			}
		}
	});

	// not support
	if (!Util.support.pjax) {
		pjax = function() {
			return true;
		};
		pjax.request = function(options) {
			if (options && options.url) {
				location.href = options.url;
			}
		};
	}
	// pjax bind to $
	$.pjax = pjax;
	$.pjax.util = Util;

	// extra
	if ( ! ('state' in $.Event.prototype) ) {
      $.event.addProp('state');
    }

})(jQuery);