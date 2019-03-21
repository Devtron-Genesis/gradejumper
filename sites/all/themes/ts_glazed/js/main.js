
/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */

(function($, undef) {
    'use strict';
    if ($.fn.dotdotdot) {
        return;
    }

    $.fn.dotdotdot = function(o) {
        if (this.length === 0) {
            $.fn.dotdotdot.debug('No element found for "' + this.selector + '".');
            return this;
        }
        if (this.length > 1) {
            return this.each(
                function() {
                    $(this).dotdotdot(o);
                }
            );
        }

        var $dot = this;
        var orgContent = $dot.contents();

        if ($dot.data('dotdotdot')) {
            $dot.trigger('destroy.dot');
        }

        $dot.data('dotdotdot-style', $dot.attr('style') || '');
        $dot.css('word-wrap', 'break-word');
        if ($dot.css('white-space') === 'nowrap') {
            $dot.css('white-space', 'normal');
        }

        $dot.bind_events = function() {
            $dot.bind(
                'update.dot',
                function(e, c) {
                    $dot.removeClass("is-truncated");
                    e.preventDefault();
                    e.stopPropagation();

                    switch (typeof opts.height) {
                        case 'number':
                            opts.maxHeight = opts.height;
                            break;

                        case 'function':
                            opts.maxHeight = opts.height.call($dot[0]);
                            break;

                        default:
                            opts.maxHeight = getTrueInnerHeight($dot);
                            break;
                    }

                    opts.maxHeight += opts.tolerance;

                    if (typeof c != 'undefined') {
                        if (typeof c == 'string' || ('nodeType' in c && c.nodeType === 1)) {
                            c = $('<div />').append(c).contents();
                        }
                        if (c instanceof $) {
                            orgContent = c;
                        }
                    }

                    $inr = $dot.wrapInner('<div class="dotdotdot" />').children();
                    $inr.contents()
                        .detach()
                        .end()
                        .append(orgContent.clone(true))
                        .find('br')
                        .replaceWith('  <br />  ')
                        .end()
                        .css({
                            'height': 'auto',
                            'width': 'auto',
                            'border': 'none',
                            'padding': 0,
                            'margin': 0
                        });

                    var after = false,
                        trunc = false;

                    if (conf.afterElement) {
                        after = conf.afterElement.clone(true);
                        after.show();
                        conf.afterElement.detach();
                    }

                    if (test($inr, opts)) {
                        if (opts.wrap == 'children') {
                            trunc = children($inr, opts, after);
                        } else {
                            trunc = ellipsis($inr, $dot, $inr, opts, after);
                        }
                    }
                    $inr.replaceWith($inr.contents());
                    $inr = null;

                    if ($.isFunction(opts.callback)) {
                        opts.callback.call($dot[0], trunc, orgContent);
                    }

                    conf.isTruncated = trunc;
                    return trunc;
                }

            ).bind(
                'isTruncated.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], conf.isTruncated);
                    }
                    return conf.isTruncated;
                }

            ).bind(
                'originalContent.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], orgContent);
                    }
                    return orgContent;
                }

            ).bind(
                'destroy.dot',
                function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $dot.unwatch()
                        .unbind_events()
                        .contents()
                        .detach()
                        .end()
                        .append(orgContent)
                        .attr('style', $dot.data('dotdotdot-style') || '')
                        .removeClass('is-truncated')
                        .data('dotdotdot', false);
                }
            );
            return $dot;
        }; //	/bind_events

        $dot.unbind_events = function() {
            $dot.unbind('.dot');
            return $dot;
        }; //	/unbind_events

        $dot.watch = function() {
            $dot.unwatch();
            if (opts.watch == 'window') {
                var $window = $(window),
                    _wWidth = $window.width(),
                    _wHeight = $window.height();

                $window.bind(
                    'resize.dot' + conf.dotId,
                    function() {
                        if (_wWidth != $window.width() || _wHeight != $window.height() || !opts.windowResizeFix) {
                            _wWidth = $window.width();
                            _wHeight = $window.height();

                            if (watchInt) {
                                clearInterval(watchInt);
                            }
                            watchInt = setTimeout(
                                function() {
                                    $dot.trigger('update.dot');
                                }, 100
                            );
                        }
                    }
                );
            } else {
                watchOrg = getSizes($dot);
                watchInt = setInterval(
                    function() {
                        if ($dot.is(':visible')) {
                            var watchNew = getSizes($dot);
                            if (watchOrg.width != watchNew.width ||
                                watchOrg.height != watchNew.height) {
                                $dot.trigger('update.dot');
                                watchOrg = watchNew;
                            }
                        }
                    }, 500
                );
            }
            return $dot;
        };
        $dot.unwatch = function() {
            $(window).unbind('resize.dot' + conf.dotId);
            if (watchInt) {
                clearInterval(watchInt);
            }
            return $dot;
        };

        var opts = $.extend(true, {}, $.fn.dotdotdot.defaults, o),
            conf = {},
            watchOrg = {},
            watchInt = null,
            $inr = null;


        if (!(opts.lastCharacter.remove instanceof Array)) {
            opts.lastCharacter.remove = $.fn.dotdotdot.defaultArrays.lastCharacter.remove;
        }
        if (!(opts.lastCharacter.noEllipsis instanceof Array)) {
            opts.lastCharacter.noEllipsis = $.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis;
        }


        conf.afterElement = getElement(opts.after, $dot);
        conf.isTruncated = false;
        conf.dotId = dotId++;


        $dot.data('dotdotdot', true)
            .bind_events()
            .trigger('update.dot');

        if (opts.watch) {
            $dot.watch();
        }

        return $dot;
    };


    //	public
    $.fn.dotdotdot.defaults = {
        'ellipsis': '... ',
        'wrap': 'word',
        'fallbackToLetter': true,
        'lastCharacter': {},
        'tolerance': 0,
        'callback': null,
        'after': null,
        'height': null,
        'watch': false,
        'windowResizeFix': true,
        'maxLength': null
    };
    $.fn.dotdotdot.defaultArrays = {
        'lastCharacter': {
            'remove': [' ', '\u3000', ',', ';', '.', '!', '?'],
            'noEllipsis': []
        }
    };
    $.fn.dotdotdot.debug = function(msg) {};


    //	private
    var dotId = 1;

    function children($elem, o, after) {
        var $elements = $elem.children(),
            isTruncated = false;

        $elem.empty();

        for (var a = 0, l = $elements.length; a < l; a++) {
            var $e = $elements.eq(a);
            $elem.append($e);
            if (after) {
                $elem.append(after);
            }
            if (test($elem, o)) {
                $e.remove();
                isTruncated = true;
                break;
            } else {
                if (after) {
                    after.detach();
                }
            }
        }
        return isTruncated;
    }

    function ellipsis($elem, $d, $i, o, after) {
        var isTruncated = false;

        //	Don't put the ellipsis directly inside these elements
        var notx = 'a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style';

        //	Don't remove these elements even if they are after the ellipsis
        var noty = 'script, .dotdotdot-keep';

        $elem
            .contents()
            .detach()
            .each(
                function() {

                    var e = this,
                        $e = $(e);

                    if (typeof e == 'undefined') {
                        return true;
                    } else if ($e.is(noty)) {
                        $elem.append($e);
                    } else if (isTruncated) {
                        return true;
                    } else {
                        $elem.append($e);
                        if (after && !$e.is(o.after) && !$e.find(o.after).length) {
                            $elem[$elem.is(notx) ? 'after' : 'append'](after);
                        }
                        if (test($i, o)) {
                            if (e.nodeType == 3) // node is TEXT
                            {
                                isTruncated = ellipsisElement($e, $d, $i, o, after);
                            } else {
                                isTruncated = ellipsis($e, $d, $i, o, after);
                            }
                        }

                        if (!isTruncated) {
                            if (after) {
                                after.detach();
                            }
                        }
                    }
                }
            );
        $d.addClass("is-truncated");
        return isTruncated;
    }

    function ellipsisElement($e, $d, $i, o, after) {
        var e = $e[0];

        if (!e) {
            return false;
        }

        var txt = getTextContent(e),
            space = (txt.indexOf(' ') !== -1) ? ' ' : '\u3000',
            separator = (o.wrap == 'letter') ? '' : space,
            textArr = txt.split(separator),
            position = -1,
            midPos = -1,
            startPos = 0,
            endPos = textArr.length - 1;


        //	Only one word
        if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
            separator = '';
            textArr = txt.split(separator);
            endPos = textArr.length - 1;
        }

        if (o.maxLength) {
            txt = addEllipsis(txt.trim().substr(0, o.maxLength), o);
            setTextContent(e, txt);
        } else {

            while (startPos <= endPos && !(startPos === 0 && endPos === 0)) {
                var m = Math.floor((startPos + endPos) / 2);
                if (m == midPos) {
                    break;
                }
                midPos = m;

                setTextContent(e, textArr.slice(0, midPos + 1).join(separator) + o.ellipsis);

                $i.children().each(function() {
                    $(this).toggle().toggle();
                });

                if (!test($i, o)) {
                    position = midPos;
                    startPos = midPos;
                } else {
                    endPos = midPos;

                    //	Fallback to letter
                    if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
                        separator = '';
                        textArr = textArr[0].split(separator);
                        position = -1;
                        midPos = -1;
                        startPos = 0;
                        endPos = textArr.length - 1;
                    }
                }
            }

            if (position != -1 && !(textArr.length === 1 && textArr[0].length === 0)) {
                txt = addEllipsis(textArr.slice(0, position + 1).join(separator), o);
                setTextContent(e, txt);
            } else {
                var $w = $e.parent();
                $e.detach();

                var afterLength = (after && after.closest($w).length) ? after.length : 0;

                if ($w.contents().length > afterLength) {
                    e = findLastTextNode($w.contents().eq(-1 - afterLength), $d);
                } else {
                    e = findLastTextNode($w, $d, true);
                    if (!afterLength) {
                        $w.detach();
                    }
                }
                if (e) {
                    txt = addEllipsis(getTextContent(e), o);
                    setTextContent(e, txt);
                    if (afterLength && after) {
                        var $parent = after.parent();

                        $(e).parent().append(after);

                        if (!$.trim($parent.html())) {
                            $parent.remove();
                        }
                    }
                }
            }
        }

        return true;
    }

    function test($i, o) {
        return ($i.innerHeight() > o.maxHeight || (o.maxLength && $i.text().trim().length > o.maxLength));
    }

    function addEllipsis(txt, o) {
        while ($.inArray(txt.slice(-1), o.lastCharacter.remove) > -1) {
            txt = txt.slice(0, -1);
        }
        if ($.inArray(txt.slice(-1), o.lastCharacter.noEllipsis) < 0) {
            txt += o.ellipsis;
        }
        return txt;
    }

    function getSizes($d) {
        return {
            'width': $d.innerWidth(),
            'height': $d.innerHeight()
        };
    }

    function setTextContent(e, content) {
        if (e.innerText) {
            e.innerText = content;
        } else if (e.nodeValue) {
            e.nodeValue = content;
        } else if (e.textContent) {
            e.textContent = content;
        }

    }

    function getTextContent(e) {
        if (e.innerText) {
            return e.innerText;
        } else if (e.nodeValue) {
            return e.nodeValue;
        } else if (e.textContent) {
            return e.textContent;
        } else {
            return "";
        }
    }

    function getPrevNode(n) {
        do {
            n = n.previousSibling;
        }
        while (n && n.nodeType !== 1 && n.nodeType !== 3);

        return n;
    }

    function findLastTextNode($el, $top, excludeCurrent) {
        var e = $el && $el[0],
            p;
        if (e) {
            if (!excludeCurrent) {
                if (e.nodeType === 3) {
                    return e;
                }
                if ($.trim($el.text())) {
                    return findLastTextNode($el.contents().last(), $top);
                }
            }
            p = getPrevNode(e);
            while (!p) {
                $el = $el.parent();
                if ($el.is($top) || !$el.length) {
                    return false;
                }
                p = getPrevNode($el[0]);
            }
            if (p) {
                return findLastTextNode($(p), $top);
            }
        }
        return false;
    }

    function getElement(e, $i) {
        if (!e) {
            return false;
        }
        if (typeof e === 'string') {
            e = $(e, $i);
            return (e.length) ?
                e :
                false;
        }
        return !e.jquery ?
            false :
            e;
    }

    function getTrueInnerHeight($el) {
        var h = $el.innerHeight(),
            a = ['paddingTop', 'paddingBottom'];

        for (var z = 0, l = a.length; z < l; z++) {
            var m = parseInt($el.css(a[z]), 10);
            if (isNaN(m)) {
                m = 0;
            }
            h -= m;
        }
        return h;
    }


    //	override jQuery.html
    var _orgHtml = $.fn.html;
    $.fn.html = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            return this.trigger('update', [str]);
        }
        return _orgHtml.apply(this, arguments);
    };


    //	override jQuery.text
    var _orgText = $.fn.text;
    $.fn.text = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            str = $('<div />').text(str).html();
            return this.trigger('update', [str]);
        }
        return _orgText.apply(this, arguments);
    };


})(jQuery);

/*

## Automatic parsing for CSS classes
Contributed by [Ramil Valitov](https://github.com/rvalitov)

### The idea
You can add one or several CSS classes to HTML elements to automatically invoke "jQuery.dotdotdot functionality" and some extra features. It allows to use jQuery.dotdotdot only by adding appropriate CSS classes without JS programming.

### Available classes and their description
* dot-ellipsis - automatically invoke jQuery.dotdotdot to this element. This class must be included if you plan to use other classes below.
* dot-resize-update - automatically update if window resize event occurs. It's equivalent to option `watch:'window'`.
* dot-timer-update - automatically update at regular intervals using setInterval. It's equivalent to option `watch:true`.
* dot-load-update - automatically update after the window has beem completely rendered. Can be useful if your content is generated dynamically using using JS and, hence, jQuery.dotdotdot can't correctly detect the height of the element before it's rendered completely.
* dot-height-XXX - available height of content area in pixels, where XXX is a number, e.g. can be `dot-height-35` if you want to set maximum height for 35 pixels. It's equivalent to option `height:'XXX'`.

### Usage examples
*Adding jQuery.dotdotdot to element*

	<div class="dot-ellipsis">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with update on window resize*

	<div class="dot-ellipsis dot-resize-update">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with predefined height of 50px*

	<div class="dot-ellipsis dot-height-50">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*/

jQuery(document).ready(function($) {
    //We only invoke jQuery.dotdotdot on elements that have dot-ellipsis class
    $(".dot-ellipsis").each(function() {
        //Checking if update on window resize required
        var watch_window = $(this).hasClass("dot-resize-update");

        //Checking if update on timer required
        var watch_timer = $(this).hasClass("dot-timer-update");

        //Checking if height set
        var height = 0;
        var classList = $(this).attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            var matchResult = item.match(/^dot-height-(\d+)$/);
            if (matchResult !== null)
                height = Number(matchResult[1]);
        });

        //Invoking jQuery.dotdotdot
        var x = {};
        if (watch_timer)
            x.watch = true;
        if (watch_window)
            x.watch = 'window';
        if (height > 0)
            x.height = height;
        $(this).dotdotdot(x);
    });
});

