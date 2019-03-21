(function($) {
if('glazed_backend' in window) return;
window.glazed_frontend = true;
window.glazed_elements = [];
window.glazed_extend = [];
function glazed_load_container(type, name, callback) {
    if (glazed_containers_loaded.hasOwnProperty(type + '/' + name)) {
      callback(glazed_containers_loaded[type + '/' + name]);
      return;
    }
    if (window.glazed_online) {
      if ('glazed_ajaxurl' in window) {
        $.ajax({
          type: 'POST',
          url: window.glazed_ajaxurl,
          data: {
            action: 'glazed_load_container',
            type: type,
            name: name,
          },
          cache: !window.glazed_editor,
        }).done(function(data) {
          glazed_containers_loaded[type + '/' + name] = data;
          callback(data);
        }).fail(function() {
          callback('');
        });
      }
    }
  }
function extend(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.baseclass = Parent;
  }
function mixin(dst, src) {
    var tobj = {};
    for (var x in src) {
      if ((typeof tobj[x] == "undefined") || (tobj[x] != src[x])) {
        dst[x] = src[x];
      }
    }
    if (document.all && !document.isOpera) {
      var p = src.toString;
      if (typeof p == "function" && p != dst.toString && p != tobj.toString &&
        p != "\nfunction toString() {\n  [native code]\n}\n") {
        dst.toString = src.toString;
      }
    }
    return dst;
  }
function substr_replace(str, replace, start, length) {
    if (start < 0) { // start position in str
      start = start + str.length;
    }
    length = length !== undefined ? length : str.length;
    if (length < 0) {
      length = length + str.length - start;
    }

    return str.slice(0, start) + replace.substr(0, length) + replace.slice(length) + str.slice(start + length);
  }
function unescapeParam(value) {
    if (_.isString(value))
      return value.replace(/(\`{2})/g, '"');
    else
      return value;
  }
$.fn.closest_descendents = function (filter) {
    var $found = $(),
      $currentSet = this;
    while ($currentSet.length) {
      $found = $.merge($found, $currentSet.filter(filter));
      $currentSet = $currentSet.not(filter);
      $currentSet = $currentSet.children();
    }
    return $found;
  }
function BaseParamType() {
    this.dom_element = null;
    this.heading = '';
    this.description = '';
    this.param_name = '';
    this.required = false;
    this.admin_label = '';
    this.holder = '';
    this.wrapper_class = '';
    this.value = null;
    this.can_be_empty = false;
    this.hidden = false;
    this.tab = '';
    this.dependency = {};
    if ('create' in this) {
      this.create();
    }
  }
BaseParamType.prototype.safe = true;
BaseParamType.prototype.param_types = {};
function make_param_type(settings) {
    if (settings.type in BaseParamType.prototype.param_types) {
      var new_param = new BaseParamType.prototype.param_types[settings.type];
      mixin(new_param, settings);
      return new_param;
    }
    else {
      var new_param = new BaseParamType();
      mixin(new_param, settings);
      return new_param;
    }
  }
window.glazed_add_css=function (path, callback) {
    var url = window.glazed_baseurl + path;
    if ($('link[href*="' + url + '"]').length || 'glazed_exported' in window) {
      callback();
      return;
    }
    var head = document.getElementsByTagName('head')[0];
    var stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.type = 'text/css';
    stylesheet.href = url;
    stylesheet.onload = callback;
    head.appendChild(stylesheet);
  }
window.glazed_add_js=function (options) {
    if ('loaded' in options && options.loaded || 'glazed_exported' in window) {
      options.callback();
    }
    else {
      glazed_add_external_js(window.glazed_baseurl + options.path, 'callback' in options ? options.callback :
        function() {});
    }
  }
window.glazed_add_js_list=function (options) {
    if ('loaded' in options && options.loaded) {
      options.callback();
    }
    else {
      var counter = 0;
      for (var i = 0; i < options.paths.length; i++) {
        glazed_add_js({
          path: options.paths[i],
          callback: function() {
            counter++;
            if (counter == options.paths.length) {
              options.callback();
            }
          }
        });
      }
    }
  }
var glazed_js_waiting_callbacks = {};
var glazed_loaded_js = {};
window.glazed_add_external_js=function (url, callback) {
      if (url in glazed_js_waiting_callbacks) {
        glazed_js_waiting_callbacks[url].push(callback);
        return;
      }
      else {
        if (url in glazed_loaded_js) {
          callback();
          return;
        }
      }
      glazed_js_waiting_callbacks[url] = [callback];
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = function() {
        glazed_loaded_js[url] = true;
        while (url in glazed_js_waiting_callbacks) {
          var callbacks = glazed_js_waiting_callbacks[url];
          glazed_js_waiting_callbacks[url] = undefined;
          delete glazed_js_waiting_callbacks[url];
          for (var i = 0; i < callbacks.length; i++) {
            callbacks[i]();
          }
        }
      };
      head.appendChild(script);
    }
function glazedElements() {}
glazedElements.prototype.elements_instances = {};
glazedElements.prototype.elements_instances_by_an_name = {};
glazedElements.prototype.get_element=function (id) {
      return this.elements_instances[id];
    }
glazedElements.prototype.delete_element=function (id) {
      $(document).trigger("glazed_delete_element", id);
      delete this.elements_instances[id];
    }
glazedElements.prototype.add_element=function (id, element, position) {
      this.elements_instances[id] = element;
      $(document).trigger("glazed_add_element", {
        id: id,
        position: position
      });
    }
glazedElements.prototype.try_render_unknown_elements=function () {
      if (this.template_elements_loaded && this.cms_elements_loaded) {
        for (var id in glazed_elements.elements_instances) {
          var el = glazed_elements.elements_instances[id];
          if (el instanceof UnknownElement) {
            var shortcode = el.attrs['content'];
            var match = /^\s*\<[\s\S]*\>\s*$/.exec(shortcode);
            if (match)
              BaseElement.prototype.parse_html.call(el, shortcode);
            else
              BaseElement.prototype.parse_shortcode.call(el, shortcode);
            for (var i = 0; i < el.children.length; i++) {
              el.children[i].recursive_render();
            }
            $(el.dom_content_element).empty();
            el.attach_children();
            if (window.glazed_editor)
              el.update_sortable();
            el.recursive_showed();
          }
        }
      }
    }
function BaseElement(parent, position) {
    this.id = Math.random().toString(36).substr(2, 5);
    if (parent != null) {
      this.parent = parent;
      if (typeof position === 'boolean') {
        if (position)
          parent.children.push(this);
        else
          parent.children.unshift(this);
      }
      else {
        parent.children.splice(position, 0, this);
      }
    }
    //
    this.children = [];
    this.dom_element = null;
    this.dom_content_element = null;
    this.attrs = {};
    for (var i = 0; i < this.params.length; i++) {
      if (_.isString(this.params[i].value))
        this.attrs[this.params[i].param_name] = this.params[i].value;
      else {
        if (!this.params[i].hidden)
          this.attrs[this.params[i].param_name] = '';
        //      if (_.isArray(this.params[i].value)) {
        //        this.attrs[this.params[i].param_name] = this.params[i].value[0];
        //      } else {
        //        if (_.isObject(this.params[i].value)) {
        //          var keys = _.keys(this.params[i].value);
        //          this.attrs[this.params[i].param_name] = keys[0];
        //        } else {
        //          this.attrs[this.params[i].param_name] = null;
        //        }
        //      }
      }
    }
    this.controls = null;
    glazed_elements.add_element(this.id, this, position);
  }
BaseElement.prototype.elements = {};
BaseElement.prototype.tags = {};
BaseElement.prototype.params=[{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
BaseElement.prototype.get_hover_style=function () {
      if ('hover_style' in this.attrs)
        return '<style><!-- .hover-style-' + this.id + ':hover ' + this.style_selector +
          ' { ' + this.attrs['hover_style'] + '} --></style>';
      else
        return '';
    }
BaseElement.prototype.get_el_classes=function () {
      var classes = this.attrs['el_class'];
      if (this.attrs['shadow'] > 0) {
        classes = classes + ' ' + 'glazed-shadow-' + this.attrs['shadow'];
      }
      if (this.attrs['hover_shadow'] > 0) {
        classes = classes + ' ' + 'glazed-shadow-hover-' + this.attrs['hover_shadow'];
      }
      return classes;
    }
BaseElement.prototype.showed=function ($) {
      if ('pos_left' in this.attrs && this.attrs['pos_left'] != '')
        $(this.dom_element).css("left", this.attrs['pos_left']);
      if ('pos_right' in this.attrs && this.attrs['pos_right'] != '')
        $(this.dom_element).css("right", this.attrs['pos_right']);
      if ('pos_top' in this.attrs && this.attrs['pos_top'] != '')
        $(this.dom_element).css("top", this.attrs['pos_top']);
      if ('pos_bottom' in this.attrs && this.attrs['pos_bottom'] != '')
        $(this.dom_element).css("bottom", this.attrs['pos_bottom']);
      if ('pos_width' in this.attrs && this.attrs['pos_width'] != '')
        $(this.dom_element).css("width", this.attrs['pos_width']);
      if ('pos_height' in this.attrs && this.attrs['pos_height'] != '')
        $(this.dom_element).css("height", this.attrs['pos_height']);
      if ('pos_zindex' in this.attrs && this.attrs['pos_zindex'] != '')
        $(this.dom_element).css("z-index", this.attrs['pos_zindex']);
      if ('hover_style' in this.attrs && this.attrs['hover_style'] != '') {
        $('head').find('#hover-style-' + this.id).remove();
        $('head').append(this.get_hover_style());
        $(this.dom_element).addClass('hover-style-' + this.id);
      }
    }
BaseElement.prototype.render=function ($) {
      $(this.dom_element).attr('data-az-id', this.id);
    }
BaseElement.prototype.recursive_render=function () {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].recursive_render();
      }
      if (glazed_frontend) {
        if (this.frontend_render) {
          this.detach_children();
          this.parent.detach_children();
          this.render($);
          this.attach_children();
          this.parent.attach_children();
        }
      }
      else {
        this.render($);
        this.attach_children();
      }
      if (window.glazed_editor) {
        this.show_controls();
        this.update_sortable();
      }
    }
BaseElement.prototype.replace_render=function () {
      var dom_element = this.dom_element;
      var dom_content_element = this.dom_content_element;
      if (dom_element != null) {
        this.render($);
        $(dom_element).replaceWith(this.dom_element);
        if (dom_content_element != null) {
          $(this.dom_content_element).replaceWith(dom_content_element);
        }
      }
      if (window.glazed_editor)
        this.show_controls();
    }
BaseElement.prototype.update_dom=function () {
      this.detach_children();
      $(this.dom_element).remove();
      this.parent.detach_children();
      this.render($);
      this.attach_children();
      if (window.glazed_editor)
        this.show_controls();
      this.parent.attach_children();
      if (window.glazed_editor) {
        this.update_sortable();
        this.update_empty();
      }
      this.showed($);
    }
BaseElement.prototype.attach_children=function () {
      for (var i = 0; i < this.children.length; i++) {
        $(this.dom_content_element).append(this.children[i].dom_element);
      }
    }
BaseElement.prototype.detach_children=function () {
      for (var i = 0; i < this.children.length; i++) {
        $(this.children[i].dom_element).detach();
      }
    }
BaseElement.prototype.recursive_showed=function () {
      this.showed($);
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].recursive_showed();
      }
    }
BaseElement.prototype.parse_attrs=function (attrs) {
      for (var i = 0; i < this.params.length; i++) {
        var param = this.params[i];
        if (param.param_name in attrs) {
          if (!param.safe) {
            var value = unescapeParam(attrs[param.param_name]);
            this.attrs[param.param_name] = decodeURIComponent(value.replace(/^#E\-8_/, ''));
          }
          else {
            this.attrs[param.param_name] = unescapeParam(attrs[param.param_name]);
          }
        }
        else {
          if ('value' in param && _.isString(param.value)) {
            this.attrs[param.param_name] = param.value;
          }
        }
      }
      for (var name in attrs) {
        if (!(name in this.attrs)) {
          this.attrs[name] = attrs[name];
        }
      }
      $(document).trigger("glazed_edited_element", this.id);
    }
BaseElement.prototype.parse_html=function (dom_element) {
      var element = this;
      if (($(dom_element).children().closest_descendents('[data-azb]').length == 0) && ($.trim($(dom_element).html())
          .length > 0)) {
        var row = new RowElement(element, false);
        row.children = [];
        var column = new ColumnElement(row, false);
        var constructor = BaseElement.prototype.elements['az_text'];
        var child = new constructor(column, false);
        child.attrs['content'] = $(dom_element).html();
        child.update_dom();
        if ('update_empty' in element)
          element.update_empty();
        if ('update_empty' in column)
          column.update_empty();
        if ('update_empty' in row)
          row.update_empty();
      }
      else {
        $(dom_element).children().closest_descendents('[data-azb]').each(function() {
          var tag = $(this).attr('data-azb');
          var constructor = UnknownElement;
          if (tag in BaseElement.prototype.tags) {
            constructor = BaseElement.prototype.tags[tag];
          }
          var child = new constructor(element, true);

          if (glazed_frontend) {
            glazed_elements.elements_instances[child.id] = null;
            delete glazed_elements.elements_instances[child.id];
            child.id = $(this).attr('data-az-id');
            glazed_elements.elements_instances[child.id] = child;
          }

          child.dom_element = $(this);
          var attrs = {};
          $($(this)[0].attributes).each(function() {
            if (this.nodeName.indexOf('data-azat') >= 0) {
              attrs[this.nodeName.replace('data-azat-', '')] = this.value;
            }
          });
          child.parse_attrs(attrs);
          if (child.is_container) {
            var cnt = $(this).closest_descendents('[data-azcnt]');
            if (cnt.length > 0) {
              child.dom_content_element = $(cnt);
              if (child.has_content) {
                if (child instanceof UnknownElement) {
                  child.attrs['content'] = $(cnt).wrap('<div></div>').parent().html();
                  $(cnt).unwrap();
                }
                else {
                  child.attrs['content'] = $(cnt).html();
                }
              }
              else {
                child.parse_html(cnt);
              }
            }
          }
        });
      }
    }
BaseElement.prototype.add_css=function (path, loaded, callback) {
      var container = this.get_my_container();
      container.css[window.glazed_baseurl + path] = true;
      if (!loaded) {
        window.glazed_add_css(path, callback);
      }
    }
BaseElement.prototype.add_js_list=function (options) {
      var container = this.get_my_container();
      for (var i = 0; i < options.paths.length; i++) {
        container.js[window.glazed_baseurl + options.paths[i]] = true;
      }
      window.glazed_add_js_list(options);
    }
BaseElement.prototype.add_js=function (options) {
      var container = this.get_my_container();
      container.js[window.glazed_baseurl + options.path] = true;
      window.glazed_add_js(options);
    }
BaseElement.prototype.add_external_js=function (url, callback) {
      var container = this.get_my_container();
      container.js[url] = true;
      window.glazed_add_external_js(url, callback);
    }
BaseElement.prototype.get_my_container=function () {
      if (this instanceof ContainerElement) {
        return this;
      }
      else {
        return this.parent.get_my_container();
      }
    }
BaseElement.prototype.trigger_start_in_animation=function () {
      for (var i = 0; i < this.children.length; i++) {
        if ('trigger_start_in_animation' in this.children[i]) {
          this.children[i].trigger_start_in_animation();
        }
      }
    }
BaseElement.prototype.trigger_start_out_animation=function () {
      for (var i = 0; i < this.children.length; i++) {
        if ('trigger_start_out_animation' in this.children[i]) {
          this.children[i].trigger_start_out_animation();
        }
      }
    }
function register_element(base, is_container, Element) {
    extend(Element, BaseElement);
    Element.prototype.base = base;
    Element.prototype.is_container = is_container;
    BaseElement.prototype.elements[base] = Element;
    BaseElement.prototype.tags[base] = Element;
    if (is_container) {
      for (var i = 1; i < BaseElement.prototype.max_nested_depth; i++) {
        BaseElement.prototype.tags[base + '_' + i] = Element;
      }
    }
  }
function UnknownElement(parent, position) {
    UnknownElement.baseclass.apply(this, arguments);
  }
register_element('az_unknown', true, UnknownElement);
UnknownElement.prototype.has_content = true;
window.glazed_online = (window.location.protocol == 'http:' || window.location.protocol == 'https:');
var glazed_elements = new glazedElements();
var p = '';
var fp = '';
var scroll_magic = null;
window.glazed_editor = false;
var glazed_containers = [];
var glazed_containers_loaded = {};
window.connect_container = function(dom_element) {
    if ($(dom_element).length > 0) {
      var html = $(dom_element).html();
      var match = /^\s*\<[\s\S]*\>\s*$/.exec(html);
      if (match || (html == '' && 'glazed_ajaxurl' in window)) {
        $(dom_element).find('> script').detach().appendTo('head');
        $(dom_element).find('> link[href]').detach().appendTo('head');
        //$(dom_element).find('> script').remove();
        //$(dom_element).find('> link[href]').remove();
        var container = new ContainerElement(null, false);
        container.attrs['container'] = $(dom_element).attr('data-az-type') + '/' + $(dom_element).attr('data-az-name');
        container.dom_element = $(dom_element);
        $(container.dom_element).attr('data-az-id', container.id);
        //container.dom_content_element = $(dom_element).closest_descendents('[data-azcnt]');
        container.dom_content_element = $(dom_element);
        $(container.dom_element).css('display', '');
        $(container.dom_element).addClass('glazed');
        $(container.dom_element).addClass('az-ctnr');
        container.parse_html(container.dom_content_element);
        container.html_content = true;
        container.loaded_container = container.attrs['container'];
        for (var i = 0; i < container.children.length; i++) {
          container.children[i].recursive_render();
        }
        if (!glazed_frontend) {
          container.dom_content_element.empty();
          if (window.glazed_editor) {
            container.show_controls();
            container.update_sortable();
          }
          container.attach_children();
        }
        container.rendered = true;
        for (var i = 0; i < container.children.length; i++) {
          container.children[i].recursive_showed();
        }
      }
      else {
        if (html.replace(/^\s+|\s+$/g, '') != '')
          glazed_containers_loaded[$(dom_element).attr('data-az-type') + '/' + $(dom_element).attr('data-az-name')] =
          html.replace(/^\s+|\s+$/g, '');
        var container = new ContainerElement(null, false);
        container.attrs['container'] = $(dom_element).attr('data-az-type') + '/' + $(dom_element).attr('data-az-name');
        container.render($);
        var classes = $(container.dom_element).attr('class') + ' ' + $(dom_element).attr('class');
        classes = $.unique(classes.split(' ')).join(' ');
        $(container.dom_element).attr('class', classes);
        $(container.dom_element).attr('style', $(dom_element).attr('style'));
        $(container.dom_element).css('display', '');
        $(container.dom_element).addClass('glazed');
        $(container.dom_element).addClass('az-ctnr');
        var type = $(dom_element).attr('data-az-type');
        var name = $(dom_element).attr('data-az-name');
        $(dom_element).replaceWith(container.dom_element);
        $(container.dom_element).attr('data-az-type', type);
        $(container.dom_element).attr('data-az-name', name);
        container.showed($);
        if (window.glazed_editor)
          container.show_controls();
      }
      if (window.glazed_editor) {
        $(container.dom_element).addClass('glazed-editor');
      }
      return container;
    }
    return null;
  }
function AnimatedElement(parent, position) {
    AnimatedElement.baseclass.apply(this, arguments);
  }
extend(AnimatedElement, BaseElement);
AnimatedElement.prototype.params=[{"param_name":"an_start","value":"","safe":true},{"param_name":"an_in","value":"","safe":true},{"param_name":"an_out","value":"","safe":true},{"param_name":"an_hidden","value":"","safe":true},{"param_name":"an_infinite","value":"","safe":true},{"param_name":"an_offset","value":"100","safe":true},{"param_name":"an_duration","value":"1000","safe":true},{"param_name":"an_in_delay","value":"0","safe":true},{"param_name":"an_out_delay","value":"0","safe":true},{"param_name":"an_parent","value":"1","safe":true},{"param_name":"an_name","value":"","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
AnimatedElement.prototype.set_in_timeout=function () {
      var element = this;
      element.in_timeout = setTimeout(function() {
        element.clear_animation();
        $(element.dom_element).css('opacity', '');
        $(element.dom_element).removeClass('animated');
        $(element.dom_element).removeClass(element.attrs['an_in']);
        $(element.dom_element).removeClass(element.attrs['an_out']);
        element.animation_in = false;
        element.animation_out = false;
        $(element.dom_element).css('animation-duration', element.attrs['an_duration'] + 'ms');
        $(element.dom_element).css('-webkit-animation-duration', element.attrs['an_duration'] + 'ms');
        $(element.dom_element).addClass('animated');
        element.animated = true;
        if (element.attrs['an_infinite'] == 'yes') {
          $(element.dom_element).addClass('infinite');
        }
        $(element.dom_element).addClass(element.attrs['an_in']);
        element.animation_in = true;
      }, Math.round(element.attrs['an_in_delay']));
    }
AnimatedElement.prototype.start_in_animation=function () {
      var element = this;
      if ($(element.dom_element).parents('.glazed-animations-disabled').length == 0) {
        if (element.attrs['an_in'] != '') {
          if (element.animated) {
            if (element.animation_out) {
              //still out-animate
              element.set_in_timeout();
            }
            else {
              if (element.out_timeout > 0) {
                //plan to in-animate
                clearTimeout(element.out_timeout);
                if (!element.hidden_after_in) {
                  element.set_in_timeout();
                }
              }
            }
          }
          else {
            //no animate, no plan
            element.set_in_timeout();
          }
        }
      }
    }
AnimatedElement.prototype.set_out_timeout=function () {
      var element = this;
      element.out_timeout = setTimeout(function() {
        element.clear_animation();
        $(element.dom_element).css('opacity', '');
        $(element.dom_element).removeClass('animated');
        $(element.dom_element).removeClass(element.attrs['an_in']);
        $(element.dom_element).removeClass(element.attrs['an_out']);
        element.animation_in = false;
        element.animation_out = false;
        $(element.dom_element).css('animation-duration', element.attrs['an_duration'] + 'ms');
        $(element.dom_element).css('-webkit-animation-duration', element.attrs['an_duration'] + 'ms');
        $(element.dom_element).addClass('animated');
        element.animated = true;
        if (element.attrs['an_infinite'] == 'yes') {
          $(element.dom_element).addClass('infinite');
        }
        $(element.dom_element).addClass(element.attrs['an_out']);
        element.animation_out = true;
      }, Math.round(element.attrs['an_out_delay']));
    }
AnimatedElement.prototype.start_out_animation=function () {
      var element = this;
      if ($(element.dom_element).parents('.glazed-animations-disabled').length == 0) {
        if (element.attrs['an_out'] != '') {
          if (element.animated) {
            if (element.animation_in) {
              //still in-animate
              element.set_out_timeout();
            }
            else {
              if (element.in_timeout > 0) {
                //plan to in-animate
                clearTimeout(element.in_timeout);
                if (!element.hidden_before_in) {
                  element.set_out_timeout();
                }
              }
            }
          }
          else {
            //no animate, no plan
            element.set_out_timeout();
          }
        }
      }
    }
AnimatedElement.prototype.clear_animation=function () {
      if (this.animation_in) {
        if (this.hidden_before_in) {
          $(this.dom_element).css('opacity', '1');
        }
        if (this.hidden_after_in) {
          $(this.dom_element).css('opacity', '0');
        }
      }
      if (this.animation_out) {
        if (this.hidden_before_in) {
          $(this.dom_element).css('opacity', '0');
        }
        if (this.hidden_after_in) {
          $(this.dom_element).css('opacity', '1');
        }
      }
      if ($(this.dom_element).hasClass('animated')) {
        $(this.dom_element).css('animation-duration', '');
        $(this.dom_element).css('-webkit-animation-duration', '');
        $(this.dom_element).removeClass('animated');
        this.animated = false;
        $(this.dom_element).removeClass('infinite');
        $(this.dom_element).removeClass(this.attrs['an_in']);
        $(this.dom_element).removeClass(this.attrs['an_out']);
        this.animation_in = false;
        this.animation_out = false;
      }
    }
AnimatedElement.prototype.end_animation=function () {
      this.in_timeout = 0;
      this.out_timeout = 0;
      if (this.animation_in) {
        this.clear_animation();
        if (this.attrs['an_start'] == 'hover' && !this.hover) {
          if (this.attrs['an_in'] != this.attrs['an_out']) {
            this.start_out_animation();
          }
        }
      }
      if (this.animation_out) {
        this.clear_animation();
        if (this.attrs['an_start'] == 'hover' && this.hover) {
          if (this.attrs['an_in'] != this.attrs['an_out']) {
            this.start_in_animation();
          }
        }
      }
    }
AnimatedElement.prototype.trigger_start_in_animation=function () {
      if (this.attrs['an_start'] == 'trigger') {
        this.start_in_animation();
      }
      else {
        AnimatedElement.baseclass.prototype.trigger_start_in_animation.apply(this, arguments);
      }
    }
AnimatedElement.prototype.trigger_start_out_animation=function () {
      if (this.attrs['an_start'] == 'trigger') {
        this.start_out_animation();
      }
      else {
        AnimatedElement.baseclass.prototype.trigger_start_out_animation.apply(this, arguments);
      }
    }
AnimatedElement.prototype.animation=function () {
      var element = this;
      element.hidden_before_in = _.indexOf(element.attrs['an_hidden'].split(','), 'before_in') >= 0;
      element.hidden_after_in = _.indexOf(element.attrs['an_hidden'].split(','), 'after_in') >= 0;
      if (element.hidden_before_in) {
        $(element.dom_element).css('opacity', '0');
      }
      if (element.hidden_after_in) {
        $(element.dom_element).css('opacity', '1');
      }

      var parent_number = element.attrs['an_parent'];
      if (parent_number == '') {
        parent_number = 1;
      }
      parent_number = Math.round(parent_number);
      var i = 0;
      var parent = $(element.dom_element);
      while (i < parent_number) {
        parent = $(parent).parent().closest('[data-az-id]');
        i++;
      }
      if (element.attrs['an_start'] != '') {
        element.in_timeout = 0;
        element.out_timeout = 0;
        element.animated = false;
        element.animation_in = false;
        element.animation_out = false;
        var callback = function() {
          $(parent).off('click.az_animation' + element.id);
          $(parent).off('mouseenter.az_animation' + element.id);
          $(parent).off('mouseleave.az_animation' + element.id);
          switch (element.attrs['an_start']) {
            case 'click':
              $(parent).on('click.az_animation' + element.id, function() {
                if (!element.animated) {
                  element.start_in_animation();
                }
              });
              break;
            case 'appear':
              element.add_js({
                path: 'vendor/jquery.waypoints/lib/jquery.waypoints.min.js',
                loaded: 'waypoint' in $.fn,
                callback: function() {
                  $(element.dom_element).waypoint(function(direction) {
                    if (!element.animated) {
                      element.start_in_animation();
                    }
                  }, {
                    offset: element.attrs['an_offset'] + '%',
                    handler: function(direction) {
                      this.destroy()
                    },
                  });
                  $(document).trigger('scroll');
                }
              });
              break;
            case 'hover':
              $(parent).on('mouseenter.az_animation' + element.id, function() {
                element.hover = true;
                element.start_in_animation();
              });
              $(parent).on('mouseleave.az_animation' + element.id, function() {
                element.hover = false;
                element.start_out_animation();
              });
              break;
            case 'trigger':
              break;
            default:
              break;
          }
        };
        element.add_css('vendor/animate.css/animate.min.css', false, function() {
          callback();
        });
      }
    }
AnimatedElement.prototype.showed=function ($) {
      AnimatedElement.baseclass.prototype.showed.apply(this, arguments);
      this.an_name = '';
      if ('an_name' in this.attrs && this.attrs['an_name'] != '') {
        this.an_name = this.attrs['an_name'];
        glazed_elements.elements_instances_by_an_name[this.an_name] = this;
      }
      if ('an_start' in this.attrs && this.attrs['an_start'] != '' && this.attrs['an_start'] != 'no') {
        this.animation();
      }
    }
AnimatedElement.prototype.render=function ($) {
      if ('an_name' in this.attrs && this.attrs['an_name'] != '') {
        $(this.dom_element).attr('data-an-name', this.attrs['an_name']);
      }
      AnimatedElement.baseclass.prototype.render.apply(this, arguments);
    }
function register_animated_element(base, is_container, Element) {
    extend(Element, AnimatedElement);
    Element.prototype.base = base;
    Element.prototype.is_container = is_container;
    AnimatedElement.prototype.elements[base] = Element;
    AnimatedElement.prototype.tags[base] = Element;
    if (is_container) {
      for (var i = 1; i < AnimatedElement.prototype.max_nested_depth; i++) {
        AnimatedElement.prototype.tags[base + '_' + i] = Element;
      }
    }
  }
function SectionElement(parent, position) {
    SectionElement.baseclass.apply(this, arguments);
  }
register_animated_element('az_section', true, SectionElement);
SectionElement.prototype.params=[{"param_name":"fluid","value":"","safe":true},{"param_name":"effect","value":"","safe":true},{"param_name":"parallax_speed","value":"","safe":true},{"param_name":"parallax_mode","value":"","safe":true},{"param_name":"video_options","value":"","safe":true},{"param_name":"video_youtube","value":"","safe":true},{"param_name":"video_start","value":"0","safe":true},{"param_name":"video_stop","value":"0","safe":true},{"param_name":"an_start","value":"","safe":true},{"param_name":"an_in","value":"","safe":true},{"param_name":"an_out","value":"","safe":true},{"param_name":"an_hidden","value":"","safe":true},{"param_name":"an_infinite","value":"","safe":true},{"param_name":"an_offset","value":"100","safe":true},{"param_name":"an_duration","value":"1000","safe":true},{"param_name":"an_in_delay","value":"0","safe":true},{"param_name":"an_out_delay","value":"0","safe":true},{"param_name":"an_parent","value":"1","safe":true},{"param_name":"an_name","value":"","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
SectionElement.prototype.showed=function ($) {
      SectionElement.baseclass.prototype.showed.apply(this, arguments);
      var element = this;
      switch (this.attrs['effect']) {
        case 'parallax':
          this.add_js_list({
            paths: ['vendor/jquery.parallax/jquery.parallax.js',
              'vendor/jquery.waypoints/lib/jquery.waypoints.min.js'
            ],
            loaded: 'waypoint' in $.fn && 'parallax' in $.fn,
            callback: function() {
              $(element.dom_element).waypoint(function(direction) {
                var background_position = $(element.dom_element).css('background-position');
                var match = background_position.match(/([\w%]*) [\w%]/);
                if (match == null)
                  var v = '50%';
                else
                  var v = match[1];
                $(element.dom_element).css('background-attachment', element.attrs['parallax_mode']);
                $(element.dom_element).css('background-position', v + ' 0');
                $(element.dom_element).parallax(v, element.attrs['parallax_speed'] / 100);
              }, {
                offset: '300%',
                handler: function(direction) {
                  this.destroy()
                },
              });
              $(document).trigger('scroll');
            }
          });
          break;
        case 'fixed':
          $(element.dom_element).css('background-attachment', 'fixed');
          break;
        case 'youtube':
          function youtube_parser(url) {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            var match = url.match(regExp);
            if (match && match[7].length == 11) {
              return match[7];
            }
            else {
              return false;
            }
          }
          var loop = _.indexOf(element.attrs['video_options'].split(','), 'loop') >= 0;
          var mute = _.indexOf(element.attrs['video_options'].split(','), 'mute') >= 0;
          this.add_css('vendor/jquery.mb.YTPlayer/dist/css/jquery.mb.YTPlayer.min.css', 'mb_YTPlayer' in $.fn,
            function() {});
          this.add_js_list({
            paths: ['vendor/jquery.mb.YTPlayer/dist/jquery.mb.YTPlayer.min.js',
              'vendor/jquery.waypoints/lib/jquery.waypoints.min.js'
            ],
            loaded: 'waypoint' in $.fn && 'mb_YTPlayer' in $.fn,
            callback: function() {
              $(element.dom_element).waypoint(function(direction) {
                $(element.dom_element).attr('data-property', "{videoURL:'" + youtube_parser(element.attrs[
                    'video_youtube']) + "',containment:'[data-az-id=" + element.id + "]" +
                  "', showControls:false, autoPlay:true, loop:" + loop.toString() + ", mute:" +
                  mute.toString() + ", startAt:" + element.attrs['video_start'] + ", stopAt:" +
                  element.attrs['video_stop'] + ", opacity:1, addRaster:false}");
                console.log('go!');
                $(element.dom_element).mb_YTPlayer();
                $(element.dom_element).playYTP();
              }, {
                offset: '300%',
                handler: function(direction) {
                  this.destroy()
                },
              });
              $(document).trigger('scroll');
            }
          });
          break;
        default:
          break;
      }
    }
function RowElement(parent, position) {
    RowElement.baseclass.apply(this, arguments);
    this.columns = '';
    if (!position || typeof position !== 'boolean') {
      this.set_columns('1/2 + 1/2');
    }
    this.attrs['device'] = 'sm';
  }
register_animated_element('az_row', true, RowElement);
RowElement.prototype.params=[{"param_name":"device","value":"","safe":true},{"param_name":"equal","value":"","safe":true},{"param_name":"an_start","value":"","safe":true},{"param_name":"an_in","value":"","safe":true},{"param_name":"an_out","value":"","safe":true},{"param_name":"an_hidden","value":"","safe":true},{"param_name":"an_infinite","value":"","safe":true},{"param_name":"an_offset","value":"100","safe":true},{"param_name":"an_duration","value":"1000","safe":true},{"param_name":"an_in_delay","value":"0","safe":true},{"param_name":"an_out_delay","value":"0","safe":true},{"param_name":"an_parent","value":"1","safe":true},{"param_name":"an_name","value":"","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
RowElement.prototype.showed=function ($) {
      RowElement.baseclass.prototype.showed.apply(this, arguments);
      var $domElement = $(this.dom_element);
      $domElement.addClass('az-row--' + this.attrs['device']);
      if (this.attrs['equal'] && this.attrs.equal === 'yes') {
        $domElement.addClass('az-row--equal-height');
      }
    }
RowElement.prototype.set_columns = function(columns){};
function ColumnElement(parent, position) {
    ColumnElement.baseclass.call(this, parent, position);
  }
register_element('az_column', true, ColumnElement);
ColumnElement.prototype.params=[{"param_name":"width","value":"","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
function ContainerElement(parent, position) {
    ContainerElement.baseclass.apply(this, arguments);
    this.rendered = false;
    this.loaded_container = null;
    this.js = {};
    this.css = {};
  }
register_animated_element('az_container', true, ContainerElement);
ContainerElement.prototype.params=[{"param_name":"container","value":"/","safe":true},{"param_name":"an_start","value":"","safe":true},{"param_name":"an_in","value":"","safe":true},{"param_name":"an_out","value":"","safe":true},{"param_name":"an_hidden","value":"","safe":true},{"param_name":"an_infinite","value":"","safe":true},{"param_name":"an_offset","value":"100","safe":true},{"param_name":"an_duration","value":"1000","safe":true},{"param_name":"an_in_delay","value":"0","safe":true},{"param_name":"an_out_delay","value":"0","safe":true},{"param_name":"an_parent","value":"1","safe":true},{"param_name":"an_name","value":"","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
ContainerElement.prototype.showed=function ($) {
      ContainerElement.baseclass.prototype.showed.apply(this, arguments);
      var element = this;
      if (this.parent == null) {
        if (!element.rendered) {
          element.rendered = true;
          element.load_container();
        }
      }
      else {
        this.add_js({
          path: 'vendor/jquery.waypoints/lib/jquery.waypoints.min.js',
          loaded: 'waypoint' in $.fn,
          callback: function() {
            $(element.dom_element).waypoint(function(direction) {
              if (!element.rendered) {
                element.rendered = true;
                element.load_container();
              }
            }, {
              offset: '100%',
              handler: function(direction) {
                this.destroy()
              },
            });
            $(document).trigger('scroll');
          }
        });
      }
    }
ContainerElement.prototype.load_container=function () {
      var element = this;
      // Avoid repetitive loading.
      window.loadedContainers = window.loadedContainers || {}
      if (window.loadedContainers[element.id]) {
        return;
      }
      window.loadedContainers[element.id] = true;
      if (this.attrs['container'] != '') {
        glazed_load_container(this.attrs['container'].split('/')[0], this.attrs['container'].split('/')[1],
          function(shortcode) {
            var match = /^\s*\<[\s\S]*\>\s*$/.exec(shortcode);
            if (match) {
              element.loaded_container = element.attrs['container'];
              $(shortcode).appendTo(element.dom_content_element);
              $(element.dom_content_element).find('> script').detach().appendTo('head');
              $(element.dom_content_element).find('> link[href]').detach().appendTo('head');
              $(element.dom_element).css('display', '');
              $(element.dom_element).addClass('glazed');
              element.parse_html(element.dom_content_element);
              $(element.dom_element).attr('data-az-id', element.id);
              element.html_content = true;
              for (var i = 0; i < element.children.length; i++) {
                element.children[i].recursive_render();
              }
              element.dom_content_element.empty();
              if (window.glazed_editor) {
                element.show_controls();
                element.update_sortable();
              }
              element.parent.attach_children();
              element.attach_children();
              for (var i = 0; i < element.children.length; i++) {
                element.children[i].recursive_showed();
              }
              $(document).trigger('scroll');
            }
            else {
              if (!glazed_frontend) {
                element.loaded_container = element.attrs['container'];
                element.parse_shortcode(shortcode);

                $(element.dom_element).attr('data-az-id', element.id);
                if (window.glazed_editor) {
                  element.show_controls();
                  element.update_sortable();
                }
                for (var i = 0; i < element.children.length; i++) {
                  element.children[i].recursive_render();
                }
                element.attach_children();
                if (element.parent != null) {
                  element.parent.update_dom();
                }
                for (var i = 0; i < element.children.length; i++) {
                  element.children[i].recursive_showed();
                }
                $(document).trigger('scroll');
              }
            }
            glazed_elements.try_render_unknown_elements();
          });
      }
    }
ContainerElement.prototype.update_dom=function () {
      if (this.loaded_container != this.attrs['container']) {
        this.children = [];
        $(this.dom_content_element).empty();
        this.rendered = false;
        if (this.parent != null) {
          ContainerElement.baseclass.prototype.update_dom.apply(this, arguments);
        }
      }
    }
ContainerElement.prototype.render=function ($) {
      this.dom_element = $('<div class="az-element az-container"><div class="az-ctnr"></div></div>');
      this.dom_content_element = $(this.dom_element).find('.az-ctnr');
      ContainerElement.baseclass.prototype.render.apply(this, arguments);
    }
ContainerElement.prototype.recursive_render=function () {
      if (glazed_frontend) {
        this.render($);
        this.children = [];
      }
      else {
        ContainerElement.baseclass.prototype.recursive_render.apply(this, arguments);
      }
      if (window.glazed_editor) {
        this.show_controls();
        this.update_sortable();
      }
    }
function LayersElement(parent, position) {
    LayersElement.baseclass.apply(this, arguments);
  }
register_animated_element('az_layers', true, LayersElement);
LayersElement.prototype.params=[{"param_name":"width","value":"100%","safe":true},{"param_name":"height","value":"500","safe":true},{"param_name":"responsive","value":"","safe":true},{"param_name":"o_width","value":"","safe":true},{"param_name":"an_start","value":"","safe":true},{"param_name":"an_in","value":"","safe":true},{"param_name":"an_out","value":"","safe":true},{"param_name":"an_hidden","value":"","safe":true},{"param_name":"an_infinite","value":"","safe":true},{"param_name":"an_offset","value":"100","safe":true},{"param_name":"an_duration","value":"1000","safe":true},{"param_name":"an_in_delay","value":"0","safe":true},{"param_name":"an_out_delay","value":"0","safe":true},{"param_name":"an_parent","value":"1","safe":true},{"param_name":"an_name","value":"","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
LayersElement.prototype.showed=function ($) {
      LayersElement.baseclass.prototype.showed.apply(this, arguments);
      var element = this;
      $(window).off('resize.az_layers' + element.id);
      if (this.attrs['responsive'] == 'yes') {
        function get_element_font_size(el, attr) {
          var v = '';
          var match = el.attrs[attr].match(/font-size[: ]*([\-\d\.]*)(px|%|em) *;/);
          if (match != null)
            v = match[1];
          return v;
        }

        function update_font_sizes(el, ratio) {
          //hover font size not updated !!!
          var fs = get_element_font_size(el, 'style');
          if (fs != '') {
            fs = fs * ratio;
            $(el.dom_element).css('font-size', fs + 'px');
          }
          for (var i = 0; i < el.children.length; i++)
            update_font_sizes(element.children[i], ratio);
        }

        $(window).on('resize.az_layers' + element.id, function() {
          var width = $(element.dom_element).width();
          if (!('o_width' in element.attrs) || element.attrs['o_width'] == '')
            element.attrs['o_width'] = width;
          var ratio = width / element.attrs['o_width'];
          $(element.dom_element).css('font-size', ratio * 100 + '%');
          $(element.dom_content_element).css('height', element.attrs['height'] * ratio + 'px');
          update_font_sizes(element, ratio);
        });
        $(window).trigger('resize');
      }
    }
function TabsElement(parent, position) {
    TabsElement.baseclass.apply(this, arguments);
    if (!position || typeof position !== 'boolean') {
      this.add_tab();
    }
  }
register_animated_element('az_tabs', true, TabsElement);
TabsElement.prototype.params=[{"param_name":"az_dirrection","value":"","safe":true},{"param_name":"an_start","value":"","safe":true},{"param_name":"an_in","value":"","safe":true},{"param_name":"an_out","value":"","safe":true},{"param_name":"an_hidden","value":"","safe":true},{"param_name":"an_infinite","value":"","safe":true},{"param_name":"an_offset","value":"100","safe":true},{"param_name":"an_duration","value":"1000","safe":true},{"param_name":"an_in_delay","value":"0","safe":true},{"param_name":"an_out_delay","value":"0","safe":true},{"param_name":"an_parent","value":"1","safe":true},{"param_name":"an_name","value":"","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
TabsElement.prototype.showed=function ($) {
      TabsElement.baseclass.prototype.showed.apply(this, arguments);
      $(this.dom_element).find('ul.nav-tabs li:first a')[fp + 'tab']('show');
    }
TabsElement.prototype.render=function ($) {
      this.dom_element = $('<div class="az-element az-tabs tabbable ' + this.get_el_classes() + this.attrs['az_dirrection'] + '" style="' + this.attrs[
        'style'] + '"></div>');
      var menu = '<ul class="nav nav-tabs" role="tablist">';
      for (var i = 0; i < this.children.length; i++) {
        menu += '<li><a href="#' + this.children[i].id + '" role="tab" data-toggle="tab">' + this.children[
          i].attrs['title'] + '</a></li>';
      }
      menu += '</ul>';
      $(this.dom_element).append(menu);
      var content = '<div id="' + this.id + '" class="tab-content"></div>';
      this.dom_content_element = $(content).appendTo(this.dom_element);
      TabsElement.baseclass.prototype.render.apply(this, arguments);
    }
function TabElement(parent, position) {
    TabElement.baseclass.apply(this, arguments);
  }
register_element('az_tab', true, TabElement);
TabElement.prototype.params=[{"param_name":"title","value":"Title","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
TabElement.prototype.render=function ($) {
      this.dom_element = $('<div id="' + this.id + '" class="az-element az-ctnr az-tab tab-pane ' +
        this.get_el_classes() + '" style="' + this.attrs['style'] + '"></div>');
      this.dom_content_element = this.dom_element;
      TabElement.baseclass.prototype.render.apply(this, arguments);
    }
function AccordionElement(parent, position) {
    AccordionElement.baseclass.apply(this, arguments);
    if (!position || typeof position !== 'boolean') {
      this.add_toggle();
    }
  }
register_animated_element('az_accordion', true, AccordionElement);
AccordionElement.prototype.params=[{"param_name":"collapsed","value":"","safe":true},{"param_name":"an_start","value":"","safe":true},{"param_name":"an_in","value":"","safe":true},{"param_name":"an_out","value":"","safe":true},{"param_name":"an_hidden","value":"","safe":true},{"param_name":"an_infinite","value":"","safe":true},{"param_name":"an_offset","value":"100","safe":true},{"param_name":"an_duration","value":"1000","safe":true},{"param_name":"an_in_delay","value":"0","safe":true},{"param_name":"an_out_delay","value":"0","safe":true},{"param_name":"an_parent","value":"1","safe":true},{"param_name":"an_name","value":"","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
AccordionElement.prototype.showed=function ($) {
      AccordionElement.baseclass.prototype.showed.apply(this, arguments);
      $(this.dom_element).find('> .az-toggle > .in').removeClass(p + 'in');
      $(this.dom_element).find('> .az-toggle > .collapse:not(:first)')[fp + 'collapse']({
        'toggle': false,
        'parent': '#' + this.id
      });
      $(this.dom_element).find('> .az-toggle > .collapse:first')[fp + 'collapse']({
        'toggle': this.attrs['collapsed'] != 'yes',
        'parent': '#' + this.id
      });
    }
AccordionElement.prototype.render=function ($) {
      this.dom_element = $('<div id="' + this.id + '" class="az-element az-accordion panel-group ' +
        this.get_el_classes() + '" style="' + this.attrs['style'] + '"></div>');
      this.dom_content_element = this.dom_element;
      AccordionElement.baseclass.prototype.render.apply(this, arguments);
    }
function ToggleElement(parent, position) {
    ToggleElement.baseclass.apply(this, arguments);
  }
register_element('az_toggle', true, ToggleElement);
ToggleElement.prototype.params=[{"param_name":"title","value":"Title","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
ToggleElement.prototype.render=function ($) {
      var type ='panel-default';
      if (this.parent.attrs['type'] != '')
        type = this.parent.attrs['type'];
      this.dom_element = $('<div class="az-element az-toggle panel ' + type + ' ' + this.attrs[
          'el_class'] + '" style="' + this.attrs['style'] + '"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' +
        this.parent.id + '" href="#' + this.id + '">' + this.attrs['title'] + '</a></h4></div><div id="' +
        this.id + '" class="panel-collapse collapse"><div class="panel-body az-ctnr"></div></div></div>');
      this.dom_content_element = $(this.dom_element).find('.panel-body');
      ToggleElement.baseclass.prototype.render.apply(this, arguments);
    }
function CarouselElement(parent, position) {
    CarouselElement.baseclass.apply(this, arguments);
    if (!position || typeof position !== 'boolean') {
      this.add_slide();
    }
  }
register_animated_element('az_carousel', true, CarouselElement);
CarouselElement.prototype.params=[{"param_name":"autoPlay","value":"","safe":true},{"param_name":"interval","value":"5000","safe":true},{"param_name":"items","value":"1","safe":true},{"param_name":"options","value":"","safe":true},{"param_name":"transition","value":"","safe":true},{"param_name":"an_start","value":"","safe":true},{"param_name":"an_in","value":"","safe":true},{"param_name":"an_out","value":"","safe":true},{"param_name":"an_hidden","value":"","safe":true},{"param_name":"an_infinite","value":"","safe":true},{"param_name":"an_offset","value":"100","safe":true},{"param_name":"an_duration","value":"1000","safe":true},{"param_name":"an_in_delay","value":"0","safe":true},{"param_name":"an_out_delay","value":"0","safe":true},{"param_name":"an_parent","value":"1","safe":true},{"param_name":"an_name","value":"","safe":true},{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
CarouselElement.prototype.frontend_render = true;
CarouselElement.prototype.showed=function ($) {
      CarouselElement.baseclass.prototype.showed.apply(this, arguments);
      var get_carousel_style = function(element) {
        var el = '[data-az-id=' + element.id + '] .st-owl-theme';
        output = '<style id="carousel-style-' + element.id + '"><!-- ';
        // Dots color
        if (element.attrs['pagination_shape'] == 'triangle') {
          output += el + ' .owl-page {background:transparent !important; border-bottom-color: ' + element.attrs['pagination_color'] + ' !important}';
          output += el + ' .owl-page.active {background:transparent !important; border-bottom-color: ' + element.attrs['pagination_active_color'] + ' !important}';
        }
        else {
          output += el + ' .owl-page {background: ' + element.attrs['pagination_color'] + ' !important}';
          output += el + ' .owl-page.active {background: ' + element.attrs['pagination_active_color'] + ' !important}';
        }
        // Icon Color and thickness
        output += el + ' .owl-buttons .owl-prev::after, ' + el + ' .owl-buttons .owl-next::after,'
          + el + ' .owl-buttons .owl-prev::before, ' + el + ' .owl-buttons .owl-next::before {'
          + 'background: ' + element.attrs['navigation_icon_color'] + ';'
          + 'width: ' + element.attrs['navigation_thickness'] + 'px;'
          + '}';
        // Icon Hover color
        output += el + ' .owl-buttons .owl-prev:hover::after, ' + el + ' .owl-buttons .owl-next:hover::after,'
          + el + ' .owl-buttons .owl-prev:hover::before, ' + el + ' .owl-buttons .owl-next:hover::before {'
          + 'background: ' + element.attrs['navigation_icon_hover_color'] + '}';
        // Icon Background Color
        output += el + ' .owl-buttons .owl-prev, ' + el + ' .owl-buttons .owl-next {'
          + 'background: ' + element.attrs['navigation_background_color'] + ';'
          + 'border-color: ' + element.attrs['navigation_background_color'] + ' }';
        // Icon Background Hover Color
        output += el + ' .owl-buttons .owl-prev:hover, ' + el + ' .owl-buttons .owl-next:hover {'
          + 'background: ' + element.attrs['navigation_background_hover_color'] + ';'
          + 'border-color: ' + element.attrs['navigation_background_hover_color'] + ' }';

        output += ' --></style>';
        return output;
      }
      this.add_css('vendor/owl.carousel/owl-carousel/owl.carousel.css', 'owlCarousel' in $.fn, function() {});
      this.add_css('css/st-owl-carousel.css', 'owlCarousel' in $.fn, function() {});
      this.add_css('vendor/owl.carousel/owl-carousel/owl.transitions.css', 'owlCarousel' in $.fn, function() {});
      var element = this;
      this.add_js({
        path: 'vendor/owl.carousel/owl-carousel/owl.carousel.js',
        loaded: 'owlCarousel' in $.fn,
        callback: function() {
          //element.controls.detach();
          var owl_carousel_refresh = function(owl) {
            var userItems = null;
            if ('userItems' in owl)
              userItems = owl.userItems;
            else
              userItems = owl.$userItems;
            var visibleItems = null;
            if ('visibleItems' in owl)
              visibleItems = owl.visibleItems;
            else
              visibleItems = owl.$visibleItems;
            for (var i = 0; i < userItems.length; i++) {
              if (_.indexOf(visibleItems, i) < 0) {
                var item = userItems[i];
                var id = $(item).attr('data-az-id');
                var el = glazed_elements.get_element(id);
                if (!_.isUndefined(el)) {
                  if ('trigger_start_out_animation' in el)
                    el.trigger_start_out_animation();
                }
              }
            }
            for (var i = 0; i < visibleItems.length; i++) {
              if (visibleItems[i] < userItems.length) {
                var item = userItems[visibleItems[i]];
                var id = $(item).attr('data-az-id');
                var el = glazed_elements.get_element(id);
                if (!_.isUndefined(el)) {
                  if ('trigger_start_in_animation' in el)
                    el.trigger_start_in_animation();
                }
              }
            }
          }
          var owlClasses = 'st-owl-theme';
          if (element.attrs['pagination']) {
            if (element.attrs['pagination_orientation'])
              owlClasses += ' st-owl-pager-' + element.attrs['pagination_orientation'];
            if (element.attrs['pagination_shape'])
              owlClasses += ' st-owl-pager-' + element.attrs['pagination_shape'];
            if (element.attrs['pagination_transform'])
              owlClasses += ' st-owl-pager-' + element.attrs['pagination_transform'];
          }
          if (element.attrs['navigation']) {
            if (element.attrs['navigation_orientation'])
              owlClasses += ' st-owl-navigation-' + element.attrs['navigation_orientation'];
            if (element.attrs['navigation_shape'])
              owlClasses += ' st-owl-navigation-' + element.attrs['navigation_shape'];
            if (element.attrs['navigation_position'])
              owlClasses += ' st-owl-navigation-' + element.attrs['navigation_position'];
          }
          var autoPlay = false;
          if (!Boolean(element.attrs['autoplay']) && (element.attrs['interval'] > 0)) {
            autoPlay = element.attrs['interval'];
          }
          $(element.dom_content_element).owlCarousel({
            addClassActive: true,
            afterAction: function() {owl_carousel_refresh(this.owl);},
            afterMove: function() {},
            autoPlay: autoPlay,
            beforeMove: function() {},
            items: element.attrs['items'],
            mouseDrag: true,
            navigation: Boolean(element.attrs['navigation']),
            navigationText: false,
            pagination: Boolean(element.attrs['pagination']),
            singleItem: (element.attrs['items'] == '1'),
            startDragging: function() {},
            stopOnHover: Boolean(element.attrs['stopOnHover']),
            theme: owlClasses,
            touchDrag: true,
            transitionStyle: element.attrs['transition'] == '' ? false : element.attrs['transition'],
          });
          owl_carousel_refresh(element.dom_content_element.data('owlCarousel'));
          if ((element.attrs['navigation_orientation'] == 'outside') &&
            ((element.attrs['navigation_position'] == 'topLeft')
              || (element.attrs['navigation_position'] == 'topRight')
              || (element.attrs['navigation_position'] == 'topCenter'))) {
            $(element.dom_content_element).find('.owl-buttons').prependTo($(element.dom_content_element));
          }
          $('head').find('#carousel-style-' + element.id).remove();
          $('head').append(get_carousel_style(element));
          //$(element.dom_element).prepend(element.controls);
        }
      });
    }
CarouselElement.prototype.render=function ($) {
      this.dom_element = $('<div id="' + this.id + '" class="az-element az-carousel ' + this.get_el_classes() +
        '" style="' + this.attrs['style'] + '"></div>');
      this.dom_content_element = $('<div></div>').appendTo(this.dom_element);
      CarouselElement.baseclass.prototype.render.apply(this, arguments);
    }
function SlideElement(parent, position) {
    SlideElement.baseclass.apply(this, arguments);
  }
register_element('az_slide', true, SlideElement);
SlideElement.prototype.params=[{"param_name":"el_class","value":"","safe":true},{"param_name":"style","value":"","safe":true},{"param_name":"hover_style","value":"","safe":true},{"param_name":"pos_left","value":"","safe":true},{"param_name":"pos_right","value":"","safe":true},{"param_name":"pos_top","value":"","safe":true},{"param_name":"pos_bottom","value":"","safe":true},{"param_name":"pos_width","value":"","safe":true},{"param_name":"pos_height","value":"","safe":true},{"param_name":"pos_zindex","value":"","safe":true}];
SlideElement.prototype.frontend_render = true;
SlideElement.prototype.render=function ($) {
      var type = 'panel-default';
      if (this.parent.attrs['type'] != '')
        type = this.parent.attrs['type'];
      this.dom_element = $('<div class="az-element az-slide az-ctnr ' + this.get_el_classes() + ' clearfix" style="' + this.attrs['style'] + '"></div>');
      this.dom_content_element = this.dom_element;
      SlideElement.baseclass.prototype.render.apply(this, arguments);
    }
if (!('glazed_elements' in window)) { window.glazed_elements = []; }
window.glazed_elements.push({base: "az_alert",
params: [{"param_name":"message","value":"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},{"param_name":"type","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
});
window.glazed_elements.push({base: "az_blockquote",
params: [{"param_name":"content","value":"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},{"param_name":"cite","value":""},{"param_name":"reverse","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
is_container: true,
has_content: true,
});
window.glazed_elements.push({base: "az_button",
params: [{"param_name":"title","value":""},{"param_name":"link","value":""},{"param_name":"link_target","value":""},{"param_name":"type","value":""},{"param_name":"block","value":""},{"param_name":"size","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
});
window.glazed_elements.push({base: "az_circle_counter",
showed: function ($) {
      this.baseclass.prototype.showed.apply(this, arguments);
      var icon_set = this.attrs['icon'].charAt(0);
      switch (icon_set) {
        case 'e':
          this.add_css('vendor/et-line-font/et-line-font.css', 'ETLineFont' in $.fn, function() {});
          break;
        case 'f':
          this.add_css('vendor/font-awesome/css/font-awesome.min.css', 'fontAwesome' in $.fn, function() {});
          break;
        case 'p':
          this.add_css('vendor/pe-icon-7-stroke/css/pe-icon-7-stroke.css', 'PELineFont' in $.fn, function() {});
          break;
        default:
          break;
      }
      var element = this;
      this.add_css('vendor/jquery.circliful/css/jquery.circliful.css', 'circliful' in $.fn, function() {});
      this.add_js_list({
        paths: ['vendor/jquery.circliful/js/jquery.circliful.min.js',
          'vendor/jquery.waypoints/lib/jquery.waypoints.min.js'
        ],
        loaded: 'waypoint' in $.fn && 'circliful' in $.fn,
        callback: function() {
          $(element.dom_element).waypoint(function(direction) {
            $(element.dom_element).find('#' + element.id).once().circliful();
          }, {
            offset: '100%',
            handler: function(direction) {
              this.destroy()
            },
          });
          $(document).trigger('scroll');
        }
      });
    },
params: [{"param_name":"fgcolor","value":"#333333"},{"param_name":"bgcolor","value":"#999999"},{"param_name":"fill","value":""},{"param_name":"type","value":""},{"param_name":"dimension","value":"250"},{"param_name":"text","value":""},{"param_name":"fontsize","value":"16"},{"param_name":"info","value":""},{"param_name":"width","value":"5"},{"param_name":"percent","value":"50"},{"param_name":"border","value":""},{"param_name":"icon","value":""},{"param_name":"icon_size","value":"16"},{"param_name":"icon_color","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
frontend_render: true,
render: function ($) {
      if (this.attrs['icon']) {
        var circliful_icon = '" data-icon=" ' + this.attrs['icon'] + '" data-iconsize="' + this.attrs[
            'icon_size'] + '" data-iconcolor="' + this.attrs['icon_color'];
      }
      else {
        var circliful_icon = '';
      }
      this.dom_element = $('<div class="az-element az-circle-counter ' + this.get_el_classes() + '" style="' +
        this.attrs['style'] + '"><div id="' + this.id + '" data-dimension="' + this.attrs['dimension'] +
        '" data-text="' + this.attrs['text'] + '" data-info="' + this.attrs['info'] + '" data-width="' + this
          .attrs['width'] + '" data-fontsize="' + this.attrs['fontsize'] + '" data-type="' + this.attrs['type'] +
        '" data-percent="' + this.attrs['percent'] + '" data-fgcolor="' + this.attrs['fgcolor'] +
        '" data-bgcolor="' + this.attrs['bgcolor'] + '" data-fill="' + this.attrs['fill'] + '" data-border="' +
        this.attrs['border'] + circliful_icon + '"></div></div>');

      this.baseclass.prototype.render.apply(this, arguments);
    },
});
window.glazed_elements.push({base: "az_countdown",
showed: function ($) {
      this.baseclass.prototype.showed.apply(this, arguments);
      var element = this;
      this.add_css('vendor/counteverest/css/counteverest.glazed.css', 'countEverest' in $.fn, function() {});
      this.add_js_list({
        paths: ['vendor/counteverest/js/vendor/jquery.counteverest.min.js',
          'vendor/datetimepicker/jquery.datetimepicker.js'
        ],
        loaded: 'countEverest' in $.fn && 'datetimepicker' in $.fn,
        callback: function() {
          var options = {};
          switch (element.attrs['countdown_style']) {
            case 'style6':
            function countEverestFlipAnimate($el, data) {
              $el.each(function(index) {
                var $this = $(this),
                  $flipFront = $this.find('.ce-flip-front'),
                  $flipBack = $this.find('.ce-flip-back'),
                  field = $flipBack.text(),
                  fieldOld = $this.attr('data-old');
                if (typeof fieldOld === 'undefined') {
                  $this.attr('data-old', field);
                }
                if (field != fieldOld) {
                  $this.addClass('ce-animate');
                  window.setTimeout(function() {
                    $flipFront.text(field);
                    $this
                      .removeClass('ce-animate')
                      .attr('data-old', field);
                  }, 800);
                }
              });
            }
              if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') >
                0) {
                $('html').addClass('internet-explorer');
              }

              options = {
                daysWrapper: '.ce-days .ce-flip-back',
                hoursWrapper: '.ce-hours .ce-flip-back',
                minutesWrapper: '.ce-minutes .ce-flip-back',
                secondsWrapper: '.ce-seconds .ce-flip-back',
                wrapDigits: false,
                onChange: function() {
                  countEverestFlipAnimate($(element.dom_element).find('.ce-countdown .ce-col>div'),
                    this);
                }
              }
              break;
            case 'style9':
            function deg(v) {
              return (Math.PI / 180) * v - (Math.PI / 2);
            }

            function drawCircle(canvas, value, max) {
              var circle = canvas.getContext('2d');

              circle.clearRect(0, 0, canvas.width, canvas.height);
              circle.lineWidth = 6;

              circle.beginPath();
              circle.arc(
                canvas.width / 2,
                canvas.height / 2,
                canvas.width / 2 - circle.lineWidth,
                deg(0),
                deg(360 / max * (max - value)),
                false);
              circle.strokeStyle = '#282828';
              circle.stroke();

              circle.beginPath();
              circle.arc(
                canvas.width / 2,
                canvas.height / 2,
                canvas.width / 2 - circle.lineWidth,
                deg(0),
                deg(360 / max * (max - value)),
                true);
              circle.strokeStyle = '#1488cb';
              circle.stroke();
            }
              options = {
                leftHandZeros: false,
                onChange: function() {
                  drawCircle($(element.dom_element).find('#ce-days').get(0), this.days, 365);
                  drawCircle($(element.dom_element).find('#ce-hours').get(0), this.hours, 24);
                  drawCircle($(element.dom_element).find('#ce-minutes').get(0), this.minutes, 60);
                  drawCircle($(element.dom_element).find('#ce-seconds').get(0), this.seconds, 60);
                }
              }
              break;
            case 'style10':
              var $countdown = $(element.dom_element).find('.ce-countdown');
              var firstCalculation = true;
              options = {
                leftHandZeros: true,
                dayLabel: null,
                hourLabel: null,
                minuteLabel: null,
                secondLabel: null,
                afterCalculation: function() {
                  var plugin = this,
                    units = {
                      days: this.days,
                      hours: this.hours,
                      minutes: this.minutes,
                      seconds: this.seconds
                    },
                  //max values per unit
                    maxValues = {
                      hours: '23',
                      minutes: '59',
                      seconds: '59'
                    },
                    actClass = 'active',
                    befClass = 'before';

                  //build necessary elements
                  if (firstCalculation == true) {
                    firstCalculation = false;

                    //build necessary markup
                    $countdown.find('.ce-unit-wrap div').each(function() {
                      var $this = $(this),
                        className = $this.attr('class'),
                        unit = className.substring(3);
                      value = units[unit],
                        sub = '',
                        dig = '';

                      //build markup per unit digit
                      for (var x = 0; x < 10; x++) {
                        sub += [
                          '<div class="ce-digits-inner">',
                          '<div class="ce-flip-wrap">',
                          '<div class="ce-up">',
                          '<div class="ce-shadow"></div>',
                          '<div class="ce-inn">' + x + '</div>',
                          '</div>',
                          '<div class="ce-down">',
                          '<div class="ce-shadow"></div>',
                          '<div class="ce-inn">' + x + '</div>',
                          '</div>',
                          '</div>',
                          '</div>'
                        ].join('');
                      }

                      //build markup for number
                      for (var i = 0; i < value.length; i++) {
                        dig += '<div class="ce-digits">' + sub + '</div>';
                      }
                      $this.append(dig);
                    });
                  }

                  //iterate through units
                  $.each(units, function(unit) {
                    var digitCount = $countdown.find('.ce-' + unit + ' .ce-digits').length,
                      maxValueUnit = maxValues[unit],
                      maxValueDigit,
                      value = plugin.strPad(this, digitCount, '0');

                    //iterate through digits of an unit
                    for (var i = value.length - 1; i >= 0; i--) {
                      var $digitsWrap = $countdown.find('.ce-' + unit + ' .ce-digits:eq(' + (i) +
                          ')'),
                        $digits = $digitsWrap.find('div.ce-digits-inner');

                      //use defined max value for digit or simply 9
                      if (maxValueUnit) {
                        maxValueDigit = (maxValueUnit[i] == 0) ? 9 : maxValueUnit[i];
                      }
                      else {
                        maxValueDigit = 9;
                      }

                      //which numbers get the active and before class
                      var activeIndex = parseInt(value[i]),
                        beforeIndex = (activeIndex == maxValueDigit) ? 0 : activeIndex + 1;

                      //check if value change is needed
                      if ($digits.eq(beforeIndex).hasClass(actClass)) {
                        $digits.parent().addClass('play');
                      }

                      //remove all classes
                      $digits
                        .removeClass(actClass)
                        .removeClass(befClass);

                      //set classes
                      $digits.eq(activeIndex).addClass(actClass);
                      $digits.eq(beforeIndex).addClass(befClass);
                    }
                  });
                }
              }
              break;
          }

          $.extend(options, {
            daysLabel: Drupal.t('Days'),
            dayLabel: Drupal.t('Day'),
            hoursLabel: Drupal.t('Hours'),
            hourLabel: Drupal.t('Hour'),
            minutesLabel: Drupal.t('Minutes'),
            minuteLabel: Drupal.t('Minute'),
            secondsLabel: Drupal.t('Seconds'),
            secondLabel: Drupal.t('Second'),
            decisecondsLabel: Drupal.t('Deciseconds'),
            decisecondLabel: Drupal.t('Decisecon'),
            millisecondsLabel: Drupal.t('Milliseconds'),
            millisecondLabel: Drupal.t('Millisecond')
          });

          switch (element.attrs['counter_scope']) {
            case 'date':
              var d = Date.parseDate(element.attrs['date'], 'd.m.Y');
              if (d != null)
                $(element.dom_element).countEverest($.extend(options, {
                  day: d.getDate(),
                  month: d.getMonth() + 1,
                  year: d.getFullYear(),
                }));
              break;
            case 'date_time':
              var d = Date.parseDate(element.attrs['date_time'], 'd.m.Y H');
              if (d != null)
                $(element.dom_element).countEverest($.extend(options, {
                  day: d.getDate(),
                  month: d.getMonth() + 1,
                  year: d.getFullYear(),
                  hour: d.getHours()
                }));
              break;
            case 'repeating':
              var d = new Date();
              d.setHours(element.attrs['time']);
              if (d != null)
                $(element.dom_element).countEverest($.extend(options, {
                  day: d.getDate(),
                  month: d.getMonth() + 1,
                  year: d.getFullYear(),
                  hour: d.getHours(),
                  onComplete: function() {
                    if (element.attrs['referrer'] != '') {
                      window.location.replace(element.attrs['referrer']);
                    }
                  }
                }));
              break;
            case 'resetting':
              if (element.attrs['saved'] != '') {
                var saved = new Date(element.attrs['saved']);
                var interval = (Math.round(element.attrs['reset_hours']) * 60 * 60 + Math.round(element.attrs[
                    'reset_minutes']) * 60 + Math.round(element.attrs['reset_seconds'])) * 1000;
                if (element.attrs['restart'] == 'yes') {
                  var current = new Date();
                  var elapsed = current.getTime() - saved.getTime();
                  var k = elapsed / interval;
                  elapsed = elapsed - Math.floor(k) * interval;
                  var delta = interval - elapsed;
                  var d = new Date(current.getTime() + delta);
                  $(element.dom_element).countEverest($.extend(options, {
                    day: d.getDate(),
                    month: d.getMonth() + 1,
                    year: d.getFullYear(),
                    hour: d.getHours(),
                    minute: d.getMinutes(),
                    second: d.getSeconds(),
                    onComplete: function() {
                      if (element.attrs['referrer'] != '') {
                        window.location.replace(element.attrs['referrer']);
                      }
                    }
                  }));
                }
                else {
                  var d = new Date(saved.getTime() + interval);
                  $(element.dom_element).countEverest($.extend(options, {
                    day: d.getDate(),
                    month: d.getMonth() + 1,
                    year: d.getFullYear(),
                    hour: d.getHours(),
                    minute: d.getMinutes(),
                    second: d.getSeconds(),
                    onComplete: function() {
                      if (element.attrs['referrer'] != '') {
                        window.location.replace(element.attrs['referrer']);
                      }
                    }
                  }));
                }
              }
              break;
            default:
              break;
          }
        }
      });
    },
params: [{"param_name":"countdown_style","value":""},{"param_name":"counter_scope","value":""},{"param_name":"date","value":""},{"param_name":"date_time","value":""},{"param_name":"time","value":""},{"param_name":"reset_hours","value":""},{"param_name":"reset_minutes","value":""},{"param_name":"reset_seconds","value":""},{"param_name":"referrer","value":""},{"param_name":"restart","value":""},{"param_name":"saved","value":""},{"param_name":"display","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
frontend_render: true,
render: function ($) {
      this.dom_element = $('<div class="az-element az-countdown ' + this.get_el_classes() + '" style="' + this
          .attrs['style'] + '"></div>');
      var countdown = $('<div class="ce-countdown"></div>').appendTo(this.dom_element);
      switch (this.attrs['countdown_style']) {
        case 'style1':
          $(this.dom_element).addClass('ce-countdown--theme-1');
          if (_.indexOf(this.attrs['display'].split(','), 'days') >= 0)
            $(countdown).append(
              '<div class="ce-col"><span class="ce-days"></span> <span class="ce-days-label"></span></div>');
          if (_.indexOf(this.attrs['display'].split(','), 'hours') >= 0)
            $(countdown).append(
              '<div class="ce-col"><span class="ce-hours"></span> <span class="ce-hours-label"></span></div>');
          if (_.indexOf(this.attrs['display'].split(','), 'minutes') >= 0)
            $(countdown).append(
              '<div class="ce-col"><span class="ce-minutes"></span> <span class="ce-minutes-label"></span></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'seconds') >= 0)
            $(countdown).append(
              '<div class="ce-col"><span class="ce-seconds"></span> <span class="ce-seconds-label"></span></div>'
            );
          break;
        case 'style6':
          $(this.dom_element).addClass('ce-countdown--theme-6 clearfix');
          if (_.indexOf(this.attrs['display'].split(','), 'days') >= 0)
            $(countdown).append(
              '<div class="ce-col col-md-3"><div class="ce-days"><div class="ce-flip-wrap"><div class="ce-flip-front bg-primary"></div><div class="ce-flip-back bg-primary"></div></div></div><span class="ce-days-label"></span></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'hours') >= 0)
            $(countdown).append(
              '<div class="ce-col col-md-3"><div class="ce-hours"><div class="ce-flip-wrap"><div class="ce-flip-front bg-primary"></div><div class="ce-flip-back bg-primary"></div></div></div><span class="ce-hours-label"></span></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'minutes') >= 0)
            $(countdown).append(
              '<div class="ce-col col-md-3"><div class="ce-minutes"><div class="ce-flip-wrap"><div class="ce-flip-front bg-primary"></div><div class="ce-flip-back bg-primary"></div></div></div><span class="ce-minutes-label"></span></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'seconds') >= 0)
            $(countdown).append(
              '<div class="ce-col col-md-3"><div class="ce-seconds"><div class="ce-flip-wrap"><div class="ce-flip-front bg-primary"></div><div class="ce-flip-back bg-primary"></div></div></div><span class="ce-seconds-label"></span></div>'
            );
          break;
        case 'style9':
          $(this.dom_element).addClass('ce-countdown--theme-9');
          if (_.indexOf(this.attrs['display'].split(','), 'days') >= 0)
            $(countdown).append(
              '<div class="ce-circle"><canvas id="ce-days" width="408" height="408"></canvas><div class="ce-circle__values"><span class="ce-digit ce-days"></span><span class="ce-label ce-days-label"></span></div></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'hours') >= 0)
            $(countdown).append(
              '<div class="ce-circle"><canvas id="ce-hours" width="408" height="408"></canvas><div class="ce-circle__values"><span class="ce-digit ce-hours"></span><span class="ce-label ce-hours-label"></span></div></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'minutes') >= 0)
            $(countdown).append(
              '<div class="ce-circle"><canvas id="ce-minutes" width="408" height="408"></canvas><div class="ce-circle__values"><span class="ce-digit ce-minutes"></span><span class="ce-label ce-minutes-label"></span></div></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'seconds') >= 0)
            $(countdown).append(
              '<div class="ce-circle"><canvas id="ce-seconds" width="408" height="408"></canvas><div class="ce-circle__values"><span class="ce-digit ce-seconds"></span><span class="ce-label ce-seconds-label"></span></div></div>'
            );
          break;
        case 'style10':
          $(this.dom_element).addClass('ce-countdown--theme-10');
          if (_.indexOf(this.attrs['display'].split(','), 'days') >= 0)
            $(countdown).append(
              '<div class="ce-unit-wrap"><div class="ce-days"></div><span class="ce-days-label"></span></div>');
          if (_.indexOf(this.attrs['display'].split(','), 'hours') >= 0)
            $(countdown).append(
              '<div class="ce-unit-wrap"><div class="ce-hours"></div><span class="ce-hours-label"></span></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'minutes') >= 0)
            $(countdown).append(
              '<div class="ce-unit-wrap"><div class="ce-minutes"></div><span class="ce-minutes-label"></span></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'seconds') >= 0)
            $(countdown).append(
              '<div class="ce-unit-wrap"><div class="ce-seconds"></div><span class="ce-seconds-label"></span></div>'
            );
          break;
        case 'style12':
          $(this.dom_element).addClass('ce-countdown--theme-12');
          if (_.indexOf(this.attrs['display'].split(','), 'days') >= 0)
            $(countdown).append(
              '<div class="ce-col"><div class="ce-days ce-digits"></div> <span class="ce-days-label"></span></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'hours') >= 0)
            $(countdown).append(
              '<div class="ce-col"><div class="ce-hours ce-digits"></div> <span class="ce-hours-label"></span></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'minutes') >= 0)
            $(countdown).append(
              '<div class="ce-col"><div class="ce-minutes ce-digits"></div> <span class="ce-minutes-label"></span></div>'
            );
          if (_.indexOf(this.attrs['display'].split(','), 'seconds') >= 0)
            $(countdown).append(
              '<div class="ce-col"><div class="ce-seconds ce-digits"></div> <span class="ce-seconds-label"></span></div>'
            );
          break;
        default:
          if (_.indexOf(this.attrs['display'].split(','), 'days') >= 0)
            $(countdown).append('<span class="lead ce-days"></span> <span class="lead ce-days-label"></span> ');
          if (_.indexOf(this.attrs['display'].split(','), 'hours') >= 0)
            $(countdown).append(
              '<span class="lead ce-hours"></span> <span class="lead ce-hours-label"></span> ');
          if (_.indexOf(this.attrs['display'].split(','), 'minutes') >= 0)
            $(countdown).append(
              '<span class="lead ce-minutes"></span> <span class="lead ce-minutes-label"></span> ');
          if (_.indexOf(this.attrs['display'].split(','), 'seconds') >= 0)
            $(countdown).append(
              '<span class="lead ce-seconds"></span> <span class="lead ce-seconds-label"></span> ');
          break;
      }
      this.baseclass.prototype.render.apply(this, arguments);
    },
});
window.glazed_elements.push({base: "az_counter",
showed: function ($) {
      this.baseclass.prototype.showed.apply(this, arguments);
      var element = this;
      this.add_js_list({
        paths: ['vendor/jquery-countTo/jquery.countTo.min.js',
          'vendor/jquery.waypoints/lib/jquery.waypoints.min.js'
        ],
        loaded: 'waypoint' in $.fn && 'countTo' in $.fn,
        callback: function() {
          $(element.dom_element).waypoint(function(direction) {
            $(element.dom_element).find('#' + element.id).countTo({
              from: Math.round(element.attrs['start']),
              to: Math.round(element.attrs['end']),
              speed: Math.round(element.attrs['speed']),
              refreshInterval: 50,
              seperator: element.attrs['seperator'],
              formatter: function(value, options) {
                return element.attrs['prefix'] + value.toFixed(0).replace(/\B(?=(?:\d{3})+(?!\d))/g, options.seperator) + element.attrs[
                    'postfix'];
              }
            });
          }, {
            offset: '100%',
            handler: function(direction) {
              this.destroy()
            },
          });
          $(document).trigger('scroll');
          //        $(element.dom_element).waypoint({
          //          handler: function() {
          //          }
          //        });
        }
      });
    },
params: [{"param_name":"start","value":"0"},{"param_name":"end","value":"100"},{"param_name":"fontsize","value":"30"},{"param_name":"speed","value":"2000"},{"param_name":"seperator","value":""},{"param_name":"prefix","value":""},{"param_name":"postfix","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
});
window.glazed_elements.push({base: "az_html",
params: [{"param_name":"content","value":"<p>Click the edit button to change this HTML</p>"},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
is_container: true,
has_content: true,
});
window.glazed_elements.push({base: "az_icon",
params: [{"param_name":"icon","value":""},{"param_name":"size","value":""},{"param_name":"st_style","value":""},{"param_name":"animation","value":""},{"param_name":"orientation","value":""},{"param_name":"link","value":""},{"param_name":"link_target","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
});
window.glazed_elements.push({base: "az_image",
params: [{"param_name":"image","value":""},{"param_name":"width","value":"100%"},{"param_name":"height","value":""},{"param_name":"link","value":""},{"param_name":"link_target","value":""},{"param_name":"alt","value":""},{"param_name":"title","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
frontend_render: true,
render: function ($) {
      var id = this.id;
      var element = this;
      this.dom_element = $('<div class="az-element az-image ' + this.get_el_classes() + '"></div>');
      function render_image(value, style, width, height, alt, title) {
        if ($.isNumeric(width))
          width = width + 'px';
        if ($.isNumeric(height))
          height = height + 'px';
        var img = $('<img src="' + value + '" alt="' + alt + '" title="' + title + '">');
        $(img).attr('style', style);
        if (width.length > 0)
          $(img).css('width', width);
        if (height.length > 0)
          $(img).css('height', height);
        return img;
      }
      var img = render_image(
          this.attrs['image'],
          this.attrs['style'],
          this.attrs['width'],
          this.attrs['height'],
          this.attrs['alt'],
          this.attrs['title']
        );
      $(img).appendTo(this.dom_element);
      if (this.attrs['link'] != '') {
        $(this.dom_element).find('img').each(function() {
          $(this).wrap('<a href="' + element.attrs['link'] + '" target="' + element.attrs['link_target'] +
            '"></a>');
        });
      }
      this.baseclass.prototype.render.apply(this, arguments);
    },
});
window.glazed_elements.push({base: "az_images_carousel",
showed: function ($) {
      this.baseclass.prototype.showed.apply(this, arguments);
      var element = this;
      $(this.dom_element)['carousel']({
        interval: this.attrs['interval'],
        pause: 'hover',
      });
    },
params: [{"param_name":"images","value":""},{"param_name":"interval","value":"5000"},{"param_name":"hide","value":""},{"param_name":"alt","value":""},{"param_name":"title","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
});
window.glazed_elements.push({base: "az_jumbotron",
params: [{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
is_container: true,
});
window.glazed_elements.push({base: "az_link",
params: [{"param_name":"link","value":""},{"param_name":"link_target","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
is_container: true,
});
window.glazed_elements.push({base: "az_map",
params: [{"param_name":"address","value":""},{"param_name":"width","value":"100%"},{"param_name":"height","value":"400px"},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
is_container: true,
has_content: true,
});
window.glazed_elements.push({base: "az_panel",
params: [{"param_name":"title","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
is_container: true,
});
window.glazed_elements.push({base: "az_progress_bar",
params: [{"param_name":"label","value":""},{"param_name":"width","value":"50"},{"param_name":"type","value":""},{"param_name":"options","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
});
window.glazed_elements.push({base: "az_separator",
params: [{"param_name":"bgcolor","value":""},{"param_name":"thickness","value":""},{"param_name":"custom_thickness","value":"3"},{"param_name":"width","value":""},{"param_name":"custom_width","value":"100"},{"param_name":"align","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
});
window.glazed_elements.push({base: "az_text",
params: [{"param_name":"content","value":"<h2>Lorem ipsum dolor sit amet.</h2> Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
is_container: true,
has_content: true,
});
window.glazed_elements.push({base: "az_video",
    showed: function($) {
      this.baseclass.prototype.showed.apply(this, arguments);
      var $domElement = $(this.dom_element);
      $domElement.find('.az-video-play, .az-video-icon').bind('click', function () {
        var $iframe = $domElement.find('iframe');
        $iframe.attr('src', $iframe.attr('src') + '&autoplay=1').show();
        $domElement.find('.az-video-play, .az-video-icon').hide();
      });
    },
params: [{"param_name":"link","value":""},{"param_name":"width","value":"100%"},{"param_name":"image","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
});
window.glazed_elements.push({base: "az_well",
params: [{"param_name":"type","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
is_container: true,
});
window.glazed_elements.push({base: "st_social",
params: [{"param_name":"st_social_links","value":"Facebook='https://www.facebook.com/'\nYouTube='https://www.youtube.com/'"},{"param_name":"st_type","value":""},{"param_name":"st_style","value":""},{"param_name":"st_size","value":""},{"param_name":"st_theme_color","value":""},{"param_name":"st_color","value":""},{"param_name":"st_theme_bgcolor","value":""},{"param_name":"st_bgcolor","value":""},{"param_name":"st_hover_color","value":""},{"param_name":"st_theme_border_color","value":""},{"param_name":"st_border_color","value":""},{"param_name":"st_css3_hover_effects","value":""},{"param_name":"an_start","value":""},{"param_name":"an_in","value":""},{"param_name":"an_out","value":""},{"param_name":"an_hidden","value":""},{"param_name":"an_infinite","value":""},{"param_name":"an_offset","value":"100"},{"param_name":"an_duration","value":"1000"},{"param_name":"an_in_delay","value":"0"},{"param_name":"an_out_delay","value":"0"},{"param_name":"an_parent","value":"1"},{"param_name":"an_name","value":""},{"param_name":"el_class","value":""},{"param_name":"style","value":""},{"param_name":"hover_style","value":""},{"param_name":"pos_left","value":""},{"param_name":"pos_right","value":""},{"param_name":"pos_top","value":""},{"param_name":"pos_bottom","value":""},{"param_name":"pos_width","value":""},{"param_name":"pos_height","value":""},{"param_name":"pos_zindex","value":""}],
});
function create_glazed_elements() {
    if ('glazed_elements' in window) {
      for (var i = 0; i < window.glazed_elements.length; i++) {
        var element = window.glazed_elements[i];
        var ExternalElement = function(parent, position) {
          ExternalElement.baseclass.apply(this, arguments);
        }
        register_animated_element(element.base, element.is_container, ExternalElement);
        element.baseclass = ExternalElement.baseclass;
        element.params = element.params.concat(ExternalElement.prototype.params);
        mixin(ExternalElement.prototype, element);
        for (var j = 0; j < ExternalElement.prototype.params.length; j++) {
          var param = ExternalElement.prototype.params[j];
          var new_param = make_param_type(param);
          ExternalElement.prototype.params[j] = new_param;
        }
      }
    }
  }
create_glazed_elements();
function make_glazed_extend() {
    if ('glazed_extend' in window) {
      for (var base in window.glazed_extend) {
        var element = window.glazed_extend[base];
        var params = [];
        if ('params' in element)
          params = element.params;
        delete element.params;
        var registered_element = BaseElement.prototype.elements[base];
        if (!('extended' in registered_element)) {
          registered_element.extended = true;
          mixin(registered_element.prototype, element);
          for (var i = 0; i < params.length; i++) {
            var param = make_param_type(params[i]);
            registered_element.prototype.params.push(param);
          }
        }
      }
    }
  }
make_glazed_extend();

$(document).ready(function(){
  $('[data-az-mode="dynamic"]').each(function() {
    connect_container($(this));
  });
});

})(window.jQuery);
