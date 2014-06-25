/**
 * QQ.Photo 1.0.0
 * Date: 2014-06-15
 * (c) 2014-2014 M.J, http://webjyh.com
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://creativecommons.org/licenses/LGPL/2.1/
 *
 */
(function( $ ){

	var QQPhoto = function( elem, options ){
		var _this = this;
		
		this.elem = $( elem );
		this.options = options;
		this.index = null;
		this.thumbNum = 0;
		this.listWidth = 0;
		this.liWidth = 0;
		this.len = 0;
		this.thumbList = [];
		this.ulElem = {};
		this.IE6 = !-[1,]&&!window.XMLHttpRequest;
		this.image = [];
		
		this.elem.bind('click', function (event) { event.preventDefault(); _this.init(); return false; });
	};

	QQPhoto.prototype = {
		defaults: {
			url : 'data.json',
			commentURL : 'comment.json',
			fix : 5,
			minTextLen : 3,
			maxTextLen : 140,
			fadeIn : false,
			loadding : 'images/loading.gif'
		},
		
		init: function(){
			var DOM;

			this.config = $.extend( {}, this.defaults, this.options );
			this.DOM = DOM = this._createDOM();
			
			// 1.给模板设置样式，
			// 2.获取数据并操作
			// 3.绑定关闭事件
			this
			._setCss()
			._getJSON()
			._closeEvt();

			return this;
		},
		
		//获取数据
		_getJSON: function () {
		    var DOM = this.DOM,
                _this = this;
			
			$.getJSON( _this.config.url, function( data ){
			    if (typeof data != 'undefined' && data.code > 0) {
					_this._data( data );
				} else {
			        alert(data.msg);
			        setTimeout(function (){
			            DOM.wrap.remove();
			            DOM.lock.remove();
			            delete QQPhoto;
			        }, 1500);
				}
			}).error( function() { 
			    alert("\u83b7\u53d6\u6570\u636e\u51fa\u9519\uff0c\u8bf7\u5237\u65b0\u91cd\u8bd5");
			    setTimeout(function () {
			        DOM.wrap.remove();
			        DOM.lock.remove();
			        delete QQPhoto;
			    }, 1500);
			});
			
			return _this;
		},
		
		//数据的添加
		_data: function( JSON ){
			var DOM = this.DOM,
			    thumbList = JSON.thumbList,
			    thumbLen = thumbList.length,
			    index = this._arrayKey( JSON.showimages, thumbList );

			this.thumbList = JSON.thumbList;
			this.len = thumbLen;
			this.index = index; //将Index设置为全局

			// 1.设置当前图片
			// 2.创建相册列表, 并设置事件委托
			// 3.设置缩略图的事件和位置
			// 4~5.列表左右按钮绑定事件
			// 6.绑定 resize 事件

			this
			._setData( thumbList[index] )
			._creaetList( thumbList )
			._thumbEvent( index )
			._arrow( thumbList, index )
			._arrowThumbLeft()
			._arrowThumbRight()
			._commentEvent()
			._resize( thumbLen );
			
			return this;
		},

		//给DOM转换数据
		_setData: function( obj ){
			var DOM = this.DOM,
			    _this = this;
			
			DOM.img.hide();
			DOM.photo.css( "background", "url("+this.config.loadding+") no-repeat center center" );
			
			this._loadImage( obj.large, function(){
				DOM.photo.css( "background", "none" );
				DOM.img.attr( 'src', obj.large )[_this.config.fadeIn === true ? "fadeIn":'show']();
				if ( _this.IE6 ){
					_this.image = arguments[0];
					_this._IEImage( arguments[0] );
				}
			});
			
			DOM.avatar.attr( 'src', obj.avatar );
			DOM.userName.text( obj.user );
			DOM.time.text( obj.time );
			DOM.description.text( obj.desc );
			DOM.count.text( ( parseInt( this.index ) + 1 ) + ' / ' + this.len );
			DOM.title.text( obj.title );
			DOM.pictureid.val( obj.id );

			_this._createComment( obj.comment );
			
			return _this;
		},
		
		//缩略图  给 li 设置事件委托
		_creaetList: function( arr ){
			var _this = this,
			    DOM = this.DOM,
			    i = 0,
			    tpl = '',
			    arrLen = arr.length;

			for ( ; i < arrLen; i++ ){
				tpl += QQPhoto.li.replace( '{src}', arr[i].thumb ).replace( '{index}', i );
			}
			DOM.list.children('div').append( '<ul class="ui-clearfix">' + tpl +'</ul>' );
			
			//事件委托
			DOM.list.children('div').children('ul').delegate( 'li', 'click', function(){
				_this.index = $(this).attr('data-index');
				
				DOM.list.find('ul').find('a').removeClass('current');
				$(this).children('a').addClass('current');
				
				_this._setData( arr[_this.index] );
			});
			
			return _this;
		},

		//留言
		_createComment: function( arr, type ){
			var tpl = '',
			    DOM = this.DOM,
			    arrLen = arr.length,
			    i = 0;
			
			if ( this._isArray( arr ) ){
				for ( i; i < arrLen; i++ ){
					tpl += QQPhoto.comment.replace( '{avatar}', arr[i].avatar ).replace( '{user}', arr[i].user ).replace( '{msg}', arr[i].msg );
				}
			}

			DOM.commentlist[ type == 'add' ? "append" : 'html' ]( tpl );

			return this;
		},
		
		//设置缩略图事件
		_thumbEvent: function( index ){
			var DOM = this.DOM;
			
			this.ulElem = DOM.list.find('ul');
			this.liWidth = this.ulElem.children('li').width();
			this.listWidth = DOM.list.children('div').width();
			this.thumbNum =  parseInt( this.listWidth / ( this.liWidth + this.config.fix ) );
			
			var ulWidth = ( this.liWidth + this.config.fix ) * this.len;
			
			//当容器大于 UL 时 列表居中
			if ( this.listWidth >= ulWidth ){
				this.ulElem.css({ 'width' : ulWidth, 'margin' : '0px auto' });
				DOM.list.children( 'a' ).hide();
			} else {
				DOM.list.children( 'a' ).show();
				this.ulElem.width( ulWidth );
				this._moveX( index );
			}
			
			//设置showimages 添加的Class
			this.ulElem.children('li').eq( index ).children('a').addClass('current');

			return this;
		},
		
		// Next(), Prev() 功能
		_arrow: function( arr, index ){
			var DOM = this.DOM,
				_this = this,
				arrLen = arr.length,
				ulElem = this.ulElem,
				ulWidth = ( this.liWidth + this.config.fix ) * this.len,
				liElem = ulElem.children('li');

			if ( this.len === 1 ){
				DOM.arrowLeft.hide();
				DOM.arrowRight.hide();
			} else {
			
				//预加载上一张，下一张
				var arrowImage = function( index ){
					var next = index + 1,
					    prev = index - 1;

					if ( index >= 0 && index < arrLen-1 ){
						_this._loadImage( arr[next].large );
					}
					if (index > 0 && index < arrLen-1) {
					    _this._loadImage(arr[prev].large);
					}
				};
				arrowImage( index );
				
				//thumb-list current 设置
				var arrow = function( index ){
					if ( index < 0 ) _this.index = 0;
					if ( index >= arrLen ) _this.index = ( arrLen-1 );
					if (index >= 0 && index < arrLen) _this._setData(arr[_this.index]);

					liElem.find('a').removeClass('current');
					liElem.eq( _this.index ).children('a').addClass('current');
					
					if ( _this.listWidth < ulWidth ){
						_this._moveX( _this.index );
					}
				};

				//设置上一张按钮
				DOM.arrowLeft.bind( 'click', function(){
					arrow( --_this.index );
					arrowImage( _this.index );
				});
				
				//设置下一张按钮
				DOM.arrowRight.bind( 'click', function(){
					arrow( ++_this.index );
					arrowImage( _this.index );
				});
			
			}

			return _this;
		},
		
		//列表小箭头事件
		_arrowThumbLeft: function(){
			var DOM = this.DOM,
			    change = this._getChange(),
			    ulElem = this.ulElem;

			DOM.thumbLeft.bind( 'click', function(){
				var m = Math.abs( parseInt( ulElem.css('margin-left') ) ),
				    c = 0;
				if ( m <= 0 ){
					c = 0;
				} else {
					if ( ( m - change ) >= change ){
						c = m - change;
					} else {
						c = 0;
					}
				}
				ulElem.stop( false, true ).animate({ 'margin-left': -c });
			});

			return this;
		},
		
		//列表小箭头事件
		_arrowThumbRight: function(){
			var DOM = this.DOM,
			    change = this._getChange(),
			    ulElem = this.ulElem,
				ulWidth = ( this.liWidth + this.config.fix ) * this.len;
			
			DOM.thumbRight.bind( 'click', function(){
				var m = Math.abs( parseInt( ulElem.css('margin-left') ) ),
					c = 0;
				if ( m <= 0 ){
					c = change;
				} else {
					if ( ( ulWidth - m ) > change ) {
						c = change + m;
					} else {
						c = m;
					}
				}
				ulElem.stop( false, true ).animate({ 'margin-left': -c });
			});
			return this;
		},
		
		//留言事件
		_commentEvent: function(){
			var _this = this, DOM = this.DOM;

			DOM.msg.bind( 'focus', function(){
				DOM.msgInfo.removeClass('error').text('').hide();
			});

			DOM.submit.bind( 'click', function(){

				//判断输入字符
			    if (DOM.msg.val().length < _this.config.minTextLen || DOM.msg.val().length > _this.config.maxTextLen) {
			        DOM.msgInfo.addClass('error').text('\u7559\u8a00\u5185\u5bb9\u4e0d\u5f97\u5c11\u4e8e' + _this.config.minTextLen + '\u4e2a\u5b57\u7b26\uff0c\u6700\u591a\u4e0d\u80fd\u591a\u4e8e' + _this.config.maxTextLen + '\u4e2a\u5b57\u7b26\u3002').show();
			    } else {

			        //禁用表单
			        $(document).ajaxStart(function () {
			            DOM.submit.addClass('disabled').attr('disabled', true);
			        });

			        //Ajax 发送
			        $.ajax({
			            url: _this.config.commentURL,
			            type: "POST",
			            dataType: "JSON",
			            data: { pictureid: DOM.pictureid.val(), msg: DOM.msg.val() },
			            success: function (data) {
			                if (typeof data !== 'undefined' && data.code > 0) {

			                    // 1.表单清空
			                    // 2.设置成功信息
			                    // 3.给当前图片的留言添加新数据
			                    // 4.模板渲染
			                    DOM.msg.val('');
			                    DOM.msgInfo.removeClass('error').text(data.msg).show();
			                    _this.thumbList[_this.index].comment.push(data.comment[0]);
			                    _this._createComment(data.comment, 'add');

			                } else {
			                    DOM.msgInfo.addClass('error').text(dta.msg).show();
			                }
			                DOM.submit.removeClass('disabled').attr('disabled', false);
			            },
			            error: function () {
			                DOM.msgInfo.addClass('error').text('\u63d0\u4ea4\u53d1\u9001\u9519\u8bef\uff0c\u8bf7\u5237\u65b0\u540e\u91cd\u8bd5\u3002').show();
			            }
			        });
			    }

			});
			return _this;
		},

		//Resize 重置事件
		_resize: function( arrLen ){
			var DOM = this.DOM,
				_this = this;

			$(window).bind( 'resize', function(){

				//设置高是为了解决IE下 图片无法剧中问题
				DOM.photo.css( 'height', ( DOM.primary.height() - 75 ) );
				DOM.lock.css( 'height', $(document).height() );
			
				//卸载列表事件
				DOM.thumbLeft.unbind();
				DOM.thumbRight.unbind();

				//需要Resize的事件
				_this
				._thumbEvent( _this.index )
				._arrowThumbLeft()
				._arrowThumbRight();
				
				if ( _this.IE6 ){
					_this._IE()._IEImage( _this.image );
				}

			});

			return this;
		},
		
		//返回图片所在数组中出现的位置
		_arrayKey: function( key, arr ){
			var i = 0,
			    arrLen = arr.length;
			for ( ; i < arrLen; i++ ){
				if ( arr[i].id == key ) {
					return i;
				}
			}
		},

		_isArray: function( arr ){
		 	return ( $.isArray( arr ) && arr.length > 0 ) ? true : false;
		},

		//图片预加载
		_loadImage: function( url, callback ){
			var image = new Image(),
			    arr = [];
			image.src = url;

			//如果是缓存 直接调用函数
			if ( image.complete ){
				arr.push( image.width );
				arr.push( image.height );
				if ( typeof callback !== 'undefined' ) callback.call(this, arr );
				return;
			}

			image.onload = function(){
				arr.push( image.width );
				arr.push( image.height );
				if ( typeof callback !== 'undefined' ) callback.call(this, arr);
			}
			
		},
		
		//返回需要偏移的值
		_getChange: function(){
			return this.thumbNum * ( this.liWidth + this.config.fix );
		},
		
		//设置偏移值
		_moveX: function( index ){
			var change = this._getChange(),
				ML = -parseInt( index / this.thumbNum ) * change;
			this.ulElem.stop( false, true ).animate({ 'margin-left': ML });
		},
		
		//IE 图片设置
		_IEImage: function( arr ){
			var DOM = this.DOM,
			    imgW = $( window ).width() - 200 - 300 - 20,
			    imgH = $( window ).height() - 100 - 60 - 20;

			if ( arr[0] > imgW ){
				var height = ( imgW * arr[1] ) / arr[0];
				DOM.img.width( imgW );
				DOM.img.height( height );
			} else {
				if ( arr[1] > imgH ){
					var width = ( imgH * arr[0] ) / arr[1];
					DOM.img.width( width );
					DOM.img.height( imgH );
				} else {
					DOM.img.width( imgW );
					DOM.img.height( imgH );
				}
			}
			return this;
		},
		
		//IE 6 兼容的设置
		_IE: function(){
		
			var DOM = this.DOM,
			    winX = $( window ).width() - 200,
				winY = $( window ).height() - 100,
				winP = winX - 300;
			
			DOM.wrap.css({
				'width': winX,
				'height': winY,
				'right':'auto',
				'bottom':'auto'
			});

			DOM.primary.width( winP ).height( winY );
			DOM.photo.width( winP - 20 ).height( winY - 60 - 20 );
			DOM.arrowLeft.width( winP / 2 );
			DOM.arrowRight.width( winP / 2 );
			DOM.list.width( winP ).children('div').width( winP - 60 );
			
			DOM.sidebar.height( winY );
			
			return this;
		},
		
		//DOM设置CSS
		_setCss: function(){
			var DOM = this.DOM,
			    zIndex = 9999,
				hei = $(document).height();
			
			DOM.wrap.css( 'z-index', zIndex );
			
			if ( this.IE6 ){
				this._IE();
			}
			
			DOM.lock.css({
				'position': 'absolute',
				'top': '0px',
				'left': '0px',
				'width': '100%',
				'height': hei,
				'opacity': 0.7,
				'background': '#000',
				'z-index': --zIndex
			});

			//解决IE下 图片无法剧中问题
			DOM.photo.css( 'height', ( DOM.primary.height() - 75 ) );
			
			return this;
		},

		//创建DOM
		_createDOM: function(){
			
			var tpl = document.createElement('div');

			tpl.innerHTML = QQPhoto.templates;
			tpl.className = 'ui-dialog-wrap';
			document.body.appendChild( tpl );
			
			$('body').append('<div id="ui-dialog-lock"></div>');

			var DOM = { wrap : $( tpl ), lock : $('#ui-dialog-lock') },
			    i = 0,
			    elem = tpl.getElementsByTagName('*');
			    elemLen = elem.length;

			for ( ; i < elemLen; i++ ){
				var name = elem[i].className.replace('ui-dialog-', '');
				if ( name ) DOM[name] = $( elem[i] );
			}

			return DOM;
		},
		
		//绑定移除事件
		_closeEvt: function(){
			var DOM = this.DOM;
			
			var removeDOM = function(){
				DOM.wrap.remove();
				DOM.lock.remove();
				delete QQPhoto;
			};
			
			DOM.close.bind( 'click', removeDOM );
			DOM.lock.bind( 'click', removeDOM );

			return this;
		}

	};

	//模板
	QQPhoto.templates =
		'<div class="ui-dialog-primary">' +
			'<div class="ui-dialog-photo">' +
				'<span></span>' +
				'<img class="ui-dialog-img" />' +
				'<a class="ui-dialog-arrowLeft" href="javascript:void(0);;"><em></em></a>' +
				'<a class="ui-dialog-arrowRight" href="javascript:void(0);;"><em></em></a>' +
				'<div class="ui-dialog-album">' +
					'<em class="ui-dialog-count"></em>' +
					'<div class="ui-dialog-title"></div>' +
				'</div>' +
			'</div>' +
			'<div class="ui-dialog-list">' +
				'<a href="javascript:void(0);" class="ui-dialog-thumbLeft"><span></span></a>' +
				'<a href="javascript:void(0);" class="ui-dialog-thumbRight"><span></span></a>' +
				'<div></div>' +
			'</div>' +
		'</div>' +
		'<div class="ui-dialog-sidebar">' +
			'<div class="ui-dialog-info ui-clearfix">' +
				'<img class="ui-dialog-avatar" width="50" height="50" />' +
				'<div class="ui-dialog-details">' +
					'<h3 class="ui-dialog-userName"></h3>' +
					'<p class="ui-dialog-time"></p>' +
				'</div>' +
				'<div class="ui-dialog-description"></div>' +
			'</div>' +
			'<div class="ui-dialog-form">' +
				'<textarea name="content" placeholder="\u8bf4\u70b9\u4ec0\u4e48\u5427\u002e\u002e\u002e" class="ui-dialog-msg"></textarea>' +
				'<input type="hidden" class="ui-dialog-pictureid" name="pictureid" value="" />' +
				'<p class="ui-dialog-msgInfo"></p>' +
				'<input type="submit" value="\u53d1\u8868" class="ui-dialog-submit" />' +
			'</div>' +
			'<div>' +
				'<ul class="ui-dialog-commentlist">' +
				'</ul>' +
			'</div>' +
		'</div>' +
		'<div class="ui-dialog-close">' +
			'<a href="javascript:;"></a>' +
		'</div>';
	
	//列表模板
	QQPhoto.li = '<li data-index="{index}"><a href="javascript:void(0);"><img src="{src}" width="50" height="50" /></a></li>';

	//留言模板
	QQPhoto.comment = 
		'<li>' +
			'<img class="thumb" src="{avatar}" width="30" height="30" />' +
			'<div class="comment-body">' +
				'<strong class="user-name">{user}</strong>' +
				'<p class="user-text">{msg}</p>' +
			'</div>' +
		'</li>';

	//初始化插件
	$.fn.QQPhoto = function( options ) {
		return this.each( function() {
			new QQPhoto( this, options );
		});
	};
	
	return $;

}( jQuery ));