//Updating elements (if any) on window.load event
jQuery(window).on('load', function() {
    jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot");
});

;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jQuery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jQuery'));
  } else {
    root.jquery_dotdotdot_min_js = factory(root.jQuery);
  }
}(this, function(jQuery) {
/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */
!function(t,e){"use strict";function n(t,e,n){var r=t.children(),a=!1;t.empty();for(var i=0,d=r.length;i<d;i++){var l=r.eq(i);if(t.append(l),n&&t.append(n),o(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function r(e,n,i,d,l){var s=!1,c="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(s)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(c)?"after":"append"](l),o(i,d)&&(s=3==h.nodeType?a(f,n,i,d,l):r(f,n,i,d,l)),s||l&&l.detach()}}),n.addClass("is-truncated"),s}function a(e,n,r,a,d){var c=e[0];if(!c)return!1;var h=s(c),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,w=-1,m=0,b=g.length-1;if(a.fallbackToLetter&&0===m&&0===b&&(p="",g=h.split(p),b=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(c,h);else{for(;m<=b&&(0!==m||0!==b);){var y=Math.floor((m+b)/2);if(y==w)break;w=y,l(c,g.slice(0,w+1).join(p)+a.ellipsis),r.children().each(function(){t(this).toggle().toggle()}),o(r,a)?(b=w,a.fallbackToLetter&&0===m&&0===b&&(p="",g=g[0].split(p),v=-1,w=-1,m=0,b=g.length-1)):(v=w,m=w)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?c=u(x.contents().eq(-1-C),n):(c=u(x,n,!0),C||x.detach()),c&&(h=i(s(c),a),l(c,h),C&&d)){var T=d.parent();t(c).parent().append(d),t.trim(T.html())||T.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(c,h)}return!0}function o(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function s(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function c(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,r){var a,o=e&&e[0];if(o){if(!r){if(3===o.nodeType)return o;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=c(o);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=c(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],r=0,a=n.length;r<a;r++){var o=parseInt(t.css(n[r]),10);isNaN(o)&&(o=0),e-=o}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var c=!1,u=!1;return s.afterElement&&(c=s.afterElement.clone(!0),c.show(),s.afterElement.detach()),o(g,l)&&(u="children"==l.wrap?n(g,l,c):r(g,a,g,l,c)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),s.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],s.isTruncated),s.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),r=e.height();e.bind("resize.dot"+s.dotId,function(){n==e.width()&&r==e.height()&&l.windowResizeFix||(n=e.width(),r=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else c=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);c.width==t.width&&c.height==t.height||(a.trigger("update.dot"),c=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+s.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),s={},c={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),s.afterElement=h(l.after,a),s.isTruncated=!1,s.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),r=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(r=Number(n[1]))});var o={};n&&(o.watch=!0),e&&(o.watch="window"),r>0&&(o.height=r),t(this).dotdotdot(o)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")});
return true;
}));


/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */

(function($, undef) {
    'use strict';
    if ($.fn.dotdotdot) {
        return;
    }

    $.fn.dotdotdot = function(o) {
        if (this.length === 0) {
            $.fn.dotdotdot.debug('No element found for "' + this.selector + '".');
            return this;
        }
        if (this.length > 1) {
            return this.each(
                function() {
                    $(this).dotdotdot(o);
                }
            );
        }

        var $dot = this;
        var orgContent = $dot.contents();

        if ($dot.data('dotdotdot')) {
            $dot.trigger('destroy.dot');
        }

        $dot.data('dotdotdot-style', $dot.attr('style') || '');
        $dot.css('word-wrap', 'break-word');
        if ($dot.css('white-space') === 'nowrap') {
            $dot.css('white-space', 'normal');
        }

        $dot.bind_events = function() {
            $dot.bind(
                'update.dot',
                function(e, c) {
                    $dot.removeClass("is-truncated");
                    e.preventDefault();
                    e.stopPropagation();

                    switch (typeof opts.height) {
                        case 'number':
                            opts.maxHeight = opts.height;
                            break;

                        case 'function':
                            opts.maxHeight = opts.height.call($dot[0]);
                            break;

                        default:
                            opts.maxHeight = getTrueInnerHeight($dot);
                            break;
                    }

                    opts.maxHeight += opts.tolerance;

                    if (typeof c != 'undefined') {
                        if (typeof c == 'string' || ('nodeType' in c && c.nodeType === 1)) {
                            c = $('<div />').append(c).contents();
                        }
                        if (c instanceof $) {
                            orgContent = c;
                        }
                    }

                    $inr = $dot.wrapInner('<div class="dotdotdot" />').children();
                    $inr.contents()
                        .detach()
                        .end()
                        .append(orgContent.clone(true))
                        .find('br')
                        .replaceWith('  <br />  ')
                        .end()
                        .css({
                            'height': 'auto',
                            'width': 'auto',
                            'border': 'none',
                            'padding': 0,
                            'margin': 0
                        });

                    var after = false,
                        trunc = false;

                    if (conf.afterElement) {
                        after = conf.afterElement.clone(true);
                        after.show();
                        conf.afterElement.detach();
                    }

                    if (test($inr, opts)) {
                        if (opts.wrap == 'children') {
                            trunc = children($inr, opts, after);
                        } else {
                            trunc = ellipsis($inr, $dot, $inr, opts, after);
                        }
                    }
                    $inr.replaceWith($inr.contents());
                    $inr = null;

                    if ($.isFunction(opts.callback)) {
                        opts.callback.call($dot[0], trunc, orgContent);
                    }

                    conf.isTruncated = trunc;
                    return trunc;
                }

            ).bind(
                'isTruncated.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], conf.isTruncated);
                    }
                    return conf.isTruncated;
                }

            ).bind(
                'originalContent.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], orgContent);
                    }
                    return orgContent;
                }

            ).bind(
                'destroy.dot',
                function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $dot.unwatch()
                        .unbind_events()
                        .contents()
                        .detach()
                        .end()
                        .append(orgContent)
                        .attr('style', $dot.data('dotdotdot-style') || '')
                        .removeClass('is-truncated')
                        .data('dotdotdot', false);
                }
            );
            return $dot;
        }; //	/bind_events

        $dot.unbind_events = function() {
            $dot.unbind('.dot');
            return $dot;
        }; //	/unbind_events

        $dot.watch = function() {
            $dot.unwatch();
            if (opts.watch == 'window') {
                var $window = $(window),
                    _wWidth = $window.width(),
                    _wHeight = $window.height();

                $window.bind(
                    'resize.dot' + conf.dotId,
                    function() {
                        if (_wWidth != $window.width() || _wHeight != $window.height() || !opts.windowResizeFix) {
                            _wWidth = $window.width();
                            _wHeight = $window.height();

                            if (watchInt) {
                                clearInterval(watchInt);
                            }
                            watchInt = setTimeout(
                                function() {
                                    $dot.trigger('update.dot');
                                }, 100
                            );
                        }
                    }
                );
            } else {
                watchOrg = getSizes($dot);
                watchInt = setInterval(
                    function() {
                        if ($dot.is(':visible')) {
                            var watchNew = getSizes($dot);
                            if (watchOrg.width != watchNew.width ||
                                watchOrg.height != watchNew.height) {
                                $dot.trigger('update.dot');
                                watchOrg = watchNew;
                            }
                        }
                    }, 500
                );
            }
            return $dot;
        };
        $dot.unwatch = function() {
            $(window).unbind('resize.dot' + conf.dotId);
            if (watchInt) {
                clearInterval(watchInt);
            }
            return $dot;
        };

        var opts = $.extend(true, {}, $.fn.dotdotdot.defaults, o),
            conf = {},
            watchOrg = {},
            watchInt = null,
            $inr = null;


        if (!(opts.lastCharacter.remove instanceof Array)) {
            opts.lastCharacter.remove = $.fn.dotdotdot.defaultArrays.lastCharacter.remove;
        }
        if (!(opts.lastCharacter.noEllipsis instanceof Array)) {
            opts.lastCharacter.noEllipsis = $.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis;
        }


        conf.afterElement = getElement(opts.after, $dot);
        conf.isTruncated = false;
        conf.dotId = dotId++;


        $dot.data('dotdotdot', true)
            .bind_events()
            .trigger('update.dot');

        if (opts.watch) {
            $dot.watch();
        }

        return $dot;
    };


    //	public
    $.fn.dotdotdot.defaults = {
        'ellipsis': '... ',
        'wrap': 'word',
        'fallbackToLetter': true,
        'lastCharacter': {},
        'tolerance': 0,
        'callback': null,
        'after': null,
        'height': null,
        'watch': false,
        'windowResizeFix': true,
        'maxLength': null
    };
    $.fn.dotdotdot.defaultArrays = {
        'lastCharacter': {
            'remove': [' ', '\u3000', ',', ';', '.', '!', '?'],
            'noEllipsis': []
        }
    };
    $.fn.dotdotdot.debug = function(msg) {};


    //	private
    var dotId = 1;

    function children($elem, o, after) {
        var $elements = $elem.children(),
            isTruncated = false;

        $elem.empty();

        for (var a = 0, l = $elements.length; a < l; a++) {
            var $e = $elements.eq(a);
            $elem.append($e);
            if (after) {
                $elem.append(after);
            }
            if (test($elem, o)) {
                $e.remove();
                isTruncated = true;
                break;
            } else {
                if (after) {
                    after.detach();
                }
            }
        }
        return isTruncated;
    }

    function ellipsis($elem, $d, $i, o, after) {
        var isTruncated = false;

        //	Don't put the ellipsis directly inside these elements
        var notx = 'a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style';

        //	Don't remove these elements even if they are after the ellipsis
        var noty = 'script, .dotdotdot-keep';

        $elem
            .contents()
            .detach()
            .each(
                function() {

                    var e = this,
                        $e = $(e);

                    if (typeof e == 'undefined') {
                        return true;
                    } else if ($e.is(noty)) {
                        $elem.append($e);
                    } else if (isTruncated) {
                        return true;
                    } else {
                        $elem.append($e);
                        if (after && !$e.is(o.after) && !$e.find(o.after).length) {
                            $elem[$elem.is(notx) ? 'after' : 'append'](after);
                        }
                        if (test($i, o)) {
                            if (e.nodeType == 3) // node is TEXT
                            {
                                isTruncated = ellipsisElement($e, $d, $i, o, after);
                            } else {
                                isTruncated = ellipsis($e, $d, $i, o, after);
                            }
                        }

                        if (!isTruncated) {
                            if (after) {
                                after.detach();
                            }
                        }
                    }
                }
            );
        $d.addClass("is-truncated");
        return isTruncated;
    }

    function ellipsisElement($e, $d, $i, o, after) {
        var e = $e[0];

        if (!e) {
            return false;
        }

        var txt = getTextContent(e),
            space = (txt.indexOf(' ') !== -1) ? ' ' : '\u3000',
            separator = (o.wrap == 'letter') ? '' : space,
            textArr = txt.split(separator),
            position = -1,
            midPos = -1,
            startPos = 0,
            endPos = textArr.length - 1;


        //	Only one word
        if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
            separator = '';
            textArr = txt.split(separator);
            endPos = textArr.length - 1;
        }

        if (o.maxLength) {
            txt = addEllipsis(txt.trim().substr(0, o.maxLength), o);
            setTextContent(e, txt);
        } else {

            while (startPos <= endPos && !(startPos === 0 && endPos === 0)) {
                var m = Math.floor((startPos + endPos) / 2);
                if (m == midPos) {
                    break;
                }
                midPos = m;

                setTextContent(e, textArr.slice(0, midPos + 1).join(separator) + o.ellipsis);

                $i.children().each(function() {
                    $(this).toggle().toggle();
                });

                if (!test($i, o)) {
                    position = midPos;
                    startPos = midPos;
                } else {
                    endPos = midPos;

                    //	Fallback to letter
                    if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
                        separator = '';
                        textArr = textArr[0].split(separator);
                        position = -1;
                        midPos = -1;
                        startPos = 0;
                        endPos = textArr.length - 1;
                    }
                }
            }

            if (position != -1 && !(textArr.length === 1 && textArr[0].length === 0)) {
                txt = addEllipsis(textArr.slice(0, position + 1).join(separator), o);
                setTextContent(e, txt);
            } else {
                var $w = $e.parent();
                $e.detach();

                var afterLength = (after && after.closest($w).length) ? after.length : 0;

                if ($w.contents().length > afterLength) {
                    e = findLastTextNode($w.contents().eq(-1 - afterLength), $d);
                } else {
                    e = findLastTextNode($w, $d, true);
                    if (!afterLength) {
                        $w.detach();
                    }
                }
                if (e) {
                    txt = addEllipsis(getTextContent(e), o);
                    setTextContent(e, txt);
                    if (afterLength && after) {
                        var $parent = after.parent();

                        $(e).parent().append(after);

                        if (!$.trim($parent.html())) {
                            $parent.remove();
                        }
                    }
                }
            }
        }

        return true;
    }

    function test($i, o) {
        return ($i.innerHeight() > o.maxHeight || (o.maxLength && $i.text().trim().length > o.maxLength));
    }

    function addEllipsis(txt, o) {
        while ($.inArray(txt.slice(-1), o.lastCharacter.remove) > -1) {
            txt = txt.slice(0, -1);
        }
        if ($.inArray(txt.slice(-1), o.lastCharacter.noEllipsis) < 0) {
            txt += o.ellipsis;
        }
        return txt;
    }

    function getSizes($d) {
        return {
            'width': $d.innerWidth(),
            'height': $d.innerHeight()
        };
    }

    function setTextContent(e, content) {
        if (e.innerText) {
            e.innerText = content;
        } else if (e.nodeValue) {
            e.nodeValue = content;
        } else if (e.textContent) {
            e.textContent = content;
        }

    }

    function getTextContent(e) {
        if (e.innerText) {
            return e.innerText;
        } else if (e.nodeValue) {
            return e.nodeValue;
        } else if (e.textContent) {
            return e.textContent;
        } else {
            return "";
        }
    }

    function getPrevNode(n) {
        do {
            n = n.previousSibling;
        }
        while (n && n.nodeType !== 1 && n.nodeType !== 3);

        return n;
    }

    function findLastTextNode($el, $top, excludeCurrent) {
        var e = $el && $el[0],
            p;
        if (e) {
            if (!excludeCurrent) {
                if (e.nodeType === 3) {
                    return e;
                }
                if ($.trim($el.text())) {
                    return findLastTextNode($el.contents().last(), $top);
                }
            }
            p = getPrevNode(e);
            while (!p) {
                $el = $el.parent();
                if ($el.is($top) || !$el.length) {
                    return false;
                }
                p = getPrevNode($el[0]);
            }
            if (p) {
                return findLastTextNode($(p), $top);
            }
        }
        return false;
    }

    function getElement(e, $i) {
        if (!e) {
            return false;
        }
        if (typeof e === 'string') {
            e = $(e, $i);
            return (e.length) ?
                e :
                false;
        }
        return !e.jquery ?
            false :
            e;
    }

    function getTrueInnerHeight($el) {
        var h = $el.innerHeight(),
            a = ['paddingTop', 'paddingBottom'];

        for (var z = 0, l = a.length; z < l; z++) {
            var m = parseInt($el.css(a[z]), 10);
            if (isNaN(m)) {
                m = 0;
            }
            h -= m;
        }
        return h;
    }


    //	override jQuery.html
    var _orgHtml = $.fn.html;
    $.fn.html = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            return this.trigger('update', [str]);
        }
        return _orgHtml.apply(this, arguments);
    };


    //	override jQuery.text
    var _orgText = $.fn.text;
    $.fn.text = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            str = $('<div />').text(str).html();
            return this.trigger('update', [str]);
        }
        return _orgText.apply(this, arguments);
    };


})(jQuery);

/*

## Automatic parsing for CSS classes
Contributed by [Ramil Valitov](https://github.com/rvalitov)

### The idea
You can add one or several CSS classes to HTML elements to automatically invoke "jQuery.dotdotdot functionality" and some extra features. It allows to use jQuery.dotdotdot only by adding appropriate CSS classes without JS programming.

### Available classes and their description
* dot-ellipsis - automatically invoke jQuery.dotdotdot to this element. This class must be included if you plan to use other classes below.
* dot-resize-update - automatically update if window resize event occurs. It's equivalent to option `watch:'window'`.
* dot-timer-update - automatically update at regular intervals using setInterval. It's equivalent to option `watch:true`.
* dot-load-update - automatically update after the window has beem completely rendered. Can be useful if your content is generated dynamically using using JS and, hence, jQuery.dotdotdot can't correctly detect the height of the element before it's rendered completely.
* dot-height-XXX - available height of content area in pixels, where XXX is a number, e.g. can be `dot-height-35` if you want to set maximum height for 35 pixels. It's equivalent to option `height:'XXX'`.

### Usage examples
*Adding jQuery.dotdotdot to element*

	<div class="dot-ellipsis">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with update on window resize*

	<div class="dot-ellipsis dot-resize-update">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with predefined height of 50px*

	<div class="dot-ellipsis dot-height-50">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*/

jQuery(document).ready(function($) {
    //We only invoke jQuery.dotdotdot on elements that have dot-ellipsis class
    $(".dot-ellipsis").each(function() {
        //Checking if update on window resize required
        var watch_window = $(this).hasClass("dot-resize-update");

        //Checking if update on timer required
        var watch_timer = $(this).hasClass("dot-timer-update");

        //Checking if height set
        var height = 0;
        var classList = $(this).attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            var matchResult = item.match(/^dot-height-(\d+)$/);
            if (matchResult !== null)
                height = Number(matchResult[1]);
        });

        //Invoking jQuery.dotdotdot
        var x = {};
        if (watch_timer)
            x.watch = true;
        if (watch_window)
            x.watch = 'window';
        if (height > 0)
            x.height = height;
        $(this).dotdotdot(x);
    });
});

//Updating elements (if any) on window.load event
jQuery(window).on('load', function() {
    jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot");
});

;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jQuery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jQuery'));
  } else {
    root.jquery_dotdotdot_min_js = factory(root.jQuery);
  }
}(this, function(jQuery) {
/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */
!function(t,e){"use strict";function n(t,e,n){var r=t.children(),a=!1;t.empty();for(var i=0,d=r.length;i<d;i++){var l=r.eq(i);if(t.append(l),n&&t.append(n),o(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function r(e,n,i,d,l){var s=!1,c="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(s)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(c)?"after":"append"](l),o(i,d)&&(s=3==h.nodeType?a(f,n,i,d,l):r(f,n,i,d,l)),s||l&&l.detach()}}),n.addClass("is-truncated"),s}function a(e,n,r,a,d){var c=e[0];if(!c)return!1;var h=s(c),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,w=-1,m=0,b=g.length-1;if(a.fallbackToLetter&&0===m&&0===b&&(p="",g=h.split(p),b=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(c,h);else{for(;m<=b&&(0!==m||0!==b);){var y=Math.floor((m+b)/2);if(y==w)break;w=y,l(c,g.slice(0,w+1).join(p)+a.ellipsis),r.children().each(function(){t(this).toggle().toggle()}),o(r,a)?(b=w,a.fallbackToLetter&&0===m&&0===b&&(p="",g=g[0].split(p),v=-1,w=-1,m=0,b=g.length-1)):(v=w,m=w)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?c=u(x.contents().eq(-1-C),n):(c=u(x,n,!0),C||x.detach()),c&&(h=i(s(c),a),l(c,h),C&&d)){var T=d.parent();t(c).parent().append(d),t.trim(T.html())||T.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(c,h)}return!0}function o(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function s(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function c(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,r){var a,o=e&&e[0];if(o){if(!r){if(3===o.nodeType)return o;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=c(o);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=c(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],r=0,a=n.length;r<a;r++){var o=parseInt(t.css(n[r]),10);isNaN(o)&&(o=0),e-=o}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var c=!1,u=!1;return s.afterElement&&(c=s.afterElement.clone(!0),c.show(),s.afterElement.detach()),o(g,l)&&(u="children"==l.wrap?n(g,l,c):r(g,a,g,l,c)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),s.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],s.isTruncated),s.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),r=e.height();e.bind("resize.dot"+s.dotId,function(){n==e.width()&&r==e.height()&&l.windowResizeFix||(n=e.width(),r=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else c=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);c.width==t.width&&c.height==t.height||(a.trigger("update.dot"),c=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+s.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),s={},c={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),s.afterElement=h(l.after,a),s.isTruncated=!1,s.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),r=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(r=Number(n[1]))});var o={};n&&(o.watch=!0),e&&(o.watch="window"),r>0&&(o.height=r),t(this).dotdotdot(o)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")});
return true;
}));


/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */

(function($, undef) {
    'use strict';
    if ($.fn.dotdotdot) {
        return;
    }

    $.fn.dotdotdot = function(o) {
        if (this.length === 0) {
            $.fn.dotdotdot.debug('No element found for "' + this.selector + '".');
            return this;
        }
        if (this.length > 1) {
            return this.each(
                function() {
                    $(this).dotdotdot(o);
                }
            );
        }

        var $dot = this;
        var orgContent = $dot.contents();

        if ($dot.data('dotdotdot')) {
            $dot.trigger('destroy.dot');
        }

        $dot.data('dotdotdot-style', $dot.attr('style') || '');
        $dot.css('word-wrap', 'break-word');
        if ($dot.css('white-space') === 'nowrap') {
            $dot.css('white-space', 'normal');
        }

        $dot.bind_events = function() {
            $dot.bind(
                'update.dot',
                function(e, c) {
                    $dot.removeClass("is-truncated");
                    e.preventDefault();
                    e.stopPropagation();

                    switch (typeof opts.height) {
                        case 'number':
                            opts.maxHeight = opts.height;
                            break;

                        case 'function':
                            opts.maxHeight = opts.height.call($dot[0]);
                            break;

                        default:
                            opts.maxHeight = getTrueInnerHeight($dot);
                            break;
                    }

                    opts.maxHeight += opts.tolerance;

                    if (typeof c != 'undefined') {
                        if (typeof c == 'string' || ('nodeType' in c && c.nodeType === 1)) {
                            c = $('<div />').append(c).contents();
                        }
                        if (c instanceof $) {
                            orgContent = c;
                        }
                    }

                    $inr = $dot.wrapInner('<div class="dotdotdot" />').children();
                    $inr.contents()
                        .detach()
                        .end()
                        .append(orgContent.clone(true))
                        .find('br')
                        .replaceWith('  <br />  ')
                        .end()
                        .css({
                            'height': 'auto',
                            'width': 'auto',
                            'border': 'none',
                            'padding': 0,
                            'margin': 0
                        });

                    var after = false,
                        trunc = false;

                    if (conf.afterElement) {
                        after = conf.afterElement.clone(true);
                        after.show();
                        conf.afterElement.detach();
                    }

                    if (test($inr, opts)) {
                        if (opts.wrap == 'children') {
                            trunc = children($inr, opts, after);
                        } else {
                            trunc = ellipsis($inr, $dot, $inr, opts, after);
                        }
                    }
                    $inr.replaceWith($inr.contents());
                    $inr = null;

                    if ($.isFunction(opts.callback)) {
                        opts.callback.call($dot[0], trunc, orgContent);
                    }

                    conf.isTruncated = trunc;
                    return trunc;
                }

            ).bind(
                'isTruncated.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], conf.isTruncated);
                    }
                    return conf.isTruncated;
                }

            ).bind(
                'originalContent.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], orgContent);
                    }
                    return orgContent;
                }

            ).bind(
                'destroy.dot',
                function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $dot.unwatch()
                        .unbind_events()
                        .contents()
                        .detach()
                        .end()
                        .append(orgContent)
                        .attr('style', $dot.data('dotdotdot-style') || '')
                        .removeClass('is-truncated')
                        .data('dotdotdot', false);
                }
            );
            return $dot;
        }; //	/bind_events

        $dot.unbind_events = function() {
            $dot.unbind('.dot');
            return $dot;
        }; //	/unbind_events

        $dot.watch = function() {
            $dot.unwatch();
            if (opts.watch == 'window') {
                var $window = $(window),
                    _wWidth = $window.width(),
                    _wHeight = $window.height();

                $window.bind(
                    'resize.dot' + conf.dotId,
                    function() {
                        if (_wWidth != $window.width() || _wHeight != $window.height() || !opts.windowResizeFix) {
                            _wWidth = $window.width();
                            _wHeight = $window.height();

                            if (watchInt) {
                                clearInterval(watchInt);
                            }
                            watchInt = setTimeout(
                                function() {
                                    $dot.trigger('update.dot');
                                }, 100
                            );
                        }
                    }
                );
            } else {
                watchOrg = getSizes($dot);
                watchInt = setInterval(
                    function() {
                        if ($dot.is(':visible')) {
                            var watchNew = getSizes($dot);
                            if (watchOrg.width != watchNew.width ||
                                watchOrg.height != watchNew.height) {
                                $dot.trigger('update.dot');
                                watchOrg = watchNew;
                            }
                        }
                    }, 500
                );
            }
            return $dot;
        };
        $dot.unwatch = function() {
            $(window).unbind('resize.dot' + conf.dotId);
            if (watchInt) {
                clearInterval(watchInt);
            }
            return $dot;
        };

        var opts = $.extend(true, {}, $.fn.dotdotdot.defaults, o),
            conf = {},
            watchOrg = {},
            watchInt = null,
            $inr = null;


        if (!(opts.lastCharacter.remove instanceof Array)) {
            opts.lastCharacter.remove = $.fn.dotdotdot.defaultArrays.lastCharacter.remove;
        }
        if (!(opts.lastCharacter.noEllipsis instanceof Array)) {
            opts.lastCharacter.noEllipsis = $.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis;
        }


        conf.afterElement = getElement(opts.after, $dot);
        conf.isTruncated = false;
        conf.dotId = dotId++;


        $dot.data('dotdotdot', true)
            .bind_events()
            .trigger('update.dot');

        if (opts.watch) {
            $dot.watch();
        }

        return $dot;
    };


    //	public
    $.fn.dotdotdot.defaults = {
        'ellipsis': '... ',
        'wrap': 'word',
        'fallbackToLetter': true,
        'lastCharacter': {},
        'tolerance': 0,
        'callback': null,
        'after': null,
        'height': null,
        'watch': false,
        'windowResizeFix': true,
        'maxLength': null
    };
    $.fn.dotdotdot.defaultArrays = {
        'lastCharacter': {
            'remove': [' ', '\u3000', ',', ';', '.', '!', '?'],
            'noEllipsis': []
        }
    };
    $.fn.dotdotdot.debug = function(msg) {};


    //	private
    var dotId = 1;

    function children($elem, o, after) {
        var $elements = $elem.children(),
            isTruncated = false;

        $elem.empty();

        for (var a = 0, l = $elements.length; a < l; a++) {
            var $e = $elements.eq(a);
            $elem.append($e);
            if (after) {
                $elem.append(after);
            }
            if (test($elem, o)) {
                $e.remove();
                isTruncated = true;
                break;
            } else {
                if (after) {
                    after.detach();
                }
            }
        }
        return isTruncated;
    }

    function ellipsis($elem, $d, $i, o, after) {
        var isTruncated = false;

        //	Don't put the ellipsis directly inside these elements
        var notx = 'a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style';

        //	Don't remove these elements even if they are after the ellipsis
        var noty = 'script, .dotdotdot-keep';

        $elem
            .contents()
            .detach()
            .each(
                function() {

                    var e = this,
                        $e = $(e);

                    if (typeof e == 'undefined') {
                        return true;
                    } else if ($e.is(noty)) {
                        $elem.append($e);
                    } else if (isTruncated) {
                        return true;
                    } else {
                        $elem.append($e);
                        if (after && !$e.is(o.after) && !$e.find(o.after).length) {
                            $elem[$elem.is(notx) ? 'after' : 'append'](after);
                        }
                        if (test($i, o)) {
                            if (e.nodeType == 3) // node is TEXT
                            {
                                isTruncated = ellipsisElement($e, $d, $i, o, after);
                            } else {
                                isTruncated = ellipsis($e, $d, $i, o, after);
                            }
                        }

                        if (!isTruncated) {
                            if (after) {
                                after.detach();
                            }
                        }
                    }
                }
            );
        $d.addClass("is-truncated");
        return isTruncated;
    }

    function ellipsisElement($e, $d, $i, o, after) {
        var e = $e[0];

        if (!e) {
            return false;
        }

        var txt = getTextContent(e),
            space = (txt.indexOf(' ') !== -1) ? ' ' : '\u3000',
            separator = (o.wrap == 'letter') ? '' : space,
            textArr = txt.split(separator),
            position = -1,
            midPos = -1,
            startPos = 0,
            endPos = textArr.length - 1;


        //	Only one word
        if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
            separator = '';
            textArr = txt.split(separator);
            endPos = textArr.length - 1;
        }

        if (o.maxLength) {
            txt = addEllipsis(txt.trim().substr(0, o.maxLength), o);
            setTextContent(e, txt);
        } else {

            while (startPos <= endPos && !(startPos === 0 && endPos === 0)) {
                var m = Math.floor((startPos + endPos) / 2);
                if (m == midPos) {
                    break;
                }
                midPos = m;

                setTextContent(e, textArr.slice(0, midPos + 1).join(separator) + o.ellipsis);

                $i.children().each(function() {
                    $(this).toggle().toggle();
                });

                if (!test($i, o)) {
                    position = midPos;
                    startPos = midPos;
                } else {
                    endPos = midPos;

                    //	Fallback to letter
                    if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
                        separator = '';
                        textArr = textArr[0].split(separator);
                        position = -1;
                        midPos = -1;
                        startPos = 0;
                        endPos = textArr.length - 1;
                    }
                }
            }

            if (position != -1 && !(textArr.length === 1 && textArr[0].length === 0)) {
                txt = addEllipsis(textArr.slice(0, position + 1).join(separator), o);
                setTextContent(e, txt);
            } else {
                var $w = $e.parent();
                $e.detach();

                var afterLength = (after && after.closest($w).length) ? after.length : 0;

                if ($w.contents().length > afterLength) {
                    e = findLastTextNode($w.contents().eq(-1 - afterLength), $d);
                } else {
                    e = findLastTextNode($w, $d, true);
                    if (!afterLength) {
                        $w.detach();
                    }
                }
                if (e) {
                    txt = addEllipsis(getTextContent(e), o);
                    setTextContent(e, txt);
                    if (afterLength && after) {
                        var $parent = after.parent();

                        $(e).parent().append(after);

                        if (!$.trim($parent.html())) {
                            $parent.remove();
                        }
                    }
                }
            }
        }

        return true;
    }

    function test($i, o) {
        return ($i.innerHeight() > o.maxHeight || (o.maxLength && $i.text().trim().length > o.maxLength));
    }

    function addEllipsis(txt, o) {
        while ($.inArray(txt.slice(-1), o.lastCharacter.remove) > -1) {
            txt = txt.slice(0, -1);
        }
        if ($.inArray(txt.slice(-1), o.lastCharacter.noEllipsis) < 0) {
            txt += o.ellipsis;
        }
        return txt;
    }

    function getSizes($d) {
        return {
            'width': $d.innerWidth(),
            'height': $d.innerHeight()
        };
    }

    function setTextContent(e, content) {
        if (e.innerText) {
            e.innerText = content;
        } else if (e.nodeValue) {
            e.nodeValue = content;
        } else if (e.textContent) {
            e.textContent = content;
        }

    }

    function getTextContent(e) {
        if (e.innerText) {
            return e.innerText;
        } else if (e.nodeValue) {
            return e.nodeValue;
        } else if (e.textContent) {
            return e.textContent;
        } else {
            return "";
        }
    }

    function getPrevNode(n) {
        do {
            n = n.previousSibling;
        }
        while (n && n.nodeType !== 1 && n.nodeType !== 3);

        return n;
    }

    function findLastTextNode($el, $top, excludeCurrent) {
        var e = $el && $el[0],
            p;
        if (e) {
            if (!excludeCurrent) {
                if (e.nodeType === 3) {
                    return e;
                }
                if ($.trim($el.text())) {
                    return findLastTextNode($el.contents().last(), $top);
                }
            }
            p = getPrevNode(e);
            while (!p) {
                $el = $el.parent();
                if ($el.is($top) || !$el.length) {
                    return false;
                }
                p = getPrevNode($el[0]);
            }
            if (p) {
                return findLastTextNode($(p), $top);
            }
        }
        return false;
    }

    function getElement(e, $i) {
        if (!e) {
            return false;
        }
        if (typeof e === 'string') {
            e = $(e, $i);
            return (e.length) ?
                e :
                false;
        }
        return !e.jquery ?
            false :
            e;
    }

    function getTrueInnerHeight($el) {
        var h = $el.innerHeight(),
            a = ['paddingTop', 'paddingBottom'];

        for (var z = 0, l = a.length; z < l; z++) {
            var m = parseInt($el.css(a[z]), 10);
            if (isNaN(m)) {
                m = 0;
            }
            h -= m;
        }
        return h;
    }


    //	override jQuery.html
    var _orgHtml = $.fn.html;
    $.fn.html = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            return this.trigger('update', [str]);
        }
        return _orgHtml.apply(this, arguments);
    };


    //	override jQuery.text
    var _orgText = $.fn.text;
    $.fn.text = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            str = $('<div />').text(str).html();
            return this.trigger('update', [str]);
        }
        return _orgText.apply(this, arguments);
    };


})(jQuery);

/*

## Automatic parsing for CSS classes
Contributed by [Ramil Valitov](https://github.com/rvalitov)

### The idea
You can add one or several CSS classes to HTML elements to automatically invoke "jQuery.dotdotdot functionality" and some extra features. It allows to use jQuery.dotdotdot only by adding appropriate CSS classes without JS programming.

### Available classes and their description
* dot-ellipsis - automatically invoke jQuery.dotdotdot to this element. This class must be included if you plan to use other classes below.
* dot-resize-update - automatically update if window resize event occurs. It's equivalent to option `watch:'window'`.
* dot-timer-update - automatically update at regular intervals using setInterval. It's equivalent to option `watch:true`.
* dot-load-update - automatically update after the window has beem completely rendered. Can be useful if your content is generated dynamically using using JS and, hence, jQuery.dotdotdot can't correctly detect the height of the element before it's rendered completely.
* dot-height-XXX - available height of content area in pixels, where XXX is a number, e.g. can be `dot-height-35` if you want to set maximum height for 35 pixels. It's equivalent to option `height:'XXX'`.

### Usage examples
*Adding jQuery.dotdotdot to element*

	<div class="dot-ellipsis">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with update on window resize*

	<div class="dot-ellipsis dot-resize-update">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with predefined height of 50px*

	<div class="dot-ellipsis dot-height-50">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*/

jQuery(document).ready(function($) {
    //We only invoke jQuery.dotdotdot on elements that have dot-ellipsis class
    $(".dot-ellipsis").each(function() {
        //Checking if update on window resize required
        var watch_window = $(this).hasClass("dot-resize-update");

        //Checking if update on timer required
        var watch_timer = $(this).hasClass("dot-timer-update");

        //Checking if height set
        var height = 0;
        var classList = $(this).attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            var matchResult = item.match(/^dot-height-(\d+)$/);
            if (matchResult !== null)
                height = Number(matchResult[1]);
        });

        //Invoking jQuery.dotdotdot
        var x = {};
        if (watch_timer)
            x.watch = true;
        if (watch_window)
            x.watch = 'window';
        if (height > 0)
            x.height = height;
        $(this).dotdotdot(x);
    });
});

//Updating elements (if any) on window.load event
jQuery(window).on('load', function() {
    jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot");
});

;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jQuery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jQuery'));
  } else {
    root.jquery_dotdotdot_min_js = factory(root.jQuery);
  }
}(this, function(jQuery) {
/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */
!function(t,e){"use strict";function n(t,e,n){var r=t.children(),a=!1;t.empty();for(var i=0,d=r.length;i<d;i++){var l=r.eq(i);if(t.append(l),n&&t.append(n),o(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function r(e,n,i,d,l){var s=!1,c="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(s)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(c)?"after":"append"](l),o(i,d)&&(s=3==h.nodeType?a(f,n,i,d,l):r(f,n,i,d,l)),s||l&&l.detach()}}),n.addClass("is-truncated"),s}function a(e,n,r,a,d){var c=e[0];if(!c)return!1;var h=s(c),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,w=-1,m=0,b=g.length-1;if(a.fallbackToLetter&&0===m&&0===b&&(p="",g=h.split(p),b=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(c,h);else{for(;m<=b&&(0!==m||0!==b);){var y=Math.floor((m+b)/2);if(y==w)break;w=y,l(c,g.slice(0,w+1).join(p)+a.ellipsis),r.children().each(function(){t(this).toggle().toggle()}),o(r,a)?(b=w,a.fallbackToLetter&&0===m&&0===b&&(p="",g=g[0].split(p),v=-1,w=-1,m=0,b=g.length-1)):(v=w,m=w)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?c=u(x.contents().eq(-1-C),n):(c=u(x,n,!0),C||x.detach()),c&&(h=i(s(c),a),l(c,h),C&&d)){var T=d.parent();t(c).parent().append(d),t.trim(T.html())||T.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(c,h)}return!0}function o(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function s(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function c(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,r){var a,o=e&&e[0];if(o){if(!r){if(3===o.nodeType)return o;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=c(o);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=c(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],r=0,a=n.length;r<a;r++){var o=parseInt(t.css(n[r]),10);isNaN(o)&&(o=0),e-=o}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var c=!1,u=!1;return s.afterElement&&(c=s.afterElement.clone(!0),c.show(),s.afterElement.detach()),o(g,l)&&(u="children"==l.wrap?n(g,l,c):r(g,a,g,l,c)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),s.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],s.isTruncated),s.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),r=e.height();e.bind("resize.dot"+s.dotId,function(){n==e.width()&&r==e.height()&&l.windowResizeFix||(n=e.width(),r=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else c=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);c.width==t.width&&c.height==t.height||(a.trigger("update.dot"),c=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+s.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),s={},c={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),s.afterElement=h(l.after,a),s.isTruncated=!1,s.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),r=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(r=Number(n[1]))});var o={};n&&(o.watch=!0),e&&(o.watch="window"),r>0&&(o.height=r),t(this).dotdotdot(o)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")});
return true;
}));


/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */

(function($, undef) {
    'use strict';
    if ($.fn.dotdotdot) {
        return;
    }

    $.fn.dotdotdot = function(o) {
        if (this.length === 0) {
            $.fn.dotdotdot.debug('No element found for "' + this.selector + '".');
            return this;
        }
        if (this.length > 1) {
            return this.each(
                function() {
                    $(this).dotdotdot(o);
                }
            );
        }

        var $dot = this;
        var orgContent = $dot.contents();

        if ($dot.data('dotdotdot')) {
            $dot.trigger('destroy.dot');
        }

        $dot.data('dotdotdot-style', $dot.attr('style') || '');
        $dot.css('word-wrap', 'break-word');
        if ($dot.css('white-space') === 'nowrap') {
            $dot.css('white-space', 'normal');
        }

        $dot.bind_events = function() {
            $dot.bind(
                'update.dot',
                function(e, c) {
                    $dot.removeClass("is-truncated");
                    e.preventDefault();
                    e.stopPropagation();

                    switch (typeof opts.height) {
                        case 'number':
                            opts.maxHeight = opts.height;
                            break;

                        case 'function':
                            opts.maxHeight = opts.height.call($dot[0]);
                            break;

                        default:
                            opts.maxHeight = getTrueInnerHeight($dot);
                            break;
                    }

                    opts.maxHeight += opts.tolerance;

                    if (typeof c != 'undefined') {
                        if (typeof c == 'string' || ('nodeType' in c && c.nodeType === 1)) {
                            c = $('<div />').append(c).contents();
                        }
                        if (c instanceof $) {
                            orgContent = c;
                        }
                    }

                    $inr = $dot.wrapInner('<div class="dotdotdot" />').children();
                    $inr.contents()
                        .detach()
                        .end()
                        .append(orgContent.clone(true))
                        .find('br')
                        .replaceWith('  <br />  ')
                        .end()
                        .css({
                            'height': 'auto',
                            'width': 'auto',
                            'border': 'none',
                            'padding': 0,
                            'margin': 0
                        });

                    var after = false,
                        trunc = false;

                    if (conf.afterElement) {
                        after = conf.afterElement.clone(true);
                        after.show();
                        conf.afterElement.detach();
                    }

                    if (test($inr, opts)) {
                        if (opts.wrap == 'children') {
                            trunc = children($inr, opts, after);
                        } else {
                            trunc = ellipsis($inr, $dot, $inr, opts, after);
                        }
                    }
                    $inr.replaceWith($inr.contents());
                    $inr = null;

                    if ($.isFunction(opts.callback)) {
                        opts.callback.call($dot[0], trunc, orgContent);
                    }

                    conf.isTruncated = trunc;
                    return trunc;
                }

            ).bind(
                'isTruncated.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], conf.isTruncated);
                    }
                    return conf.isTruncated;
                }

            ).bind(
                'originalContent.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], orgContent);
                    }
                    return orgContent;
                }

            ).bind(
                'destroy.dot',
                function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $dot.unwatch()
                        .unbind_events()
                        .contents()
                        .detach()
                        .end()
                        .append(orgContent)
                        .attr('style', $dot.data('dotdotdot-style') || '')
                        .removeClass('is-truncated')
                        .data('dotdotdot', false);
                }
            );
            return $dot;
        }; //	/bind_events

        $dot.unbind_events = function() {
            $dot.unbind('.dot');
            return $dot;
        }; //	/unbind_events

        $dot.watch = function() {
            $dot.unwatch();
            if (opts.watch == 'window') {
                var $window = $(window),
                    _wWidth = $window.width(),
                    _wHeight = $window.height();

                $window.bind(
                    'resize.dot' + conf.dotId,
                    function() {
                        if (_wWidth != $window.width() || _wHeight != $window.height() || !opts.windowResizeFix) {
                            _wWidth = $window.width();
                            _wHeight = $window.height();

                            if (watchInt) {
                                clearInterval(watchInt);
                            }
                            watchInt = setTimeout(
                                function() {
                                    $dot.trigger('update.dot');
                                }, 100
                            );
                        }
                    }
                );
            } else {
                watchOrg = getSizes($dot);
                watchInt = setInterval(
                    function() {
                        if ($dot.is(':visible')) {
                            var watchNew = getSizes($dot);
                            if (watchOrg.width != watchNew.width ||
                                watchOrg.height != watchNew.height) {
                                $dot.trigger('update.dot');
                                watchOrg = watchNew;
                            }
                        }
                    }, 500
                );
            }
            return $dot;
        };
        $dot.unwatch = function() {
            $(window).unbind('resize.dot' + conf.dotId);
            if (watchInt) {
                clearInterval(watchInt);
            }
            return $dot;
        };

        var opts = $.extend(true, {}, $.fn.dotdotdot.defaults, o),
            conf = {},
            watchOrg = {},
            watchInt = null,
            $inr = null;


        if (!(opts.lastCharacter.remove instanceof Array)) {
            opts.lastCharacter.remove = $.fn.dotdotdot.defaultArrays.lastCharacter.remove;
        }
        if (!(opts.lastCharacter.noEllipsis instanceof Array)) {
            opts.lastCharacter.noEllipsis = $.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis;
        }


        conf.afterElement = getElement(opts.after, $dot);
        conf.isTruncated = false;
        conf.dotId = dotId++;


        $dot.data('dotdotdot', true)
            .bind_events()
            .trigger('update.dot');

        if (opts.watch) {
            $dot.watch();
        }

        return $dot;
    };


    //	public
    $.fn.dotdotdot.defaults = {
        'ellipsis': '... ',
        'wrap': 'word',
        'fallbackToLetter': true,
        'lastCharacter': {},
        'tolerance': 0,
        'callback': null,
        'after': null,
        'height': null,
        'watch': false,
        'windowResizeFix': true,
        'maxLength': null
    };
    $.fn.dotdotdot.defaultArrays = {
        'lastCharacter': {
            'remove': [' ', '\u3000', ',', ';', '.', '!', '?'],
            'noEllipsis': []
        }
    };
    $.fn.dotdotdot.debug = function(msg) {};


    //	private
    var dotId = 1;

    function children($elem, o, after) {
        var $elements = $elem.children(),
            isTruncated = false;

        $elem.empty();

        for (var a = 0, l = $elements.length; a < l; a++) {
            var $e = $elements.eq(a);
            $elem.append($e);
            if (after) {
                $elem.append(after);
            }
            if (test($elem, o)) {
                $e.remove();
                isTruncated = true;
                break;
            } else {
                if (after) {
                    after.detach();
                }
            }
        }
        return isTruncated;
    }

    function ellipsis($elem, $d, $i, o, after) {
        var isTruncated = false;

        //	Don't put the ellipsis directly inside these elements
        var notx = 'a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style';

        //	Don't remove these elements even if they are after the ellipsis
        var noty = 'script, .dotdotdot-keep';

        $elem
            .contents()
            .detach()
            .each(
                function() {

                    var e = this,
                        $e = $(e);

                    if (typeof e == 'undefined') {
                        return true;
                    } else if ($e.is(noty)) {
                        $elem.append($e);
                    } else if (isTruncated) {
                        return true;
                    } else {
                        $elem.append($e);
                        if (after && !$e.is(o.after) && !$e.find(o.after).length) {
                            $elem[$elem.is(notx) ? 'after' : 'append'](after);
                        }
                        if (test($i, o)) {
                            if (e.nodeType == 3) // node is TEXT
                            {
                                isTruncated = ellipsisElement($e, $d, $i, o, after);
                            } else {
                                isTruncated = ellipsis($e, $d, $i, o, after);
                            }
                        }

                        if (!isTruncated) {
                            if (after) {
                                after.detach();
                            }
                        }
                    }
                }
            );
        $d.addClass("is-truncated");
        return isTruncated;
    }

    function ellipsisElement($e, $d, $i, o, after) {
        var e = $e[0];

        if (!e) {
            return false;
        }

        var txt = getTextContent(e),
            space = (txt.indexOf(' ') !== -1) ? ' ' : '\u3000',
            separator = (o.wrap == 'letter') ? '' : space,
            textArr = txt.split(separator),
            position = -1,
            midPos = -1,
            startPos = 0,
            endPos = textArr.length - 1;


        //	Only one word
        if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
            separator = '';
            textArr = txt.split(separator);
            endPos = textArr.length - 1;
        }

        if (o.maxLength) {
            txt = addEllipsis(txt.trim().substr(0, o.maxLength), o);
            setTextContent(e, txt);
        } else {

            while (startPos <= endPos && !(startPos === 0 && endPos === 0)) {
                var m = Math.floor((startPos + endPos) / 2);
                if (m == midPos) {
                    break;
                }
                midPos = m;

                setTextContent(e, textArr.slice(0, midPos + 1).join(separator) + o.ellipsis);

                $i.children().each(function() {
                    $(this).toggle().toggle();
                });

                if (!test($i, o)) {
                    position = midPos;
                    startPos = midPos;
                } else {
                    endPos = midPos;

                    //	Fallback to letter
                    if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
                        separator = '';
                        textArr = textArr[0].split(separator);
                        position = -1;
                        midPos = -1;
                        startPos = 0;
                        endPos = textArr.length - 1;
                    }
                }
            }

            if (position != -1 && !(textArr.length === 1 && textArr[0].length === 0)) {
                txt = addEllipsis(textArr.slice(0, position + 1).join(separator), o);
                setTextContent(e, txt);
            } else {
                var $w = $e.parent();
                $e.detach();

                var afterLength = (after && after.closest($w).length) ? after.length : 0;

                if ($w.contents().length > afterLength) {
                    e = findLastTextNode($w.contents().eq(-1 - afterLength), $d);
                } else {
                    e = findLastTextNode($w, $d, true);
                    if (!afterLength) {
                        $w.detach();
                    }
                }
                if (e) {
                    txt = addEllipsis(getTextContent(e), o);
                    setTextContent(e, txt);
                    if (afterLength && after) {
                        var $parent = after.parent();

                        $(e).parent().append(after);

                        if (!$.trim($parent.html())) {
                            $parent.remove();
                        }
                    }
                }
            }
        }

        return true;
    }

    function test($i, o) {
        return ($i.innerHeight() > o.maxHeight || (o.maxLength && $i.text().trim().length > o.maxLength));
    }

    function addEllipsis(txt, o) {
        while ($.inArray(txt.slice(-1), o.lastCharacter.remove) > -1) {
            txt = txt.slice(0, -1);
        }
        if ($.inArray(txt.slice(-1), o.lastCharacter.noEllipsis) < 0) {
            txt += o.ellipsis;
        }
        return txt;
    }

    function getSizes($d) {
        return {
            'width': $d.innerWidth(),
            'height': $d.innerHeight()
        };
    }

    function setTextContent(e, content) {
        if (e.innerText) {
            e.innerText = content;
        } else if (e.nodeValue) {
            e.nodeValue = content;
        } else if (e.textContent) {
            e.textContent = content;
        }

    }

    function getTextContent(e) {
        if (e.innerText) {
            return e.innerText;
        } else if (e.nodeValue) {
            return e.nodeValue;
        } else if (e.textContent) {
            return e.textContent;
        } else {
            return "";
        }
    }

    function getPrevNode(n) {
        do {
            n = n.previousSibling;
        }
        while (n && n.nodeType !== 1 && n.nodeType !== 3);

        return n;
    }

    function findLastTextNode($el, $top, excludeCurrent) {
        var e = $el && $el[0],
            p;
        if (e) {
            if (!excludeCurrent) {
                if (e.nodeType === 3) {
                    return e;
                }
                if ($.trim($el.text())) {
                    return findLastTextNode($el.contents().last(), $top);
                }
            }
            p = getPrevNode(e);
            while (!p) {
                $el = $el.parent();
                if ($el.is($top) || !$el.length) {
                    return false;
                }
                p = getPrevNode($el[0]);
            }
            if (p) {
                return findLastTextNode($(p), $top);
            }
        }
        return false;
    }

    function getElement(e, $i) {
        if (!e) {
            return false;
        }
        if (typeof e === 'string') {
            e = $(e, $i);
            return (e.length) ?
                e :
                false;
        }
        return !e.jquery ?
            false :
            e;
    }

    function getTrueInnerHeight($el) {
        var h = $el.innerHeight(),
            a = ['paddingTop', 'paddingBottom'];

        for (var z = 0, l = a.length; z < l; z++) {
            var m = parseInt($el.css(a[z]), 10);
            if (isNaN(m)) {
                m = 0;
            }
            h -= m;
        }
        return h;
    }


    //	override jQuery.html
    var _orgHtml = $.fn.html;
    $.fn.html = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            return this.trigger('update', [str]);
        }
        return _orgHtml.apply(this, arguments);
    };


    //	override jQuery.text
    var _orgText = $.fn.text;
    $.fn.text = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            str = $('<div />').text(str).html();
            return this.trigger('update', [str]);
        }
        return _orgText.apply(this, arguments);
    };


})(jQuery);

/*

## Automatic parsing for CSS classes
Contributed by [Ramil Valitov](https://github.com/rvalitov)

### The idea
You can add one or several CSS classes to HTML elements to automatically invoke "jQuery.dotdotdot functionality" and some extra features. It allows to use jQuery.dotdotdot only by adding appropriate CSS classes without JS programming.

### Available classes and their description
* dot-ellipsis - automatically invoke jQuery.dotdotdot to this element. This class must be included if you plan to use other classes below.
* dot-resize-update - automatically update if window resize event occurs. It's equivalent to option `watch:'window'`.
* dot-timer-update - automatically update at regular intervals using setInterval. It's equivalent to option `watch:true`.
* dot-load-update - automatically update after the window has beem completely rendered. Can be useful if your content is generated dynamically using using JS and, hence, jQuery.dotdotdot can't correctly detect the height of the element before it's rendered completely.
* dot-height-XXX - available height of content area in pixels, where XXX is a number, e.g. can be `dot-height-35` if you want to set maximum height for 35 pixels. It's equivalent to option `height:'XXX'`.

### Usage examples
*Adding jQuery.dotdotdot to element*

	<div class="dot-ellipsis">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with update on window resize*

	<div class="dot-ellipsis dot-resize-update">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with predefined height of 50px*

	<div class="dot-ellipsis dot-height-50">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*/

jQuery(document).ready(function($) {
    //We only invoke jQuery.dotdotdot on elements that have dot-ellipsis class
    $(".dot-ellipsis").each(function() {
        //Checking if update on window resize required
        var watch_window = $(this).hasClass("dot-resize-update");

        //Checking if update on timer required
        var watch_timer = $(this).hasClass("dot-timer-update");

        //Checking if height set
        var height = 0;
        var classList = $(this).attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            var matchResult = item.match(/^dot-height-(\d+)$/);
            if (matchResult !== null)
                height = Number(matchResult[1]);
        });

        //Invoking jQuery.dotdotdot
        var x = {};
        if (watch_timer)
            x.watch = true;
        if (watch_window)
            x.watch = 'window';
        if (height > 0)
            x.height = height;
        $(this).dotdotdot(x);
    });
});

//Updating elements (if any) on window.load event
jQuery(window).on('load', function() {
    jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot");
});

;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jQuery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jQuery'));
  } else {
    root.jquery_dotdotdot_min_js = factory(root.jQuery);
  }
}(this, function(jQuery) {
/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */
!function(t,e){"use strict";function n(t,e,n){var r=t.children(),a=!1;t.empty();for(var i=0,d=r.length;i<d;i++){var l=r.eq(i);if(t.append(l),n&&t.append(n),o(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function r(e,n,i,d,l){var s=!1,c="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(s)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(c)?"after":"append"](l),o(i,d)&&(s=3==h.nodeType?a(f,n,i,d,l):r(f,n,i,d,l)),s||l&&l.detach()}}),n.addClass("is-truncated"),s}function a(e,n,r,a,d){var c=e[0];if(!c)return!1;var h=s(c),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,w=-1,m=0,b=g.length-1;if(a.fallbackToLetter&&0===m&&0===b&&(p="",g=h.split(p),b=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(c,h);else{for(;m<=b&&(0!==m||0!==b);){var y=Math.floor((m+b)/2);if(y==w)break;w=y,l(c,g.slice(0,w+1).join(p)+a.ellipsis),r.children().each(function(){t(this).toggle().toggle()}),o(r,a)?(b=w,a.fallbackToLetter&&0===m&&0===b&&(p="",g=g[0].split(p),v=-1,w=-1,m=0,b=g.length-1)):(v=w,m=w)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?c=u(x.contents().eq(-1-C),n):(c=u(x,n,!0),C||x.detach()),c&&(h=i(s(c),a),l(c,h),C&&d)){var T=d.parent();t(c).parent().append(d),t.trim(T.html())||T.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(c,h)}return!0}function o(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function s(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function c(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,r){var a,o=e&&e[0];if(o){if(!r){if(3===o.nodeType)return o;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=c(o);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=c(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],r=0,a=n.length;r<a;r++){var o=parseInt(t.css(n[r]),10);isNaN(o)&&(o=0),e-=o}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var c=!1,u=!1;return s.afterElement&&(c=s.afterElement.clone(!0),c.show(),s.afterElement.detach()),o(g,l)&&(u="children"==l.wrap?n(g,l,c):r(g,a,g,l,c)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),s.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],s.isTruncated),s.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),r=e.height();e.bind("resize.dot"+s.dotId,function(){n==e.width()&&r==e.height()&&l.windowResizeFix||(n=e.width(),r=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else c=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);c.width==t.width&&c.height==t.height||(a.trigger("update.dot"),c=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+s.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),s={},c={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),s.afterElement=h(l.after,a),s.isTruncated=!1,s.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),r=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(r=Number(n[1]))});var o={};n&&(o.watch=!0),e&&(o.watch="window"),r>0&&(o.height=r),t(this).dotdotdot(o)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")});
return true;
}));


/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */

(function($, undef) {
    'use strict';
    if ($.fn.dotdotdot) {
        return;
    }

    $.fn.dotdotdot = function(o) {
        if (this.length === 0) {
            $.fn.dotdotdot.debug('No element found for "' + this.selector + '".');
            return this;
        }
        if (this.length > 1) {
            return this.each(
                function() {
                    $(this).dotdotdot(o);
                }
            );
        }

        var $dot = this;
        var orgContent = $dot.contents();

        if ($dot.data('dotdotdot')) {
            $dot.trigger('destroy.dot');
        }

        $dot.data('dotdotdot-style', $dot.attr('style') || '');
        $dot.css('word-wrap', 'break-word');
        if ($dot.css('white-space') === 'nowrap') {
            $dot.css('white-space', 'normal');
        }

        $dot.bind_events = function() {
            $dot.bind(
                'update.dot',
                function(e, c) {
                    $dot.removeClass("is-truncated");
                    e.preventDefault();
                    e.stopPropagation();

                    switch (typeof opts.height) {
                        case 'number':
                            opts.maxHeight = opts.height;
                            break;

                        case 'function':
                            opts.maxHeight = opts.height.call($dot[0]);
                            break;

                        default:
                            opts.maxHeight = getTrueInnerHeight($dot);
                            break;
                    }

                    opts.maxHeight += opts.tolerance;

                    if (typeof c != 'undefined') {
                        if (typeof c == 'string' || ('nodeType' in c && c.nodeType === 1)) {
                            c = $('<div />').append(c).contents();
                        }
                        if (c instanceof $) {
                            orgContent = c;
                        }
                    }

                    $inr = $dot.wrapInner('<div class="dotdotdot" />').children();
                    $inr.contents()
                        .detach()
                        .end()
                        .append(orgContent.clone(true))
                        .find('br')
                        .replaceWith('  <br />  ')
                        .end()
                        .css({
                            'height': 'auto',
                            'width': 'auto',
                            'border': 'none',
                            'padding': 0,
                            'margin': 0
                        });

                    var after = false,
                        trunc = false;

                    if (conf.afterElement) {
                        after = conf.afterElement.clone(true);
                        after.show();
                        conf.afterElement.detach();
                    }

                    if (test($inr, opts)) {
                        if (opts.wrap == 'children') {
                            trunc = children($inr, opts, after);
                        } else {
                            trunc = ellipsis($inr, $dot, $inr, opts, after);
                        }
                    }
                    $inr.replaceWith($inr.contents());
                    $inr = null;

                    if ($.isFunction(opts.callback)) {
                        opts.callback.call($dot[0], trunc, orgContent);
                    }

                    conf.isTruncated = trunc;
                    return trunc;
                }

            ).bind(
                'isTruncated.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], conf.isTruncated);
                    }
                    return conf.isTruncated;
                }

            ).bind(
                'originalContent.dot',
                function(e, fn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof fn == 'function') {
                        fn.call($dot[0], orgContent);
                    }
                    return orgContent;
                }

            ).bind(
                'destroy.dot',
                function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $dot.unwatch()
                        .unbind_events()
                        .contents()
                        .detach()
                        .end()
                        .append(orgContent)
                        .attr('style', $dot.data('dotdotdot-style') || '')
                        .removeClass('is-truncated')
                        .data('dotdotdot', false);
                }
            );
            return $dot;
        }; //	/bind_events

        $dot.unbind_events = function() {
            $dot.unbind('.dot');
            return $dot;
        }; //	/unbind_events

        $dot.watch = function() {
            $dot.unwatch();
            if (opts.watch == 'window') {
                var $window = $(window),
                    _wWidth = $window.width(),
                    _wHeight = $window.height();

                $window.bind(
                    'resize.dot' + conf.dotId,
                    function() {
                        if (_wWidth != $window.width() || _wHeight != $window.height() || !opts.windowResizeFix) {
                            _wWidth = $window.width();
                            _wHeight = $window.height();

                            if (watchInt) {
                                clearInterval(watchInt);
                            }
                            watchInt = setTimeout(
                                function() {
                                    $dot.trigger('update.dot');
                                }, 100
                            );
                        }
                    }
                );
            } else {
                watchOrg = getSizes($dot);
                watchInt = setInterval(
                    function() {
                        if ($dot.is(':visible')) {
                            var watchNew = getSizes($dot);
                            if (watchOrg.width != watchNew.width ||
                                watchOrg.height != watchNew.height) {
                                $dot.trigger('update.dot');
                                watchOrg = watchNew;
                            }
                        }
                    }, 500
                );
            }
            return $dot;
        };
        $dot.unwatch = function() {
            $(window).unbind('resize.dot' + conf.dotId);
            if (watchInt) {
                clearInterval(watchInt);
            }
            return $dot;
        };

        var opts = $.extend(true, {}, $.fn.dotdotdot.defaults, o),
            conf = {},
            watchOrg = {},
            watchInt = null,
            $inr = null;


        if (!(opts.lastCharacter.remove instanceof Array)) {
            opts.lastCharacter.remove = $.fn.dotdotdot.defaultArrays.lastCharacter.remove;
        }
        if (!(opts.lastCharacter.noEllipsis instanceof Array)) {
            opts.lastCharacter.noEllipsis = $.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis;
        }


        conf.afterElement = getElement(opts.after, $dot);
        conf.isTruncated = false;
        conf.dotId = dotId++;


        $dot.data('dotdotdot', true)
            .bind_events()
            .trigger('update.dot');

        if (opts.watch) {
            $dot.watch();
        }

        return $dot;
    };


    //	public
    $.fn.dotdotdot.defaults = {
        'ellipsis': '... ',
        'wrap': 'word',
        'fallbackToLetter': true,
        'lastCharacter': {},
        'tolerance': 0,
        'callback': null,
        'after': null,
        'height': null,
        'watch': false,
        'windowResizeFix': true,
        'maxLength': null
    };
    $.fn.dotdotdot.defaultArrays = {
        'lastCharacter': {
            'remove': [' ', '\u3000', ',', ';', '.', '!', '?'],
            'noEllipsis': []
        }
    };
    $.fn.dotdotdot.debug = function(msg) {};


    //	private
    var dotId = 1;

    function children($elem, o, after) {
        var $elements = $elem.children(),
            isTruncated = false;

        $elem.empty();

        for (var a = 0, l = $elements.length; a < l; a++) {
            var $e = $elements.eq(a);
            $elem.append($e);
            if (after) {
                $elem.append(after);
            }
            if (test($elem, o)) {
                $e.remove();
                isTruncated = true;
                break;
            } else {
                if (after) {
                    after.detach();
                }
            }
        }
        return isTruncated;
    }

    function ellipsis($elem, $d, $i, o, after) {
        var isTruncated = false;

        //	Don't put the ellipsis directly inside these elements
        var notx = 'a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style';

        //	Don't remove these elements even if they are after the ellipsis
        var noty = 'script, .dotdotdot-keep';

        $elem
            .contents()
            .detach()
            .each(
                function() {

                    var e = this,
                        $e = $(e);

                    if (typeof e == 'undefined') {
                        return true;
                    } else if ($e.is(noty)) {
                        $elem.append($e);
                    } else if (isTruncated) {
                        return true;
                    } else {
                        $elem.append($e);
                        if (after && !$e.is(o.after) && !$e.find(o.after).length) {
                            $elem[$elem.is(notx) ? 'after' : 'append'](after);
                        }
                        if (test($i, o)) {
                            if (e.nodeType == 3) // node is TEXT
                            {
                                isTruncated = ellipsisElement($e, $d, $i, o, after);
                            } else {
                                isTruncated = ellipsis($e, $d, $i, o, after);
                            }
                        }

                        if (!isTruncated) {
                            if (after) {
                                after.detach();
                            }
                        }
                    }
                }
            );
        $d.addClass("is-truncated");
        return isTruncated;
    }

    function ellipsisElement($e, $d, $i, o, after) {
        var e = $e[0];

        if (!e) {
            return false;
        }

        var txt = getTextContent(e),
            space = (txt.indexOf(' ') !== -1) ? ' ' : '\u3000',
            separator = (o.wrap == 'letter') ? '' : space,
            textArr = txt.split(separator),
            position = -1,
            midPos = -1,
            startPos = 0,
            endPos = textArr.length - 1;


        //	Only one word
        if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
            separator = '';
            textArr = txt.split(separator);
            endPos = textArr.length - 1;
        }

        if (o.maxLength) {
            txt = addEllipsis(txt.trim().substr(0, o.maxLength), o);
            setTextContent(e, txt);
        } else {

            while (startPos <= endPos && !(startPos === 0 && endPos === 0)) {
                var m = Math.floor((startPos + endPos) / 2);
                if (m == midPos) {
                    break;
                }
                midPos = m;

                setTextContent(e, textArr.slice(0, midPos + 1).join(separator) + o.ellipsis);

                $i.children().each(function() {
                    $(this).toggle().toggle();
                });

                if (!test($i, o)) {
                    position = midPos;
                    startPos = midPos;
                } else {
                    endPos = midPos;

                    //	Fallback to letter
                    if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
                        separator = '';
                        textArr = textArr[0].split(separator);
                        position = -1;
                        midPos = -1;
                        startPos = 0;
                        endPos = textArr.length - 1;
                    }
                }
            }

            if (position != -1 && !(textArr.length === 1 && textArr[0].length === 0)) {
                txt = addEllipsis(textArr.slice(0, position + 1).join(separator), o);
                setTextContent(e, txt);
            } else {
                var $w = $e.parent();
                $e.detach();

                var afterLength = (after && after.closest($w).length) ? after.length : 0;

                if ($w.contents().length > afterLength) {
                    e = findLastTextNode($w.contents().eq(-1 - afterLength), $d);
                } else {
                    e = findLastTextNode($w, $d, true);
                    if (!afterLength) {
                        $w.detach();
                    }
                }
                if (e) {
                    txt = addEllipsis(getTextContent(e), o);
                    setTextContent(e, txt);
                    if (afterLength && after) {
                        var $parent = after.parent();

                        $(e).parent().append(after);

                        if (!$.trim($parent.html())) {
                            $parent.remove();
                        }
                    }
                }
            }
        }

        return true;
    }

    function test($i, o) {
        return ($i.innerHeight() > o.maxHeight || (o.maxLength && $i.text().trim().length > o.maxLength));
    }

    function addEllipsis(txt, o) {
        while ($.inArray(txt.slice(-1), o.lastCharacter.remove) > -1) {
            txt = txt.slice(0, -1);
        }
        if ($.inArray(txt.slice(-1), o.lastCharacter.noEllipsis) < 0) {
            txt += o.ellipsis;
        }
        return txt;
    }

    function getSizes($d) {
        return {
            'width': $d.innerWidth(),
            'height': $d.innerHeight()
        };
    }

    function setTextContent(e, content) {
        if (e.innerText) {
            e.innerText = content;
        } else if (e.nodeValue) {
            e.nodeValue = content;
        } else if (e.textContent) {
            e.textContent = content;
        }

    }

    function getTextContent(e) {
        if (e.innerText) {
            return e.innerText;
        } else if (e.nodeValue) {
            return e.nodeValue;
        } else if (e.textContent) {
            return e.textContent;
        } else {
            return "";
        }
    }

    function getPrevNode(n) {
        do {
            n = n.previousSibling;
        }
        while (n && n.nodeType !== 1 && n.nodeType !== 3);

        return n;
    }

    function findLastTextNode($el, $top, excludeCurrent) {
        var e = $el && $el[0],
            p;
        if (e) {
            if (!excludeCurrent) {
                if (e.nodeType === 3) {
                    return e;
                }
                if ($.trim($el.text())) {
                    return findLastTextNode($el.contents().last(), $top);
                }
            }
            p = getPrevNode(e);
            while (!p) {
                $el = $el.parent();
                if ($el.is($top) || !$el.length) {
                    return false;
                }
                p = getPrevNode($el[0]);
            }
            if (p) {
                return findLastTextNode($(p), $top);
            }
        }
        return false;
    }

    function getElement(e, $i) {
        if (!e) {
            return false;
        }
        if (typeof e === 'string') {
            e = $(e, $i);
            return (e.length) ?
                e :
                false;
        }
        return !e.jquery ?
            false :
            e;
    }

    function getTrueInnerHeight($el) {
        var h = $el.innerHeight(),
            a = ['paddingTop', 'paddingBottom'];

        for (var z = 0, l = a.length; z < l; z++) {
            var m = parseInt($el.css(a[z]), 10);
            if (isNaN(m)) {
                m = 0;
            }
            h -= m;
        }
        return h;
    }


    //	override jQuery.html
    var _orgHtml = $.fn.html;
    $.fn.html = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            return this.trigger('update', [str]);
        }
        return _orgHtml.apply(this, arguments);
    };


    //	override jQuery.text
    var _orgText = $.fn.text;
    $.fn.text = function(str) {
        if (str != undef && !$.isFunction(str) && this.data('dotdotdot')) {
            str = $('<div />').text(str).html();
            return this.trigger('update', [str]);
        }
        return _orgText.apply(this, arguments);
    };


})(jQuery);

/*

## Automatic parsing for CSS classes
Contributed by [Ramil Valitov](https://github.com/rvalitov)

### The idea
You can add one or several CSS classes to HTML elements to automatically invoke "jQuery.dotdotdot functionality" and some extra features. It allows to use jQuery.dotdotdot only by adding appropriate CSS classes without JS programming.

### Available classes and their description
* dot-ellipsis - automatically invoke jQuery.dotdotdot to this element. This class must be included if you plan to use other classes below.
* dot-resize-update - automatically update if window resize event occurs. It's equivalent to option `watch:'window'`.
* dot-timer-update - automatically update at regular intervals using setInterval. It's equivalent to option `watch:true`.
* dot-load-update - automatically update after the window has beem completely rendered. Can be useful if your content is generated dynamically using using JS and, hence, jQuery.dotdotdot can't correctly detect the height of the element before it's rendered completely.
* dot-height-XXX - available height of content area in pixels, where XXX is a number, e.g. can be `dot-height-35` if you want to set maximum height for 35 pixels. It's equivalent to option `height:'XXX'`.

### Usage examples
*Adding jQuery.dotdotdot to element*

	<div class="dot-ellipsis">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with update on window resize*

	<div class="dot-ellipsis dot-resize-update">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*Adding jQuery.dotdotdot to element with predefined height of 50px*

	<div class="dot-ellipsis dot-height-50">
	<p>Lorem Ipsum is simply dummy text.</p>
	</div>

*/

jQuery(document).ready(function($) {
    //We only invoke jQuery.dotdotdot on elements that have dot-ellipsis class
    $(".dot-ellipsis").each(function() {
        //Checking if update on window resize required
        var watch_window = $(this).hasClass("dot-resize-update");

        //Checking if update on timer required
        var watch_timer = $(this).hasClass("dot-timer-update");

        //Checking if height set
        var height = 0;
        var classList = $(this).attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            var matchResult = item.match(/^dot-height-(\d+)$/);
            if (matchResult !== null)
                height = Number(matchResult[1]);
        });

        //Invoking jQuery.dotdotdot
        var x = {};
        if (watch_timer)
            x.watch = true;
        if (watch_window)
            x.watch = 'window';
        if (height > 0)
            x.height = height;
        $(this).dotdotdot(x);
    });
});

//Updating elements (if any) on window.load event
jQuery(window).on('load', function() {
    jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot");
});

;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jQuery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jQuery'));
  } else {
    root.jquery_dotdotdot_min_js = factory(root.jQuery);
  }
}(this, function(jQuery) {
/*
 *	jQuery dotdotdot 1.8.3
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Licensed under the MIT license.
 *	http://en.wikipedia.org/wiki/MIT_License
 */
!function(t,e){"use strict";function n(t,e,n){var r=t.children(),a=!1;t.empty();for(var i=0,d=r.length;i<d;i++){var l=r.eq(i);if(t.append(l),n&&t.append(n),o(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function r(e,n,i,d,l){var s=!1,c="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(s)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(c)?"after":"append"](l),o(i,d)&&(s=3==h.nodeType?a(f,n,i,d,l):r(f,n,i,d,l)),s||l&&l.detach()}}),n.addClass("is-truncated"),s}function a(e,n,r,a,d){var c=e[0];if(!c)return!1;var h=s(c),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,w=-1,m=0,b=g.length-1;if(a.fallbackToLetter&&0===m&&0===b&&(p="",g=h.split(p),b=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(c,h);else{for(;m<=b&&(0!==m||0!==b);){var y=Math.floor((m+b)/2);if(y==w)break;w=y,l(c,g.slice(0,w+1).join(p)+a.ellipsis),r.children().each(function(){t(this).toggle().toggle()}),o(r,a)?(b=w,a.fallbackToLetter&&0===m&&0===b&&(p="",g=g[0].split(p),v=-1,w=-1,m=0,b=g.length-1)):(v=w,m=w)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?c=u(x.contents().eq(-1-C),n):(c=u(x,n,!0),C||x.detach()),c&&(h=i(s(c),a),l(c,h),C&&d)){var T=d.parent();t(c).parent().append(d),t.trim(T.html())||T.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(c,h)}return!0}function o(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function s(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function c(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,r){var a,o=e&&e[0];if(o){if(!r){if(3===o.nodeType)return o;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=c(o);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=c(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],r=0,a=n.length;r<a;r++){var o=parseInt(t.css(n[r]),10);isNaN(o)&&(o=0),e-=o}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var c=!1,u=!1;return s.afterElement&&(c=s.afterElement.clone(!0),c.show(),s.afterElement.detach()),o(g,l)&&(u="children"==l.wrap?n(g,l,c):r(g,a,g,l,c)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),s.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],s.isTruncated),s.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),r=e.height();e.bind("resize.dot"+s.dotId,function(){n==e.width()&&r==e.height()&&l.windowResizeFix||(n=e.width(),r=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else c=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);c.width==t.width&&c.height==t.height||(a.trigger("update.dot"),c=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+s.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),s={},c={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),s.afterElement=h(l.after,a),s.isTruncated=!1,s.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),r=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(r=Number(n[1]))});var o={};n&&(o.watch=!0),e&&(o.watch="window"),r>0&&(o.height=r),t(this).dotdotdot(o)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")});
return true;
}));

/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.tutor_clicks = {
    attach: function (context, settings) {
      $(".custom_block_contact_button, .tutor-contact-free").click(function(){
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#right-contact-early").click(function() {
        $(this).addClass('contact-early-active');
        $("#quicktabs-tab-profiles-10").trigger('click');
      });
      $(".message_me").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#tutor-phn").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
      });
    }
  };

  Drupal.behaviors.tutor_colorbox = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.no_ad_created) {
        jQuery.colorbox({
          html:
            '<div class="saved_search_message">' +
              '<h3>' + Drupal.t('PLEASE CREATE A FREE AD') + '</h3>' +
              '<p>' + Drupal.t('Unfortunately you are unable to like a tutor ad until you have created a free ad. ' +
                'Please click \'continue\' to start the free ad posting process. It is very quick and easy to do.') + '</p>' +
              '<a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">' +
                Drupal.t('Continue') +
              '</a>' +
            '</div>',
          width: 520
        });
      }
    }
  };

  Drupal.behaviors.tutor_map = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.latitude && settings.tutor.longitude)
        var pyrmont = {
          lat: settings.tutor.latitude,
          lng: settings.tutor.longitude
        };
  
      function initMap() {
        // Create the map.
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: pyrmont,
          mapTypeId: 'roadmap'
        });
    
        // Add the circle for this city to the map.
        var cityCircle = new google.maps.Circle({
          strokeColor: '#33afff',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#33afff',
          fillOpacity: 0.35,
          map: map,
          center: pyrmont,
          radius: 201
        });
    
        var marker = new google.maps.Marker({map: map});
    
        var mapcenter = new google.maps.LatLng(settings.tutor.latitude, settings.tutor.longitude);
        google.maps.event.addListener(map, 'bounds_changed', function () {
          map.setCenter(mapcenter);
        });
      }
    }
  };

  Drupal.behaviors.tutor_contact = {
    attach: function (context, settings) {
      $("#tutor-phn").click(function(){
        if($('#tutor-phn').data('mail') == 'mail_send') {
          window.location.href  = settings.tutor.contact_mail_link;
        } else {
          window.location.href  = settings.tutor.contact_phone_link;
        }
      });
    }
  };

  Drupal.behaviors.parent_colorbox = {
    attach: function (context, settings) {
      $("#right-contact-early").click(function() {
        $.colorbox({
          html: $('#contact_users_popup').html(),
          width: 650
        });
      });
    }
  };

  Drupal.behaviors.tutor_event = {
    attach: function (context, settings) {
      function addEvent(obj, evt, fn) {
        if (obj.addEventListener) {
          obj.addEventListener(evt, fn, false);
        }
        else if (obj.attachEvent) {
          obj.attachEvent("on" + evt, fn);
        }
      }
      function closeBox() {
        jQuery.colorbox.close();
      }
      addEvent(document, 'mouseout', function(evt) {
        var active_elem = $('.contact-early-active').length;
        if (evt.toElement == null && evt.relatedTarget == null ) {
          if (active_elem > 0) {            var divContent = jQuery('#contact_users_popup').html();
            jQuery.colorbox({
              html:divContent,
              width: 650
            });
          }
        }
      });
    }
  };
})(jQuery, Drupal, this, this.document);

!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document);
/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.tutor_clicks = {
    attach: function (context, settings) {
      $(".custom_block_contact_button, .tutor-contact-free").click(function(){
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#right-contact-early").click(function() {
        $(this).addClass('contact-early-active');
        $("#quicktabs-tab-profiles-10").trigger('click');
      });
      $(".message_me").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#tutor-phn").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
      });
    }
  };

  Drupal.behaviors.tutor_colorbox = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.no_ad_created) {
        jQuery.colorbox({
          html:
            '<div class="saved_search_message">' +
              '<h3>' + Drupal.t('PLEASE CREATE A FREE AD') + '</h3>' +
              '<p>' + Drupal.t('Unfortunately you are unable to like a tutor ad until you have created a free ad. ' +
                'Please click \'continue\' to start the free ad posting process. It is very quick and easy to do.') + '</p>' +
              '<a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">' +
                Drupal.t('Continue') +
              '</a>' +
            '</div>',
          width: 520
        });
      }
    }
  };

  Drupal.behaviors.tutor_map = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.latitude && settings.tutor.longitude)
        var pyrmont = {
          lat: settings.tutor.latitude,
          lng: settings.tutor.longitude
        };
  
      function initMap() {
        // Create the map.
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: pyrmont,
          mapTypeId: 'roadmap'
        });
    
        // Add the circle for this city to the map.
        var cityCircle = new google.maps.Circle({
          strokeColor: '#33afff',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#33afff',
          fillOpacity: 0.35,
          map: map,
          center: pyrmont,
          radius: 201
        });
    
        var marker = new google.maps.Marker({map: map});
    
        var mapcenter = new google.maps.LatLng(settings.tutor.latitude, settings.tutor.longitude);
        google.maps.event.addListener(map, 'bounds_changed', function () {
          map.setCenter(mapcenter);
        });
      }
    }
  };

  Drupal.behaviors.tutor_contact = {
    attach: function (context, settings) {
      $("#tutor-phn").click(function(){
        if($('#tutor-phn').data('mail') == 'mail_send') {
          window.location.href  = settings.tutor.contact_mail_link;
        } else {
          window.location.href  = settings.tutor.contact_phone_link;
        }
      });
    }
  };

  Drupal.behaviors.parent_colorbox = {
    attach: function (context, settings) {
      $("#right-contact-early").click(function() {
        $.colorbox({
          html: $('#contact_users_popup').html(),
          width: 650
        });
      });
    }
  };

  Drupal.behaviors.tutor_event = {
    attach: function (context, settings) {
      function addEvent(obj, evt, fn) {
        if (obj.addEventListener) {
          obj.addEventListener(evt, fn, false);
        }
        else if (obj.attachEvent) {
          obj.attachEvent("on" + evt, fn);
        }
      }
      function closeBox() {
        jQuery.colorbox.close();
      }
      addEvent(document, 'mouseout', function(evt) {
        var active_elem = $('.contact-early-active').length;
        if (evt.toElement == null && evt.relatedTarget == null ) {
          if (active_elem > 0) {            var divContent = jQuery('#contact_users_popup').html();
            jQuery.colorbox({
              html:divContent,
              width: 650
            });
          }
        }
      });
    }
  };
})(jQuery, Drupal, this, this.document);

!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}
function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document);
/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.tutor_clicks = {
    attach: function (context, settings) {
      $(".custom_block_contact_button, .tutor-contact-free").click(function(){
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#right-contact-early").click(function() {
        $(this).addClass('contact-early-active');
        $("#quicktabs-tab-profiles-10").trigger('click');
      });
      $(".message_me").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#tutor-phn").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
      });
    }
  };

  Drupal.behaviors.tutor_colorbox = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.no_ad_created) {
        jQuery.colorbox({
          html:
            '<div class="saved_search_message">' +
              '<h3>' + Drupal.t('PLEASE CREATE A FREE AD') + '</h3>' +
              '<p>' + Drupal.t('Unfortunately you are unable to like a tutor ad until you have created a free ad. ' +
                'Please click \'continue\' to start the free ad posting process. It is very quick and easy to do.') + '</p>' +
              '<a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">' +
                Drupal.t('Continue') +
              '</a>' +
            '</div>',
          width: 520
        });
      }
    }
  };

  Drupal.behaviors.tutor_map = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.latitude && settings.tutor.longitude)
        var pyrmont = {
          lat: settings.tutor.latitude,
          lng: settings.tutor.longitude
        };
  
      function initMap() {
        // Create the map.
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: pyrmont,
          mapTypeId: 'roadmap'
        });
    
        // Add the circle for this city to the map.
        var cityCircle = new google.maps.Circle({
          strokeColor: '#33afff',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#33afff',
          fillOpacity: 0.35,
          map: map,
          center: pyrmont,
          radius: 201
        });
    
        var marker = new google.maps.Marker({map: map});
    
        var mapcenter = new google.maps.LatLng(settings.tutor.latitude, settings.tutor.longitude);
        google.maps.event.addListener(map, 'bounds_changed', function () {
          map.setCenter(mapcenter);
        });
      }
    }
  };

  Drupal.behaviors.tutor_contact = {
    attach: function (context, settings) {
      $("#tutor-phn").click(function(){
        if($('#tutor-phn').data('mail') == 'mail_send') {
          window.location.href  = settings.tutor.contact_mail_link;
        } else {
          window.location.href  = settings.tutor.contact_phone_link;
        }
      });
    }
  };

  Drupal.behaviors.parent_colorbox = {
    attach: function (context, settings) {
      $("#right-contact-early").click(function() {
        $.colorbox({
          html: $('#contact_users_popup').html(),
          width: 650
        });
      });
    }
  };

  Drupal.behaviors.tutor_event = {
    attach: function (context, settings) {
      function addEvent(obj, evt, fn) {
        if (obj.addEventListener) {
          obj.addEventListener(evt, fn, false);
        }
        else if (obj.attachEvent) {
          obj.attachEvent("on" + evt, fn);
        }
      }
      function closeBox() {
        jQuery.colorbox.close();
      }
      addEvent(document, 'mouseout', function(evt) {
        var active_elem = $('.contact-early-active').length;
        if (evt.toElement == null && evt.relatedTarget == null ) {
          if (active_elem > 0) {            var divContent = jQuery('#contact_users_popup').html();
            jQuery.colorbox({
              html:divContent,
              width: 650
            });
          }
        }
      });
    }
  };
})(jQuery, Drupal, this, this.document);

!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){
if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),
a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,
height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document);
/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.tutor_clicks = {
    attach: function (context, settings) {
      $(".custom_block_contact_button, .tutor-contact-free").click(function(){
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#right-contact-early").click(function() {
        $(this).addClass('contact-early-active');
        $("#quicktabs-tab-profiles-10").trigger('click');
      });
      $(".message_me").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#tutor-phn").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
      });
    }
  };

  Drupal.behaviors.tutor_colorbox = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.no_ad_created) {
        jQuery.colorbox({
          html:
            '<div class="saved_search_message">' +
              '<h3>' + Drupal.t('PLEASE CREATE A FREE AD') + '</h3>' +
              '<p>' + Drupal.t('Unfortunately you are unable to like a tutor ad until you have created a free ad. ' +
                'Please click \'continue\' to start the free ad posting process. It is very quick and easy to do.') + '</p>' +
              '<a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">' +
                Drupal.t('Continue') +
              '</a>' +
            '</div>',
          width: 520
        });
      }
    }
  };

  Drupal.behaviors.tutor_map = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.latitude && settings.tutor.longitude)
        var pyrmont = {
          lat: settings.tutor.latitude,
          lng: settings.tutor.longitude
        };
  
      function initMap() {
        // Create the map.
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: pyrmont,
          mapTypeId: 'roadmap'
        });
    
        // Add the circle for this city to the map.
        var cityCircle = new google.maps.Circle({
          strokeColor: '#33afff',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#33afff',
          fillOpacity: 0.35,
          map: map,
          center: pyrmont,
          radius: 201
        });
    
        var marker = new google.maps.Marker({map: map});
    
        var mapcenter = new google.maps.LatLng(settings.tutor.latitude, settings.tutor.longitude);
        google.maps.event.addListener(map, 'bounds_changed', function () {
          map.setCenter(mapcenter);
        });
      }
    }
  };

  Drupal.behaviors.tutor_contact = {
    attach: function (context, settings) {
      $("#tutor-phn").click(function(){
        if($('#tutor-phn').data('mail') == 'mail_send') {
          window.location.href  = settings.tutor.contact_mail_link;
        } else {
          window.location.href  = settings.tutor.contact_phone_link;
        }
      });
    }
  };

  Drupal.behaviors.parent_colorbox = {
    attach: function (context, settings) {
      $("#right-contact-early").click(function() {
        $.colorbox({
          html: $('#contact_users_popup').html(),
          width: 650
        });
      });
    }
  };

  Drupal.behaviors.tutor_event = {
    attach: function (context, settings) {
      function addEvent(obj, evt, fn) {
        if (obj.addEventListener) {
          obj.addEventListener(evt, fn, false);
        }
        else if (obj.attachEvent) {
          obj.attachEvent("on" + evt, fn);
        }
      }
      function closeBox() {
        jQuery.colorbox.close();
      }
      addEvent(document, 'mouseout', function(evt) {
        var active_elem = $('.contact-early-active').length;
        if (evt.toElement == null && evt.relatedTarget == null ) {
          if (active_elem > 0) {            var divContent = jQuery('#contact_users_popup').html();
            jQuery.colorbox({
              html:divContent,
              width: 650
            });
          }
        }
      });
    }
  };
})(jQuery, Drupal, this, this.document);

!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){
if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";
return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",
g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),
t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e);
}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{
if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(jQuery),jQuery(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),jQuery(window).on("load",function(){jQuery(".dot-ellipsis.dot-load-update").trigger("update.dot")}),function(t,e){"function"==typeof define&&define.amd?define(["jQuery"],e):"object"==typeof exports?module.exports=e(require("jQuery")):t.jquery_dotdotdot_min_js=e(t.jQuery)}(this,function(t){return!function(t,e){"use strict";function n(t,e,n){var o=t.children(),a=!1;t.empty();for(var i=0,d=o.length;i<d;i++){var l=o.eq(i);if(t.append(l),n&&t.append(n),r(t,e)){l.remove(),a=!0;break}n&&n.detach()}return a}function o(e,n,i,d,l){var c=!1,s="a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style",u="script, .dotdotdot-keep";return e.contents().detach().each(function(){var h=this,f=t(h);if("undefined"==typeof h)return!0;if(f.is(u))e.append(f);else{if(c)return!0;e.append(f),!l||f.is(d.after)||f.find(d.after).length||e[e.is(s)?"after":"append"](l),r(i,d)&&(c=3==h.nodeType?a(f,n,i,d,l):o(f,n,i,d,l)),c||l&&l.detach()}}),n.addClass("is-truncated"),c}function a(e,n,o,a,d){var s=e[0];if(!s)return!1;var h=c(s),f=h.indexOf(" ")!==-1?" ":"　",p="letter"==a.wrap?"":f,g=h.split(p),v=-1,m=-1,b=0,y=g.length-1;if(a.fallbackToLetter&&0===b&&0===y&&(p="",g=h.split(p),y=g.length-1),a.maxLength)h=i(h.trim().substr(0,a.maxLength),a),l(s,h);else{for(;b<=y&&(0!==b||0!==y);){var w=Math.floor((b+y)/2);if(w==m)break;m=w,l(s,g.slice(0,m+1).join(p)+a.ellipsis),o.children().each(function(){t(this).toggle().toggle()}),r(o,a)?(y=m,a.fallbackToLetter&&0===b&&0===y&&(p="",g=g[0].split(p),v=-1,m=-1,b=0,y=g.length-1)):(v=m,b=m)}if(v==-1||1===g.length&&0===g[0].length){var x=e.parent();e.detach();var C=d&&d.closest(x).length?d.length:0;if(x.contents().length>C?s=u(x.contents().eq(-1-C),n):(s=u(x,n,!0),C||x.detach()),s&&(h=i(c(s),a),l(s,h),C&&d)){var k=d.parent();t(s).parent().append(d),t.trim(k.html())||k.remove()}}else h=i(g.slice(0,v+1).join(p),a),l(s,h)}return!0}function r(t,e){return t.innerHeight()>e.maxHeight||e.maxLength&&t.text().trim().length>e.maxLength}function i(e,n){for(;t.inArray(e.slice(-1),n.lastCharacter.remove)>-1;)e=e.slice(0,-1);return t.inArray(e.slice(-1),n.lastCharacter.noEllipsis)<0&&(e+=n.ellipsis),e}function d(t){return{width:t.innerWidth(),height:t.innerHeight()}}function l(t,e){t.innerText?t.innerText=e:t.nodeValue?t.nodeValue=e:t.textContent&&(t.textContent=e)}function c(t){return t.innerText?t.innerText:t.nodeValue?t.nodeValue:t.textContent?t.textContent:""}function s(t){do t=t.previousSibling;while(t&&1!==t.nodeType&&3!==t.nodeType);return t}function u(e,n,o){var a,r=e&&e[0];if(r){if(!o){if(3===r.nodeType)return r;if(t.trim(e.text()))return u(e.contents().last(),n)}for(a=s(r);!a;){if(e=e.parent(),e.is(n)||!e.length)return!1;a=s(e[0])}if(a)return u(t(a),n)}return!1}function h(e,n){return!!e&&("string"==typeof e?(e=t(e,n),!!e.length&&e):!!e.jquery&&e)}function f(t){for(var e=t.innerHeight(),n=["paddingTop","paddingBottom"],o=0,a=n.length;o<a;o++){var r=parseInt(t.css(n[o]),10);isNaN(r)&&(r=0),e-=r}return e}if(!t.fn.dotdotdot){t.fn.dotdotdot=function(e){if(0===this.length)return t.fn.dotdotdot.debug('No element found for "'+this.selector+'".'),this;if(this.length>1)return this.each(function(){t(this).dotdotdot(e)});var a=this,i=a.contents();a.data("dotdotdot")&&a.trigger("destroy.dot"),a.data("dotdotdot-style",a.attr("style")||""),a.css("word-wrap","break-word"),"nowrap"===a.css("white-space")&&a.css("white-space","normal"),
a.bind_events=function(){return a.bind("update.dot",function(e,d){switch(a.removeClass("is-truncated"),e.preventDefault(),e.stopPropagation(),typeof l.height){case"number":l.maxHeight=l.height;break;case"function":l.maxHeight=l.height.call(a[0]);break;default:l.maxHeight=f(a)}l.maxHeight+=l.tolerance,"undefined"!=typeof d&&(("string"==typeof d||"nodeType"in d&&1===d.nodeType)&&(d=t("<div />").append(d).contents()),d instanceof t&&(i=d)),g=a.wrapInner('<div class="dotdotdot" />').children(),g.contents().detach().end().append(i.clone(!0)).find("br").replaceWith("  <br />  ").end().css({height:"auto",width:"auto",border:"none",padding:0,margin:0});var s=!1,u=!1;return c.afterElement&&(s=c.afterElement.clone(!0),s.show(),c.afterElement.detach()),r(g,l)&&(u="children"==l.wrap?n(g,l,s):o(g,a,g,l,s)),g.replaceWith(g.contents()),g=null,t.isFunction(l.callback)&&l.callback.call(a[0],u,i),c.isTruncated=u,u}).bind("isTruncated.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],c.isTruncated),c.isTruncated}).bind("originalContent.dot",function(t,e){return t.preventDefault(),t.stopPropagation(),"function"==typeof e&&e.call(a[0],i),i}).bind("destroy.dot",function(t){t.preventDefault(),t.stopPropagation(),a.unwatch().unbind_events().contents().detach().end().append(i).attr("style",a.data("dotdotdot-style")||"").removeClass("is-truncated").data("dotdotdot",!1)}),a},a.unbind_events=function(){return a.unbind(".dot"),a},a.watch=function(){if(a.unwatch(),"window"==l.watch){var e=t(window),n=e.width(),o=e.height();e.bind("resize.dot"+c.dotId,function(){n==e.width()&&o==e.height()&&l.windowResizeFix||(n=e.width(),o=e.height(),u&&clearInterval(u),u=setTimeout(function(){a.trigger("update.dot")},100))})}else s=d(a),u=setInterval(function(){if(a.is(":visible")){var t=d(a);s.width==t.width&&s.height==t.height||(a.trigger("update.dot"),s=t)}},500);return a},a.unwatch=function(){return t(window).unbind("resize.dot"+c.dotId),u&&clearInterval(u),a};var l=t.extend(!0,{},t.fn.dotdotdot.defaults,e),c={},s={},u=null,g=null;return l.lastCharacter.remove instanceof Array||(l.lastCharacter.remove=t.fn.dotdotdot.defaultArrays.lastCharacter.remove),l.lastCharacter.noEllipsis instanceof Array||(l.lastCharacter.noEllipsis=t.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis),c.afterElement=h(l.after,a),c.isTruncated=!1,c.dotId=p++,a.data("dotdotdot",!0).bind_events().trigger("update.dot"),l.watch&&a.watch(),a},t.fn.dotdotdot.defaults={ellipsis:"... ",wrap:"word",fallbackToLetter:!0,lastCharacter:{},tolerance:0,callback:null,after:null,height:null,watch:!1,windowResizeFix:!0,maxLength:null},t.fn.dotdotdot.defaultArrays={lastCharacter:{remove:[" ","　",",",";",".","!","?"],noEllipsis:[]}},t.fn.dotdotdot.debug=function(t){};var p=1,g=t.fn.html;t.fn.html=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?this.trigger("update",[n]):g.apply(this,arguments)};var v=t.fn.text;t.fn.text=function(n){return n!=e&&!t.isFunction(n)&&this.data("dotdotdot")?(n=t("<div />").text(n).html(),this.trigger("update",[n])):v.apply(this,arguments)}}}(t),t(document).ready(function(t){t(".dot-ellipsis").each(function(){var e=t(this).hasClass("dot-resize-update"),n=t(this).hasClass("dot-timer-update"),o=0,a=t(this).attr("class").split(/\s+/);t.each(a,function(t,e){var n=e.match(/^dot-height-(\d+)$/);null!==n&&(o=Number(n[1]))});var r={};n&&(r.watch=!0),e&&(r.watch="window"),o>0&&(r.height=o),t(this).dotdotdot(r)})}),t(window).on("load",function(){t(".dot-ellipsis.dot-load-update").trigger("update.dot")}),!0}),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude&&{lat:e.tutor.latitude,lng:e.tutor.longitude}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document),function(t,e,n,o){"use strict";e.behaviors.tutor_clicks={attach:function(e,n){t(".custom_block_contact_button, .tutor-contact-free").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#right-contact-early").click(function(){t(this).addClass("contact-early-active"),t("#quicktabs-tab-profiles-10").trigger("click")}),t(".message_me").click(function(){t("#right-contact-early").removeClass("contact-early-active"),t("#quicktabs-tab-profiles-9").trigger("click")}),t("#tutor-phn").click(function(){t("#right-contact-early").removeClass("contact-early-active")})}},e.behaviors.tutor_colorbox={attach:function(t,n){void 0!==n.tutor&&n.tutor.no_ad_created&&jQuery.colorbox({html:'<div class="saved_search_message"><h3>'+e.t("PLEASE CREATE A FREE AD")+"</h3><p>"+e.t("Unfortunately you are unable to like a tutor ad until you have created a free ad. Please click 'continue' to start the free ad posting process. It is very quick and easy to do.")+'</p><a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">'+e.t("Continue")+"</a></div>",width:520})}},e.behaviors.tutor_map={attach:function(t,e){if(void 0!==e.tutor&&e.tutor.latitude&&e.tutor.longitude){({lat:e.tutor.latitude,lng:e.tutor.longitude})}}},e.behaviors.tutor_contact={attach:function(e,o){t("#tutor-phn").click(function(){"mail_send"==t("#tutor-phn").data("mail")?n.location.href=o.tutor.contact_mail_link:n.location.href=o.tutor.contact_phone_link})}},e.behaviors.parent_colorbox={attach:function(e,n){t("#right-contact-early").click(function(){t.colorbox({html:t("#contact_users_popup").html(),width:650})})}},e.behaviors.tutor_event={attach:function(e,n){function a(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}a(o,"mouseout",function(e){var n=t(".contact-early-active").length;if(null==e.toElement&&null==e.relatedTarget&&n>0){var o=jQuery("#contact_users_popup").html();jQuery.colorbox({html:o,width:650})}})}}}(jQuery,Drupal,this,this.document);
/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.tutor_clicks = {
    attach: function (context, settings) {
      $(".custom_block_contact_button, .tutor-contact-free").click(function(){
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#right-contact-early").click(function() {
        $(this).addClass('contact-early-active');
        $("#quicktabs-tab-profiles-10").trigger('click');
      });
      $(".message_me").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
        $("#quicktabs-tab-profiles-9").trigger('click');
      });
      $("#tutor-phn").click(function() {
        $('#right-contact-early').removeClass('contact-early-active');
      });
    }
  };

  Drupal.behaviors.tutor_colorbox = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.no_ad_created) {
        jQuery.colorbox({
          html:
            '<div class="saved_search_message">' +
              '<h3>' + Drupal.t('PLEASE CREATE A FREE AD') + '</h3>' +
              '<p>' + Drupal.t('Unfortunately you are unable to like a tutor ad until you have created a free ad. ' +
                'Please click \'continue\' to start the free ad posting process. It is very quick and easy to do.') + '</p>' +
              '<a href="/node/add/parent-ad" class="btnCloseCbox btn btn-default" style="width:150px;">' +
                Drupal.t('Continue') +
              '</a>' +
            '</div>',
          width: 520
        });
      }
    }
  };

  Drupal.behaviors.tutor_map = {
    attach: function (context, settings) {
      if (settings.tutor !== undefined && settings.tutor.latitude && settings.tutor.longitude)
        var pyrmont = {
          lat: settings.tutor.latitude,
          lng: settings.tutor.longitude
        };
  
      function initMap() {
        // Create the map.
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: pyrmont,
          mapTypeId: 'roadmap'
        });
    
        // Add the circle for this city to the map.
        var cityCircle = new google.maps.Circle({
          strokeColor: '#33afff',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#33afff',
          fillOpacity: 0.35,
          map: map,
          center: pyrmont,
          radius: 201
        });
    
        var marker = new google.maps.Marker({map: map});
    
        var mapcenter = new google.maps.LatLng(settings.tutor.latitude, settings.tutor.longitude);
        google.maps.event.addListener(map, 'bounds_changed', function () {
          map.setCenter(mapcenter);
        });
      }
    }
  };

  Drupal.behaviors.tutor_contact = {
    attach: function (context, settings) {
      $("#tutor-phn").click(function(){
        if($('#tutor-phn').data('mail') == 'mail_send') {
          window.location.href  = settings.tutor.contact_mail_link;
        } else {
          window.location.href  = settings.tutor.contact_phone_link;
        }
      });
    }
  };

  Drupal.behaviors.parent_colorbox = {
    attach: function (context, settings) {
      $("#right-contact-early").click(function() {
        $.colorbox({
          html: $('#contact_users_popup').html(),
          width: 650
        });
      });
    }
  };

  Drupal.behaviors.tutor_event = {
    attach: function (context, settings) {
      function addEvent(obj, evt, fn) {
        if (obj.addEventListener) {
          obj.addEventListener(evt, fn, false);
        }
        else if (obj.attachEvent) {
          obj.attachEvent("on" + evt, fn);
        }
      }
      function closeBox() {
        jQuery.colorbox.close();
      }
      addEvent(document, 'mouseout', function(evt) {
        var active_elem = $('.contact-early-active').length;
        if (evt.toElement == null && evt.relatedTarget == null ) {
          if (active_elem > 0) {            var divContent = jQuery('#contact_users_popup').html();
            jQuery.colorbox({
              html:divContent,
              width: 650
            });
          }
        }
      });
    }
  };
  $(document).ready(function() {
      var win_height = $(window).height();
      $('aside').css('height', win_height+'px');
      if ($(window).width() < 768) {
         $('.page-messages #header .navbar-header .nav-link').prepend('<button class="navbar-toggle msj"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button>');
      }
      $('.page-messages #header .navbar-header .nav-link .navbar-toggle.msj').click(function() {
        $(this).parents('#header').siblings('.main-container.section-wrapper').find('aside').slideToggle();
      });
      if(window.innerHeight > window.innerWidth){
        if ($(window).width() > 767) {
          $('.page-messages .main-container.section-wrapper').children('.row').children('section').css('width', '83.333333%').css('float', 'right');
        } else {
          $('.page-messages .main-container.section-wrapper').children('.row').children('section').css('width', '100%%').css('float', 'none');
        }
      } else if(window.innerWidth > window.innerHeight){
        if ($(window).width() > 767) {
          $('.page-messages .main-container.section-wrapper').children('.row').children('section').css('width', '83.333333%').css('float', 'right');
        } else {
          $('.page-messages .main-container.section-wrapper').children('.row').children('section').css('width', '100%%').css('float', 'none');
        }
      }
      $('.page-messages #block-block-16 img').removeAttr("title");
  });
  $(window).resize(function(){
      var win_height = $(window).height();
      $('aside').css('height', win_height+'px');
      if(window.innerHeight > window.innerWidth){
        if ($(window).width() > 767) {
          $('.page-messages .main-container.section-wrapper').children('.row').children('section').css('width', '83.333333%').css('float', 'right');
        } else {
          $('.page-messages .main-container.section-wrapper').children('.row').children('section').css('width', '100%%').css('float', 'none');
        }
      } else if(window.innerWidth > window.innerHeight){
        if ($(window).width() > 767) {
          $('.page-messages .main-container.section-wrapper').children('.row').children('section').css('width', '83.333333%').css('float', 'right');
        } else {
          $('.page-messages .main-container.section-wrapper').children('.row').children('section').css('width', '100%%').css('float', 'none');
        }
      }
  });
})(jQuery, Drupal, this, this.document);