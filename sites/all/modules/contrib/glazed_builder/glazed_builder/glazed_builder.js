(function($) {
  /**
   * Glazed Builder Drag and Drop Visual HTML & Drupal Editor by SooperThemes.
   *
   * Users Bootstrap framework together with Drupal and various 3rd party
   * libraries to give rich site building experience without coding
   *
   */

  /**
   * Enabling Ajax cache for ajax datatype script.
   */
  $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (options.dataType == 'script' || originalOptions.dataType == 'script') {
      options.cache = true;
    }
  });

  /**
   * Locale
   */
  function glazed_lang() {
    if ('glazed_lang' in window) {
      return window.glazed_lang;
    } else {
      return 'en';
    }
  }

  /**
   * Legacy setup stuff @todo document or remove.
   */
  if (!('glazed_baseurl' in window)) {
    if ($('script[src*="glazed_builder.js"]').length > 0) {
      var glazed_builder_src = $('script[src*="glazed_builder.js"]').attr('src');
      window.glazed_baseurl = glazed_builder_src.slice(0, glazed_builder_src.indexOf('glazed_builder.js'));
    }
    else {
      if ($('script[src*="glazed_builder.min.js"]').length > 0) {
        var glazed_builder_src = $('script[src*="glazed_builder.min.js"]').attr('src');
        window.glazed_baseurl = glazed_builder_src.slice(0, glazed_builder_src.indexOf('glazed_builder.min.js'));
      }
    }
  }
  if (!('glazed_online' in window))
    window.glazed_online = (window.location.protocol == 'http:' || window.location.protocol == 'https:');


  /**
   * Set up core variables
   */
  window.glazed_backend = true;

  window.glazed_title = {
    'Drag and drop': Drupal.t('Drag and drop element.'),
    'Add': Drupal.t('Add new element into current element area.'),
    'Edit': Drupal.t('Open settings form to change element properties, set CSS styles and add CSS classes.'),
    'Paste': Drupal.t('Paste elements into current element area from clipboard copied into it before.'),
    'Copy': Drupal.t('Copy element or contained elements to clipboard.'),
    'Clone': Drupal.t('Clone current element.'),
    'Remove': Drupal.t('Delete current element'),
    'Save as template': Drupal.t('Save element or contained elements as template to template library.'),
    'Save container': Drupal.t('Save to server all elements which placed in current container element.'),
  };

  if (!('glazed_editor' in window))
    window.glazed_editor = false;

  var glazed_frontend = false;
  var p = '';
  var fp = '';
  var glazed_js_waiting_callbacks = {};
  var glazed_loaded_js = {};
  var glazed_elements = {};
  var glazed_containers = [];
  var glazed_containers_loaded = {};

  var glazed_animations = {
    "": Drupal.t('No animation'),
    "bounce": Drupal.t('bounce'),
    "float": Drupal.t('float'),
    "floatSmall": Drupal.t('floatSmall'),
    "floatLarge": Drupal.t('floatLarge'),
    "pulse": Drupal.t('pulse'),
    "shake": Drupal.t('shake'),
    "wobble": Drupal.t('wobble'),
    "jello": Drupal.t('jello'),
    "fadeIn": Drupal.t('fadeIn'),
    "fadeInDown": Drupal.t('fadeInDown'),
    "fadeInDownBig": Drupal.t('fadeInDownBig'),
    "fadeInLeft": Drupal.t('fadeInLeft'),
    "fadeInLeftBig": Drupal.t('fadeInLeftBig'),
    "fadeInRight": Drupal.t('fadeInRight'),
    "fadeInRightBig": Drupal.t('fadeInRightBig'),
    "fadeInUp": Drupal.t('fadeInUp'),
    "fadeInUpBig": Drupal.t('fadeInUpBig'),
    "fadeOut": Drupal.t('fadeOut'),
    "fadeOutDown": Drupal.t('fadeOutDown'),
    "fadeOutDownBig": Drupal.t('fadeOutDownBig'),
    "fadeOutLeft": Drupal.t('fadeOutLeft'),
    "fadeOutLeftBig": Drupal.t('fadeOutLeftBig'),
    "fadeOutRight": Drupal.t('fadeOutRight'),
    "fadeOutRightBig": Drupal.t('fadeOutRightBig'),
    "fadeOutUp": Drupal.t('fadeOutUp'),
    "fadeOutUpBig": Drupal.t('fadeOutUpBig'),
    "flipInX": Drupal.t('flipInX'),
    "flipInY": Drupal.t('flipInY'),
    "zoomIn": Drupal.t('zoomIn'),
    "zoomInDown": Drupal.t('zoomInDown'),
    "zoomInLeft": Drupal.t('zoomInLeft'),
    "zoomInRight": Drupal.t('zoomInRight'),
    "zoomInUp": Drupal.t('zoomInUp'),
    "zoomOut": Drupal.t('zoomOut'),
    "zoomOutDown": Drupal.t('zoomOutDown'),
    "zoomOutLeft": Drupal.t('zoomOutLeft'),
    "zoomOutRight": Drupal.t('zoomOutRight'),
    "zoomOutUp": Drupal.t('zoomOutUp'),
    "slideInDown": Drupal.t('slideInDown'),
    "slideInLeft": Drupal.t('slideInLeft'),
    "slideInRight": Drupal.t('slideInRight'),
    "slideInUp": Drupal.t('slideInUp'),
    "slideOutDown": Drupal.t('slideOutDown'),
    "slideOutLeft": Drupal.t('slideOutLeft'),
    "slideOutRight": Drupal.t('slideOutRight'),
    "slideOutUp": Drupal.t('slideOutUp'),
  };

  // Legacy variables, don't throw out they can be referenced in field values.
  var fp = '';
  var p = ''

  /**
   * Old string translation funcitons, now replaced with Drupal.t
   * Still here for backwards compatibility with custom extensions
   * and possibly lingering code in databases
   */
  function t(text) {
    if ('Drupal' in window) {
      return Drupal.t(text);
    }
    else {
      return text;
    }
  }

  /**
   * Replace token strings with actual button titles
   */
  function title(text) {
    if ('glazed_title' in window && (text in window.glazed_title)) {
      return window.glazed_title[text];
    }
    else {
      return t(text);
    }
  }

  /**
   * Helper function that obfuscates strings. This function can help circumvent shared hosting values
   * that check for urls and javascript in post values.
   */
  function enc(str) {
    var encoded = "";
    for (i = 0; i < str.length; i++) {
      var a = str.charCodeAt(i);
      var b = a ^ 7;
      encoded = encoded + String.fromCharCode(b);
    }
    return encoded;
  }

  /**
   * Helper function to do protype based class extension
   */
  function extend(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.baseclass = Parent;
  }

  /**
   * Helper function with property base object extension.
   */
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

  /**
   * Helper function to do substring replacement.
   */
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

  /**
   * Helper function with convert RGB triplet to hex color code.
   */
  function rgb2hex(rgb) {
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return rgb.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, function(match, r, g, b) {
      return "#" + hex(r) + hex(g) + hex(b);
    });
  }

  /**
   * Helper function with convert hex color code to RGB triplet.
   */
  function hex2rgb(hex) {
    if (hex.lastIndexOf('#') > -1) {
      hex = hex.replace(/#/, '0x');
    }
    else {
      hex = '0x' + hex;
    }
    var r = hex >> 16;
    var g = (hex & 0x00FF00) >> 8;
    var b = hex & 0x0000FF;
    return [r, g, b];
  }

  /**
   * Helper function with convert HSL color to RGB.
   */
  function hsl2rgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
      r = g = b = l; // achromatic
    }
    else {
      function hue2rgb(p, q, t) {
        if (t < 0)
          t += 1;
        if (t > 1)
          t -= 1;
        if (t < 1 / 6)
          return p + (q - p) * 6 * t;
        if (t < 1 / 2)
          return q;
        if (t < 2 / 3)
          return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Helper function with convert RGB color to HSL.
   */
  function rgb2hsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    }
    else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, l];
  }

  /**
   * Helper function with convert fractinoal width to bootstrap class.
   */
  function width2span(width, device) {
    var prefix ='col-' + device + '-',
      numbers = width ? width.split('/') : [1, 1],
      range = _.range(1, 13),
      num = !_.isUndefined(numbers[0]) && _.indexOf(range, parseInt(numbers[0], 10)) >= 0 ? parseInt(numbers[0], 10) :
      false,
      dev = !_.isUndefined(numbers[1]) && _.indexOf(range, parseInt(numbers[1], 10)) >= 0 ? parseInt(numbers[1], 10) :
      false;
    if (num !== false && dev !== false) {
      return prefix + (12 * num / dev);
    }
    return prefix + '12';
  }

  /**
   * Helper function with convert bootstrap class to fractional width.
   */
  function span2width(span, device) {
    if (span == "col-" + device + "-12")
      return '1/1';
    else if (span == "col-" + device + "-11")
      return '11/12';
    else if (span == "col-" + device + "-10") //three-fourth
      return '5/6';
    else if (span == "col-" + device + "-9") //three-fourth
      return '3/4';
    else if (span == "col-" + device + "-8") //two-third
      return '2/3';
    else if (span == "col-" + device + "-7")
      return '7/12';
    else if (span == "col-" + device + "-6") //one-half
      return '1/2';
    else if (span == "col-" + device + "-5") //one-half
      return '5/12';
    else if (span == "col-" + device + "-4") // one-third
      return '1/3';
    else if (span == "col-" + device + "-3") // one-fourth
      return '1/4';
    else if (span == "col-" + device + "-2") // one-fourth
      return '1/6';
    else if (span == "col-" + device + "-1")
      return '1/12';
    return false;
  }

  /**
   * Cached Helper Function that does a bunch of regex
   */
  var glazed_regexp_split = _.memoize(function(tags) {
    return new RegExp('(\\[(\\[?)[' + tags + ']+' +
      '(?![\\w-])' +
      '[^\\]\\/]*' +
      '[\\/' +
      '(?!\\])' +
      '[^\\]\\/]*' +
      ']?' +
      '(?:' +
      '\\/]' +
      '\\]|\\]' +
      '(?:' +
      '[^\\[]*' +
      '(?:\\[' +
      '(?!\\/' + tags + '\\])[^\\[]*' +
      ')*' +
      '' +
      '\\[\\/' + tags + '\\]' +
      ')?' +
      ')' +
      '\\]?)', 'g');
  });

  /**
   * Cached Helper Function that does a bunch of regex
   */
  var glazed_regexp = _.memoize(function(tags) {
    return new RegExp('\\[(\\[?)(' + tags +
      ')(?![\\w-])([^\\]\\/]*(?:\\/(?!\\])[^\\]\\/]*)*?)(?:(\\/)\\]|\\](?:([^\\[]*(?:\\[(?!\\/\\2\\])[^\\[]*)*)(\\[\\/\\2\\]))?)(\\]?)'
    );
  });

  /**
   * Helper function to escape quotes by replacing them with backticks.
   */
  function escapeParam(value) {
    return value.replace(/"/g, '``');
  }

  /**
   * Helper function to reverse effect of escapeParam.
   */
  function unescapeParam(value) {
    if (_.isString(value))
      return value.replace(/(\`{2})/g, '"');
    else
      return value;
  }

  /**
   * Helper function to decode encodede urls.
   */
  function rawurldecode(str) {
    return decodeURIComponent((str + '')
      .replace(/%(?![\da-f]{2})/gi, function() {
        // PHP tolerates poorly formed escape sequences
        return '%25';
      }));
  }
  /**
   * Helper function to encode urls.
   */
  function rawurlencode(str) {
    str = (str + '')
      .toString();

    // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .
    replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }


  /**
   * Helper function to get the highest z-index value in DOM (sub)tree.
   */
  function get_max_zindex(dom_element) {
    var max_zindex = parseInt($(dom_element).css('z-index'));
    $(dom_element).parent().find('*').each(function() {
      var zindex = parseInt($(this).css('z-index'));
      if (max_zindex < zindex)
        max_zindex = zindex;
    });
    return max_zindex;
  };

  /**
   * Helper function to set highest z-index on element within DOM (sub)tree.
   */
  function set_highest_zindex(dom_element) {
    var zindex = get_max_zindex(dom_element);
    $(dom_element).css('z-index', zindex + 1);
  }

  /**
   * Helper function to use chosen library on form element.
   */
  function chosen_select(options, input) {
    var single_select = '<select>';
    for (var key in options) {
      single_select = single_select + '<option value="' + key + '">"' + options[key] + '"</option>';
    }
    single_select = single_select + '</select>';
    $(input).css('display', 'none');
    var select = $(single_select).insertAfter(input);
    if ($(input).val().length) {
      $(select).append('<option value=""></option>');
      var value = $(input).val();
      if (!$(select).find('option[value="' + value + '"]').length) {
        $(select).append('<option value="' + value + '">"' + value + '"</option>');
      }
      $(select).find('option[value="' + value + '"]').attr("selected", "selected");
    }
    else {
      $(select).append('<option value="" selected></option>');
    }
    $(select).chosen({
      search_contains: true,
      allow_single_deselect: true,
    });
    $(select).change(function() {
      $(this).find('option:selected').each(function() {
        $(input).val($(this).val());
      });
    });
    $(select).parent().find('.chosen-container').width('100%');
    $('<div><a class="direct-input" href="#">' + Drupal.t("Edit as text") + '</a></div>').insertBefore(select).click(
      function() {
        $(input).css('display', 'block');
        $(select).parent().find('.chosen-container').remove();
        $(select).remove();
        $(this).remove();
      });
    return select;
  }

  /**
   * Helper function to use chosen library on form element with support for multiple values.
   */
  function multiple_chosen_select(options, input, delimiter) {
    var multiple_select = '<select multiple="multiple">';
    var optgroup = '';
    for (var key in options) {
      if (key.indexOf("optgroup") >= 0) {
        if (optgroup == '') {
          multiple_select = multiple_select + '</optgroup>';
        }
        multiple_select = multiple_select + '<optgroup label="' + options[key] + '">';
        optgroup = options[key];
        continue;
      }
      multiple_select = multiple_select + '<option value="' + key + '">"' + options[key] + '"</option>';
    }
    if (optgroup != '') {
      multiple_select = multiple_select + '</optgroup>';
    }
    multiple_select = multiple_select + '</select>';
    $(input).css('display', 'none');
    var select = $(multiple_select).insertAfter(input);
    if ($(input).val().length) {
      var values = $(input).val().split(delimiter);
      for (var i = 0; i < values.length; i++) {
        if (!$(select).find('option[value="' + values[i] + '"]').length) {
          $(select).append('<option value="' + values[i] + '">"' + values[i] + '"</option>');
        }
        $(select).find('option[value="' + values[i] + '"]').attr("selected", "selected");
      }
    }
    $(select).chosen({
      search_contains: true,
    });
    $(select).change(function() {
      var selected = [];
      $(this).find('option:selected').each(function() {
        selected.push($(this).val());
      });
      $(input).val(selected.join(delimiter));
    });
    $(select).parent().find('.chosen-container').width('100%');
    $('<div><a class="direct-input" href="#">' + Drupal.t("Edit as text") + '</a></div>').insertBefore(select).click(
      function() {
        $(input).css('display', 'block');
        $(select).parent().find('.chosen-container').remove();
        $(select).remove();
        $(this).remove();
      });
    return select;
  }

  /**
   * Callback to extract youtube resource url from embed or watch url.
   */
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

  /**
   * Callback to extract vimeo resource url url.
   */
  function vimeo_parser(url) {
    var m = url.match(/^.+vimeo.com\/(.*\/)?([^#\?]*)/);
    return m ? m[2] || m[1] : false;
  }

  /**
   * Helper function to convert relative url to absolute url. Possibly only used by glazed_frontend via param type (image select).
   */
  function toAbsoluteURL(url) {
    if (url.search(/^\/\//) != -1) {
      return window.location.protocol + url
    }
    if (url.search(/:\/\//) != -1) {
      return url
    }
    if (url.search(/^\//) != -1) {
      return window.location.origin + url
    }
    var base = window.location.href.match(/(.*\/)/)[0]
    return base + url
  }

  /**
   * Helper function to render select element from options.
   */
  function get_select(options, name, value) {
    var select = '<select name="' + name + '" class="form-control">';
    select += '<option value="">' + Drupal.t("Select") + '</option>';
    for (var key in options) {
      if (key == value)
        select += '<option value="' + key + '" selected>' + options[key] + '</option>';
      else
        select += '<option value="' + key + '">' + options[key] + '</option>';
    }
    select += '/<select>';
    return select;
  }

  /**
   * Helper function to render bootstrap alert message.
   */
  function get_alert(message) {
    return '<div class="alert alert-warning" role="alert"><span class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">' + Drupal.t('Close') + '</span></span>' +
      message + '</div>';
  }

  /**
   * Function like $.closest(selector) but only for descendants.
   */
  $.fn.closest_descendents = function(filter) {
    var $found = $(),
      $currentSet = this;
    while ($currentSet.length) {
      $found = $.merge($found, $currentSet.filter(filter));
      $currentSet = $currentSet.not(filter);
      $currentSet = $currentSet.children();
    }
    return $found;
  }

  /**
   * Helper function to normalize form data values
   */
  function htmlDecode(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  }

  /**
   * Helper function to deserialize form data
   */
  $.fn.deserialize = function(data) {
    var f = $(this),
      map = {};
    //Get map of values
    $.each(data.split("&"), function() {
        var nv = this.split("="),
          n = rawurldecode(nv[0]),
          v = nv.length > 1 ? rawurldecode(nv[1]) : null;
        if (!(n in map)) {
          map[n] = [];
        }
        map[n].push(v);
      })
      //Set values for all form elements in the data
    $.each(map, function(n, v) {
        f.find("[name='" + n + "']").val(v[0].replace(/\+/g, " "));
        if (v[0].replace(/\+/g, " ") == 'on') {
          f.find("[type='checkbox'][name='" + n + "']").attr('checked', 'checked');
        }
        f.find("select[name='" + n + "'] > option").removeAttr('selected');
        for (var i = 0; i < v.length; i++) {
          f.find("select[name='" + n + "'] > option[value='" + v[i] + "']").prop('selected', 'selected');
        }
      })
      //Uncheck checkboxes and radio buttons not in the form data
    $("input:checkbox:checked,input:radio:checked", f).each(function() {
      if (!($(this).attr("name") in map)) {
        this.checked = false;
      }
    })

    return this;
  };

 /**
  * Glazed Builder Asset Loading Functions
  */
  window.glazed_add_css = function(path, callback) {
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
  window.glazed_add_js_list = function(options) {
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
  window.glazed_add_js = function(options) {
    if ('loaded' in options && options.loaded || 'glazed_exported' in window) {
      options.callback();
    }
    else {
      glazed_add_external_js(window.glazed_baseurl + options.path, 'callback' in options ? options.callback :
        function() {});
    }
  }
  window.glazed_add_external_js = function(url, callback) {
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


  /**
   * Check user access, load controls
   */
  function glazed_login(callback) {
    if ('glazed_editor' in window) {
      callback(window.glazed_editor);
      return;
    }
    if (window.glazed_online) {
      if ('glazed_ajaxurl' in window) {
        $.ajax({
          type: 'POST',
          url: window.glazed_ajaxurl,
          data: {
            action: 'glazed_login',
            url: window.location.href,
          },
          dataType: "json",
          cache: false,
          context: this
        }).done(function(data) {
          callback(data);
        });
      }
    }
    else {
      callback(false);
    }
  }

  /**
   * Check user access, load controls
   */
  function glazed_get_container_types(callback) {
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_get_container_types',
          url: window.location.href,
        },
        dataType: "json",
        cache: false,
        context: this
      }).done(function(data) {
        callback(data);
      });
    }
  }

  /**
   * Callback that lists all entity fields
   */
  function glazed_get_container_names(container_type, callback) {
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_get_container_names',
          container_type: container_type,
          url: window.location.href,
        },
        dataType: "json",
        cache: false,
        context: this
      }).done(function(data) {
        callback(data);
      });
    }
  }

  /**
   * Save Glazed Container Contents
   */
  function glazed_save_container(type, name, shortcode) {
    typeArray = type.split('|');
    nameArray = name.split('|');
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_save_container',
          type: type,
          name: name,
          lang: window.glazed_lang,
          shortcode: enc(encodeURIComponent(shortcode)),
        },
        dataType: "json",
        cache: false,
        context: this
      }).done(function(data) {
        $.notify(Drupal.t('Saved ' + nameArray[1] + ' field'), {
          type: 'success',
          z_index: '8000',
          offset: {
            x: 25,
            y: 70
          }
        }); // y offset for toolbar + shortcut bar
      }).fail(function(data) {
        $.notify(Drupal.t('Server error: Unable to save page'), {
          type: 'danger',
          z_index: '8000',
          offset: {
            x: 25,
            y: 70
          }
        });
      });
    }
  }

  /**
   * Load Glazed Container contents.
   */
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

  /**
   * Load Drupal Elements (Blocks, Views).
   */
  function glazed_builder_get_cms_element_names(callback) {
    if ('glazed_cms_element_names' in window) {
      callback(window.glazed_cms_element_names);
      return;
    }
    if (window.glazed_online) {
      if ('glazed_ajaxurl' in window) {
        $.ajax({
          type: 'POST',
          url: window.glazed_ajaxurl,
          data: {
            action: 'glazed_builder_get_cms_element_names',
            url: window.location.href,
          },
          dataType: "json",
          cache: false,
          context: this
        }).done(function(data) {
          callback(data);
        }).fail(function() {
          callback(false);
        });
      }
      else {
        callback(false);
      }
    }
    else {
      callback(false);
    }
  }

  /**
   * Callback to load Drupal element contents.
   */
  function glazed_builder_load_cms_element(name, settings, container, data, callback) {
    if ('glazed_ajaxurl' in window) {
      data.originalPath = Drupal.settings.glazed_builder.currentPath;
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_builder_load_cms_element',
          name: name,
          settings: settings,
          container: container,
          data: data
        },
        dataType: "json",
        cache: !window.glazed_editor
      }).done(function(data) {
        $(data.css).appendTo($('head'));
        $(data.js).appendTo($('head'));
        $.extend(true, Drupal.settings, data.settings);
        callback(data.data);
      });
    }
  }

  /**
   * Callback to load settings for all Drupal Elements (blocks, views).
   */
  function glazed_get_cms_element_settings(name, callback) {
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_get_cms_element_settings',
          name: name,
          url: window.location.href,
        },
        cache: !window.glazed_editor,
      }).done(function(data) {
        callback(data);
      });
    }
  }

  /**
   * Load all sidebar templates.
   */
  function glazed_get_elements(callback) {
    if ('glazed_template_elements' in window) {
      for (var name in window.glazed_template_elements) {
        window.glazed_template_elements[name].html = decodeURIComponent(window.glazed_template_elements[name].html);
      }
      callback(window.glazed_template_elements);
      return;
    }
  }

  /**
   * Load all user templates.
   */
  function glazed_get_templates(callback) {
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_get_templates',
          url: window.location.href,
        },
        dataType: "json",
        cache: false,
        context: this
      }).done(function(data) {
        callback(data);
      });
    }
  }

  /**
   * Load contents for user template.
   */
  function glazed_load_template(name, callback) {
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_load_template',
          url: window.location.href,
          name: name,
        },
        cache: false,
      }).done(function(data) {
        callback(data);
      }).fail(function() {
        callback('');
      });
    }
    else {
      var url = window.glazed_baseurl + '../images/glazed_templates/' + name;
      $.ajax({
        url: url,
        cache: false,
      }).done(function(data) {
        callback(data);
      }).fail(function() {
        callback('');
      });
    }
  }

  /**
   * Save user template.
   */
  function glazed_save_template(name, template) {
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_save_template',
          url: window.location.href,
          name: name,
          template: template,
        },
        cache: false,
        context: this
      }).done(function(data) {});
    }
  }

  /**
   * Delete user template.
   */
  function glazed_delete_template(name) {
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_delete_template',
          url: window.location.href,
          name: name,
        },
        cache: false,
        context: this
      }).done(function(data) {});
    }
  }

  /**
   * List all page templates.
   */
  function glazed_get_page_templates(callback) {
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_get_page_templates',
          url: window.location.href,
        },
        dataType: "json",
        cache: false,
        context: this
      }).done(function(data) {
        callback(data);
      });
    }
  }

  /**
   * Load contents for page template.
   */
  function glazed_load_page_template(uuid, callback) {
    if ('glazed_ajaxurl' in window) {
      $.ajax({
        type: 'POST',
        url: window.glazed_ajaxurl,
        data: {
          action: 'glazed_load_page_template',
          url: window.location.href,
          uuid: uuid,
        },
        cache: false,
      }).done(function(data) {
        callback(data);
      }).fail(function() {
        callback('');
      });
    }
  }


  /**
   * Glazed object, to contain shortcode and html processing functions.
   */
  var glazed = {};

  /**
   * Namespace for Glazed shortcode functions
   */
  glazed.shortcode = {
    next: function(tag, text, index) {
      var re = glazed.shortcode.regexp(tag),
        match, result;

      re.lastIndex = index || 0;
      match = re.exec(text);

      if (!match) {
        return;
      }
      if ('[' === match[1] && ']' === match[7]) {
        return glazed.shortcode.next(tag, text, re.lastIndex);
      }

      result = {
        index: match.index,
        content: match[0],
        shortcode: glazed.shortcode.fromMatch(match)
      };
      if (match[1]) {
        result.match = result.match.slice(1);
        result.index++;
      }
      if (match[7]) {
        result.match = result.match.slice(0, -1);
      }

      return result;
    },
    replace: function(tag, text, callback) {
      return text.replace(glazed.shortcode.regexp(tag), function(match, left, tag, attrs, slash, content,
        closing, right) {
        if (left === '[' && right === ']') {
          return match;
        }
        var result = callback(glazed.shortcode.fromMatch(arguments));
        return result ? left + result + right : match;
      });
    },
    string: function(options) {
      return new glazed.shortcode(options).string();
    },
    regexp: _.memoize(function(tag) {
      return new RegExp('\\[(\\[?)(' + tag +
        ')(?![\\w-])([^\\]\\/]*(?:\\/(?!\\])[^\\]\\/]*)*?)(?:(\\/)\\]|\\](?:([^\\[]*(?:\\[(?!\\/\\2\\])[^\\[]*)*)(\\[\\/\\2\\]))?)(\\]?)',
        'g');
    }),
    attrs: _.memoize(function(text) {
      var named = {},
        numeric = [],
        pattern, match;
      pattern =
        /(\w+)\s*=\s*"([^"]*)"(?:\s|$)|(\w+)\s*=\s*\'([^\']*)\'(?:\s|$)|(\w+)\s*=\s*([^\s\'"]+)(?:\s|$)|"([^"]*)"(?:\s|$)|(\S+)(?:\s|$)/g;
      text = text.replace(/[\u00a0\u200b]/g, ' ');
      while ((match = pattern.exec(text))) {
        if (match[1]) {
          named[match[1].toLowerCase()] = match[2];
        }
        else if (match[3]) {
          named[match[3].toLowerCase()] = match[4];
        }
        else if (match[5]) {
          named[match[5].toLowerCase()] = match[6];
        }
        else if (match[7]) {
          numeric.push(match[7]);
        }
        else if (match[8]) {
          numeric.push(match[8]);
        }
      }

      return {
        named: named,
        numeric: numeric
      };
    }),
    fromMatch: function(match) {
      var type;

      if (match[4]) {
        type = 'self-closing';
      }
      else if (match[6]) {
        type = 'closed';
      }
      else {
        type = 'single';
      }

      return new glazed.shortcode({
        tag: match[2],
        attrs: match[3],
        type: type,
        content: match[5]
      });
    }
  };
  glazed.shortcode = _.extend(function(options) {
    _.extend(this, _.pick(options || {}, 'tag', 'attrs', 'type', 'content'));

    var attrs = this.attrs;
    this.attrs = {
      named: {},
      numeric: []
    };

    if (!attrs) {
      return;
    }
    if (_.isString(attrs)) {
      this.attrs = glazed.shortcode.attrs(attrs);
    }
    else if (_.isEqual(_.keys(attrs), ['named', 'numeric'])) {
      this.attrs = attrs;
    }
    else {
      _.each(options.attrs, function(value, key) {
        this.set(key, value);
      }, this);
    }
  }, glazed.shortcode);

  _.extend(glazed.shortcode.prototype, {
    get: function(attr) {
      return this.attrs[_.isNumber(attr) ? 'numeric' : 'named'][attr];
    },
    set: function(attr, value) {
      this.attrs[_.isNumber(attr) ? 'numeric' : 'named'][attr] = value;
      return this;
    },
    string: function() {
      var text = '[' + this.tag;

      _.each(this.attrs.numeric, function(value) {
        if (/\s/.test(value)) {
          text += ' "' + value + '"';
        }
        else {
          text += ' ' + value;
        }
      });

      _.each(this.attrs.named, function(value, name) {
        text += ' ' + name + '="' + value + '"';
      });
      if ('single' === this.type) {
        return text + ']';
      }
      else if ('self-closing' === this.type) {
        return text + ' /]';
      }
      text += ']';

      if (this.content) {
        text += this.content;
      }
      return text + '[/' + this.tag + ']';
    }
  });

  /**
   * Namespace for Glazed html functions
   */
  glazed.html = _.extend(glazed.html || {}, {
    attrs: function(content) {
      var result, attrs;
      if ('/' === content[content.length - 1]) {
        content = content.slice(0, -1);
      }

      result = glazed.shortcode.attrs(content);
      attrs = result.named;

      _.each(result.numeric, function(key) {
        if (/\s/.test(key)) {
          return;
        }

        attrs[key] = '';
      });

      return attrs;
    },
    string: function(options) {
      var text = '<' + options.tag,
        content = options.content || '';

      _.each(options.attrs, function(value, attr) {
        text += ' ' + attr;
        if ('' === value) {
          return;
        }
        if (_.isBoolean(value)) {
          value = value ? 'true' : 'false';
        }

        text += '="' + value + '"';
      });
      if (options.single) {
        return text + ' />';
      }
      text += '>';
      text += _.isObject(content) ? glazed.html.string(content) : content;

      return text + '</' + options.tag + '>';
    }
  });


  /**
   * Initiate ParamType base object.
   */
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

  /**
   * Extend ParamType base object.
   */
  BaseParamType.prototype = {
    safe: true,
    param_types: {},
    /**
     * Generate modal window for element settings.
     */
    show_editor: function(params, element, callback) {
      $('#az-editor-modal').remove();
      var header = '<div class="modal-header"><span class="close" data-dismiss="modal" aria-hidden="true">&times;</span><h4 class="modal-title">' + element.name + ' ' + Drupal.t("settings") + '</h4></div>';
      var footer = '<div class="modal-footer"><span class="btn btn-default" data-dismiss="modal">' + Drupal.t("Close") +
        '</span><span class="save btn btn-primary">' + Drupal.t("Save changes") +
        '</span></div>';
      var modal = $('<div id="az-editor-modal" class="modal glazed"><div class="modal-dialog ' +
       'modal-lg"><div class="modal-content">' + header + '<div class="modal-body"></div>' + footer + '</div></div></div>').prependTo('body');
      var tabs = {};
      for (var i = 0; i < params.length; i++) {
        if (params[i].hidden)
          continue;
        params[i].element = element;
        if (params[i].tab in tabs) {
          tabs[params[i].tab].push(params[i]);
        }
        else {
          tabs[params[i].tab] = [params[i]];
        }
      }
      var tabs_form = $('<div id="az-editor-tabs"></div>');
      var i = 0;
      var menu = '<ul class="nav nav-tabs">';
      for (var title in tabs) {
        i++;
        if (title === '')
          title = Drupal.t('General');
        menu += '<li><a href="#az-editor-tab-' + i + '" data-toggle="tab">' + title + '</a></li>';
      }
      menu += '</ul>';
      $(tabs_form).append(menu);
      i = 0;
      var tabs_content = $('<form role="form" class="tab-content"></form>');
      for (var title in tabs) {
        i++;
        var tab = $('<div id="az-editor-tab-' + i + '" class="tab-pane"></div>');
        for (var j = 0; j < tabs[title].length; j++) {
          tabs[title][j].render(element.attrs[tabs[title][j].param_name]);
          $(tab).append(tabs[title][j].dom_element);
          //$(tab).append('<hr>');
        }
        $(tabs_content).append(tab);
      }
      $(tabs_form).append(tabs_content);
      $(modal).find('.modal-body').append(tabs_form);
      $('#az-editor-tabs a[href="#az-editor-tab-1"]')[fp + 'tab']('show');
      $('#az-editor-modal input[name="el_class"]').each(function() {
        multiple_chosen_select(BaseElement.prototype.el_classes, this, ' ');
      });
      for (var i = 0; i < params.length; i++) {
        if ('element' in params[i].dependency) {
          var param = null;
          for (var j = 0; j < params.length; j++) {
            if (params[j].param_name === params[i].dependency.element) {
              param = params[j];
              break;
            }
          }
          if ('is_empty' in params[i].dependency) {
            (function(i, param) {
              $(param.dom_element).find('[name="' + param.param_name + '"]').on('keyup change', function() {
                if (param.get_value() === '') {
                  params[i].display_none = false;
                  $(params[i].dom_element).css('display', 'block');
                  if ('callback' in params[i].dependency) {
                    params[i].dependency.callback.call(params[i], param);
                  }
                }
                else {
                  params[i].display_none = true;
                  $(params[i].dom_element).css('display', 'none');
                }
              }).trigger('change');
            })(i, param);
          }
          if ('not_empty' in params[i].dependency) {
            (function(i, param) {
              $(param.dom_element).find('[name="' + param.param_name + '"]').on('keyup change', function() {
                if (param.get_value() !== '') {
                  params[i].display_none = false;
                  $(params[i].dom_element).css('display', 'block');
                  if ('callback' in params[i].dependency) {
                    params[i].dependency.callback.call(params[i], param);
                  }
                }
                else {
                  params[i].display_none = true;
                  $(params[i].dom_element).css('display', 'none');
                }
              }).trigger('change');
            })(i, param);
          }
          if ('value' in params[i].dependency) {
            (function(i, param) {
              $(param.dom_element).find('[name="' + param.param_name + '"]').on('keyup change', function() {
                if (_.indexOf(params[i].dependency.value, param.get_value()) >= 0) {
                  params[i].display_none = false;
                  $(params[i].dom_element).css('display', 'block');
                  if ('callback' in params[i].dependency) {
                    params[i].dependency.callback.call(params[i], param);
                  }
                }
                else {
                  params[i].display_none = true;
                  $(params[i].dom_element).css('display', 'none');
                }
              }).trigger('change');
            })(i, param);
          }
        }
      }
      $('#az-editor-modal').one('shown.bs.modal', function(e) {
        $('body').addClass('modal-open');
        for (var i = 0; i < params.length; i++) {
          if (!params[i].hidden)
            params[i].opened();
        }
      });
      $('#az-editor-modal').one('hidden.bs.modal', function(e) {
        for (var i = 0; i < params.length; i++) {
          params[i].closed();
        }
        $(window).scrollTop(scrollTop);
        $(window).off('scroll.az-editor-modal');
        $('body').removeClass('modal-open');
      });
      $('#az-editor-modal').find('.save').click(function() {
        var values = {};
        for (var i = 0; i < params.length; i++) {
          if (params[i].hidden)
            continue;
          if (!('display_none' in params[i]) || ('display_none' in params[i] && !params[i].display_none))
            values[params[i].param_name] = params[i].get_value();
          if (params[i].required && values[params[i].param_name] == '') {
            $(params[i].dom_element).addClass('has-error');
            return false;
          }
        }
        $('#az-editor-modal')[fp + 'modal']("hide");
        callback.call(element, values);
        $(window).trigger('CKinlineAttach');
        return false;
      });
      $('#az-editor-modal').find('[data-dismiss="modal"]').click(function() {
        glazed_elements.edit_stack = [];
      });
      var scrollTop = $(window).scrollTop();
      $(window).on('scroll.az-editor-modal', function() {
        $(window).scrollTop(scrollTop);
      });
      $('#az-editor-modal')[fp + 'modal']('show');
    },
    opened: function() {},
    closed: function() {},
    render: function(value) {

    }
  };

 /**
   * Helper function to extend BaseParamType with new parameter types.
   */
  function register_param_type(type, ParamType) {
    extend(ParamType, BaseParamType);
    ParamType.prototype.type = type;
    BaseParamType.prototype.param_types[type] = ParamType;
  }

 /**
   * Create parameter in element
   */
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

 /**
  * Load all param_types from glazed_param_types.js, register and mix them
  */
  if ('glazed_param_types' in window) {
    for (var i = 0; i < window.glazed_param_types.length; i++) {
      var param_type = window.glazed_param_types[i];
      var ExternalParamType = function() {
        ExternalParamType.baseclass.apply(this, arguments);
      }
      register_param_type(param_type.type, ExternalParamType);
      param_type.baseclass = ExternalParamType.baseclass;
      mixin(ExternalParamType.prototype, param_type);
    }
  }



 /**
  * Initiate CMSSettingsParamType object, register and mix with base object
  */
  function CMSSettingsParamType() {
    CMSSettingsParamType.baseclass.apply(this, arguments);
  }
  register_param_type('cms_settings', CMSSettingsParamType);
  mixin(CMSSettingsParamType.prototype, {
    get_value: function() {
      return $(this.dom_element).find('form').serialize();
    },
    render_form: function(instance) {
      var param = this;
      glazed_get_cms_element_settings(instance, function(data) {
        $(param.dom_element).empty();
        $(data).appendTo(param.dom_element);
        $(param.dom_element).find('[type="submit"]').remove();
        if (param.form_value.length > 0) {
          $(param.dom_element).deserialize(htmlDecode(param.form_value));
        }
      });
    },
    get_form: function(name_param) {
      var form_value = name_param.get_value();
      if (form_value.length > 0) {
        this.render_form(form_value);
      }
    },
    render: function(value) {
      this.form_value = value;
      this.dom_element = $('<div class="form-group"></div>');
    },
    opened: function() {
      if ('instance' in this) {
        this.render_form(this.instance);
      }
    },
  });

 /**
  * Initiate ContainerParamType object, register and mix with base object
  */
  function ContainerParamType() {
    ContainerParamType.baseclass.apply(this, arguments);
  }
  register_param_type('container', ContainerParamType);
  mixin(ContainerParamType.prototype, {
    get_value: function() {
      return $(this.dom_element).find('input[name="' + this.param_name + '_type"]').val() + '/' + $(this.dom_element)
        .find('input[name="' + this.param_name + '_name"]').val();
    },
    render: function(value) {
      var type = value.split('/')[0];
      var name = value.split('/')[1];
      this.dom_element = $('<div class="form-group"><label>' + this.heading + '</label><div class="wrap-type"><label>' +
        Drupal.t("Type") + '</label><input class="form-control" name="' + this.param_name +
        '_type" type="text" value="' + type + '"></div><div class="wrap-name"><label>' + Drupal.t("Name") + '</label><input class="' +
       'form-control" name="' + this.param_name + '_name" type="text" value="' + name +
        '"></div><p class="help-block">' + this.description + '</p></div>');
    },
    opened: function() {
      var value = this.get_value();
      var type_select = null;
      var name_select = null;
      var element = this;
      glazed_get_container_types(function(data) {
        type_select = chosen_select(data, $(element.dom_element).find('input[name="' + element.param_name +
          '_type"]'));
        $(type_select).chosen().change(function() {
          glazed_get_container_names($(this).val(), function(data) {
            $(name_select).parent().find('.direct-input').click();
            $(element.dom_element).find('input[name="' + element.param_name + '_name"]').val('');
            name_select = chosen_select(data, $(element.dom_element).find('input[name="' + element.param_name +
              '_name"]'));
            //            $(name_select).empty();
            //            for (var key in data) {
            //              $(name_select).append('<option value="' + key + '">"' + data[key] + '"</option>');
            //            }
            //            $(name_select).trigger("chosen:updated");
          });
        });
      });
      glazed_get_container_names(value.split('/')[0], function(data) {
        name_select = chosen_select(data, $(element.dom_element).find('input[name="' + element.param_name +
          '_name"]'));
      });
    },
  });


  /**
   * Initiate glazedElements object
   */
  function glazedElements() {}

  /**
   * Extend glazedElements base object with glazedElements methods and variables
   */
  mixin(glazedElements.prototype, {
    elements_instances: {},
    elements_instances_by_an_name: {},
    template_elements_loaded: false,
    cms_elements_loaded: false,
    edit_stack: [],
    try_render_unknown_elements: function() {
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
    },
    create_template_elements: function(elements) {
      var urls_to_update = {
        'link[href]': 'href',
        'script[src]': 'src',
        'img[src]': 'src',
      };
      if ('glazed_urls_to_update' in window)
        urls_to_update = $.extend(urls_to_update, window.glazed_urls_to_update);
      var editable = [];
      if ('glazed_editable' in window)
        editable = window.glazed_editable;
      var styleable = [];
      if ('glazed_styleable' in window)
        styleable = window.glazed_styleable;
      var sortable = [];
      if ('glazed_sortable' in window)
        sortable = window.glazed_sortable;
      var synchronizable = [];
      if ('glazed_synchronizable' in window)
        synchronizable = window.glazed_synchronizable;
      var restoreable = [];
      if ('glazed_restoreable' in window)
        restoreable = window.glazed_restoreable;
      var containable = [];
      if ('glazed_containable' in window)
        containable = window.glazed_containable;
      // Recognise icons in sidebar elements
      var icons = BaseParamType.prototype.param_types['icon'].prototype.icons.map(function(item, i, arr) {
        return item.replace(/^/, '.').replace(/ /, '.')
      });
      var icon_selector = icons.join(', ');
      for (var path in elements) {
        var name = elements[path].name;
        var template = elements[path].html;
        var folders = path.split('|');
        folders.pop();
        folders = folders.join('/')
        var element_baseurl = window.glazed_baseurl + '../glazed_elements/' + folders + '/';
        if ('baseurl' in elements[path])
          element_baseurl = elements[path].baseurl;
        var thumbnail = '';
        if ('thumbnail' in elements[path])
          thumbnail = elements[path].thumbnail;
        var section = (template.indexOf('az-rootable') >= 0);

        var TemplateElement = function(parent, position) {
          var element = this;
          for (var i = 0; i < this.baseclass.prototype.params.length; i++) {
            if (this.baseclass.prototype.params[i].param_name == 'content' && this.baseclass.prototype.params[
                i].value == '') {
              if ('glazed_ajaxurl' in window) {
                function template_element_urls(dom) {
                  function update_url(url) {
                    if (url.indexOf("glazed_elements") == 0) {
                      return window.glazed_baseurl + '../' + url;
                    }
                    else {
                      if (url.indexOf("/") != 0 && url.indexOf("http://") != 0 && url.indexOf("https://") !=
                        0) {
                        return element.baseurl + url;
                      }
                    }
                    return url;
                  }
                  for (var selector in urls_to_update) {
                    var attr = urls_to_update[selector];
                    $(dom).find(selector).each(function() {
                      $(this).attr(attr, update_url($(this).attr(attr)));
                    });
                  }
                  $(dom).find('[data-az-url]').each(function() {
                    var attr = $(this).attr('data-az-url');
                    $(this).attr(attr, update_url($(this).attr(attr)));
                  });
                  $(dom).find('[style*="background-image"]').each(function() {
                    var style = $(this).attr('style').replace(/background-image[: ]*url\(([^\)]+)\) *;/,
                      function(match, url) {
                        return match.replace(url, encodeURI(update_url(decodeURI(url))));
                      });
                    $(this).attr('style', style);
                  });
                }
                var template = $('<div>' + element.template + '</div>');
                template_element_urls(template);
                template = $(template).html();
                this.baseclass.prototype.params[i].value = template;
              }
              break;
            }
          }
          BaseElement.apply(this, arguments);
        }
        register_element(name, false, TemplateElement);
        mixin(TemplateElement.prototype, {
          baseclass: TemplateElement,
          template: template,
          baseurl: element_baseurl,
          path: path,
          name: name,
          icon: 'fa fa-cube',
          description: Drupal.t(''),
          thumbnail: thumbnail,
          params: [
            make_param_type({
              type: 'html',
              heading: Drupal.t('Content'),
              param_name: 'content',
              value: '',
            }),
          ].concat(TemplateElement.prototype.params),
          show_settings_on_create: false,
          is_container: true,
          has_content: true,
          section: section,
          category: Drupal.t('Template-elements'),
          is_template_element: true,
          editable: ['.az-editable'].concat(editable),
          styleable: ['.az-styleable'].concat(styleable),
          sortable: ['.az-sortable'].concat(sortable),
          synchronizable: ['.az-synchronizable'].concat(synchronizable),
          restoreable: ['.az-restoreable'].concat(restoreable),
          containable: ['.az-containable'].concat(containable),
          restore_nodes: {},
          contained_elements: {},
          show_controls: function() {
            if (window.glazed_editor) {
              var element = this;
              BaseElement.prototype.show_controls.apply(this, arguments);
              var editor_opener = function() {
                if (glazed_elements.edit_stack.length > 0) {
                  var args = glazed_elements.edit_stack.shift();
                  $(args.node).css('outline-width', '2px');
                  $(args.node).css('outline-style', 'dashed');
                  var interval = setInterval(function() {
                    if ($(args.node).css('outline-color') != 'rgb(255, 0, 0)')
                      $(args.node).css('outline-color', 'rgb(255, 0, 0)');
                    else
                      $(args.node).css('outline-color', 'rgb(255, 255, 255)');
                  }, 100);
                  setTimeout(function() {
                    clearInterval(interval);
                    $(args.node).css('outline-color', '');
                    $(args.node).css('outline-width', '');
                    $(args.node).css('outline-style', '');
                    open_editor(args.node, args.edit, args.style, function() {
                      if (glazed_elements.edit_stack.length > 0) {
                        var s1 = $(args.node).width() * $(args.node).height();
                        var s2 = $(glazed_elements.edit_stack[0].node).width() * $(
                          glazed_elements.edit_stack[0].node).height();
                        if (s2 / s1 < 2) {
                          editor_opener();
                        }
                        else {
                          glazed_elements.edit_stack = [];
                        }
                      }
                    });
                  }, 500);
                }
              }

              function open_editor(node, edit, style, callback) {
                var params = [];
                var image = '';
                var link = '';
                var icon = '';
                var content = $.trim($(node).text());
                if (content != '') {
                  content = $(node).html();
                }
                else {
                  content = '&nbsp;&nbsp;&nbsp;';
                }
                if (edit) {
                  if ($(node).is(icon_selector)) {
                    for (var i = 0; i < icons.length; i++) {
                      if ($(node).is(icons[i])) {
                        icon = icons[i].split('.');
                        icon.shift();
                        icon = icon.join(' ');
                        break;
                      }
                    }
                    params.push(make_param_type({
                      type: 'icon',
                      heading: Drupal.t('Icon'),
                      param_name: 'icon',
                    }));
                  }
                  else {
                    if ($(node).prop("tagName") != 'IMG') {
                      if (content != '') {
                        params.push(make_param_type({
                          type: 'textarea',
                          heading: Drupal.t('Content'),
                          param_name: 'content',
                        }));
                      }
                    }
                    else {
                      image = $(node).attr('src');
                      params.push(make_param_type({
                        type: 'image',
                        heading: Drupal.t('Image'),
                        param_name: 'image',
                        description: Drupal.t('Select image from media library.'),
                      }));
                    }
                    if ($(node).prop("tagName") == 'A') {
                      link = $(node).attr('href');
                      params.push(make_param_type({
                        type: 'link',
                        heading: Drupal.t('Link'),
                        param_name: 'link',
                        description: Drupal.t('Content link (url).'),
                      }));
                    }
                  }
                }
                if (style) {
                  params.push(make_param_type({
                    type: 'textfield',
                    heading: Drupal.t('Content classes'),
                    param_name: 'el_class',
                    description: Drupal.t(
                      'If you wish to style particular content element differently, then use this field to add a class name and then refer to it in your css file.'
                    )
                  }));
                  var param_type = make_param_type({
                    type: 'style',
                    heading: Drupal.t('Content style'),
                    param_name: 'style',
                    description: Drupal.t('Style options.'),
                    tab: Drupal.t('Style')
                  });
                  if (edit)
                    params.push(param_type);
                  else
                    params.unshift(param_type);
                }
                $(node).removeClass('editable-highlight');
                $(node).removeClass('styleable-highlight');
                $(node).removeClass(icon);
                var classes = $(node).attr('class');
                $(node).addClass(icon);
                if (typeof classes === typeof undefined || classes === false) {
                  classes = '';
                }
                var styles = '';
                for (var name in node.style) {
                  if ($.isNumeric(name)) {
                    styles = styles + node.style[name] + ': ' + node.style.getPropertyValue(node.style[
                      name]) + '; ';
                  }
                }
                styles = rgb2hex(styles);
                styles = styles.replace(/\-value\: /g, ': ');
                styles = styles.replace('border-top-color', 'border-color');
                styles = styles.replace('border-top-left-radius', 'border-radius');
                styles = styles.replace('border-top-style', 'border-style');
                styles = styles.replace('background-position-x: 50%; background-position-y: 50%;',
                  'background-position: center;');
                styles = styles.replace('background-position-x: 50%; background-position-y: 100%;',
                  'background-position: center bottom;');
                styles = styles.replace('background-repeat-x: no-repeat; background-repeat-y: no-repeat;',
                  'background-repeat: no-repeat;');
                styles = styles.replace('background-repeat-x: repeat;', 'background-repeat: repeat-x;');
                BaseParamType.prototype.show_editor(params, {
                  name: Drupal.t('Content'),
                  attrs: {
                    'content': content,
                    'link': link,
                    'image': image,
                    'el_class': classes,
                    'style': styles,
                    'icon': icon
                  }
                }, function(values) {
                  if (edit) {
                    if (icon != '') {
                      $(node).removeClass(icon);
                      values['el_class'] = values['el_class'] + ' ' + values['icon'];
                    }
                    if ($(node).prop("tagName") == 'A') {
                      $(node).attr('href', values['link']);
                    }
                    if ($(node).prop("tagName") == 'IMG') {
                      $(node).attr('src', values['image']);
                    }
                    else {
                      if (content != '' && values['content'] != '') {
                        $(node).html(values['content']);
                      }
                      else {
                        $(node).html('&nbsp;&nbsp;&nbsp;');
                      }
                    }
                  }
                  if (style) {
                    $(node).attr('class', values['el_class']);
                    $(node).attr('style', values['style']);
                  }
                  element.attrs['content'] = $(element.dom_content_element).html();
                  element.restore_content();
                  synchronize();
                  able();
                  callback();
                });
              }

              function make_node_signature(dom) {
                var cdom = $(dom).clone();
                $(cdom).find('*').each(function() {
                  var elem = this;
                  while (elem.attributes.length > 0)
                    elem.removeAttribute(elem.attributes[0].name);
                });
                var html = $(cdom).html();
                html = html.replace(/\s*/g, '');
                return html;
              }

              function synchronize() {
                sortable_disable();
                for (var i = 0; i < element.synchronizable.length; i++) {
                  $(element.dom_content_element).find(element.synchronizable[i]).each(function() {
                    if ($(this).closest('[data-az-restore]').length == 0) {
                      $(this).find('.editable-highlight').removeClass('editable-highlight');
                      $(this).find('.styleable-highlight').removeClass('styleable-highlight');
                      $(this).find('.sortable-highlight').removeClass('sortable-highlight');
                      $(this).find('[class=""]').removeAttr('class');
                      $(this).find('[style=""]').removeAttr('style');
                      var synchronized = $(this).data('synchronized');
                      if (synchronized) {
                        for (var i = 0; i < synchronized.length; i++) {
                          $(synchronized[i]).html($(this).html());
                        }
                      }
                      if ($(this).data('current-state')) {
                        $(document).trigger("glazed_synchronize", {
                          from_node: this,
                          old_state: $(this).data('current-state'),
                          new_state: $(this).html()
                        });
                      }
                      else {
                        $(document).trigger("glazed_synchronize", {
                          from_node: this,
                          old_state: make_node_signature(this),
                          new_state: $(this).html()
                        });
                      }
                      $(this).data('current-state', make_node_signature(this));
                      element.attrs['content'] = $(element.dom_content_element).html();
                      element.restore_content();
                    }
                  });
                }
                able();
              }
              $(document).on("glazed_synchronize", function(sender, data) {
                sortable_disable();
                for (var i = 0; i < element.synchronizable.length; i++) {
                  $(element.dom_content_element).find(element.synchronizable[i]).each(function() {
                    if ($(this).closest('[data-az-restore]').length == 0) {
                      $(this).find('.editable-highlight').removeClass('editable-highlight');
                      $(this).find('.styleable-highlight').removeClass('styleable-highlight');
                      $(this).find('.sortable-highlight').removeClass('sortable-highlight');
                      $(this).find('[class=""]').removeAttr('class');
                      $(this).find('[style=""]').removeAttr('style');
                      if (this != data.from_node) {
                        if (make_node_signature(this) == data.old_state) {
                          var synchronized = $(data.from_node).data('synchronized');
                          if (!synchronized)
                            synchronized = [];
                          synchronized.push(this);
                          synchronized = $.unique(synchronized);
                          $(data.from_node).data('synchronized', synchronized);

                          synchronized = $(this).data('synchronized');
                          if (!synchronized)
                            synchronized = [];
                          synchronized.push(data.from_node);
                          synchronized = $.unique(synchronized);
                          $(this).data('synchronized', synchronized);

                          $(this).html(data.new_state);
                          element.attrs['content'] = $(element.dom_content_element).html();
                          element.restore_content();
                        }
                      }
                    }
                  });
                }
                able();
              });

              function sortable_disable() {
                for (var i = 0; i < element.sortable.length; i++) {
                  $(element.dom_content_element).find(element.sortable[i]).each(function() {
                    if ($(this).hasClass('ui-sortable')) {
                      if ($(this).data('sortable')) {
                        $(this).data('sortable', false);
                        $(this).sortable('destroy');
                        $(this).find('.ui-sortable-handle').removeClass('ui-sortable-handle');
                      }
                    }
                  });
                }
              }

              function sortable_enable() {
                for (var i = 0; i < element.sortable.length; i++) {
                  $(element.dom_element).find(element.sortable[i]).each(function() {
                    if ($(this).closest('[data-az-restore]').length == 0) {
                      $(this).data('sortable', true);
                      $(this).sortable({
                        items: '> *',
                        placeholder: 'az-sortable-placeholder',
                        forcePlaceholderSize: true,
                        start: function(event, ui) {
                          $(ui.item).removeClass('sortable-highlight').find(
                            '.az-sortable-controls').remove();
                        },
                        update: function(event, ui) {
                          element.attrs['content'] = $(element.dom_content_element).html();
                          element.restore_content();
                          synchronize();
                        },
                        over: function(event, ui) {
                          ui.placeholder.attr('class', ui.helper.attr('class'));
                          ui.placeholder.removeClass('ui-sortable-helper');
                          ui.placeholder.addClass('az-sortable-placeholder');
                        }
                      });
                    }
                  });
                }
              }

              function able() {
                for (var i = 0; i < element.restoreable.length; i++) {
                  $(element.dom_element).find(element.restoreable[i]).off('mouseenter.az-restoreable').on(
                    'mouseenter.az-restoreable',
                    function() {
                      $(this).addClass('restoreable-highlight');
                    });
                  $(element.dom_element).find(element.restoreable[i]).off('mouseleave.az-restoreable').on(
                    'mouseleave.az-restoreable',
                    function() {
                      $(this).removeClass('restoreable-highlight');
                    });
                  $(element.dom_element).find(element.restoreable[i]).off('click.az-restoreable').on(
                    'click.az-restoreable',
                    function(e) {
                      if ($(this).is('[data-az-restore]')) {
                        var params = [];
                        params.push(make_param_type({
                          type: 'html',
                          heading: Drupal.t('HTML'),
                          param_name: 'html',
                        }));
                        var id = $(this).attr('data-az-restore');
                        var html = element.restore_nodes[id];
                        BaseParamType.prototype.show_editor(params, {
                          name: Drupal.t('Content'),
                          attrs: {
                            'html': html
                          }
                        }, function(values) {
                          element.restore_nodes[id] = values['html'];
                          element.restore_content();
                          element.update_dom();
                          synchronize();
                        });
                        return false;
                      }
                    });
                }
                for (var i = 0; i < element.styleable.length; i++) {
                  $(element.dom_element).find(element.styleable[i]).off('mouseenter.az-styleable').on(
                    'mouseenter.az-styleable',
                    function() {
                      if ($(this).closest('[data-az-restore]').length == 0)
                        $(this).addClass('styleable-highlight');
                    });
                  $(element.dom_element).find(element.styleable[i]).off('mouseleave.az-styleable').on(
                    'mouseleave.az-styleable',
                    function() {
                      if ($(this).closest('[data-az-restore]').length == 0)
                        $(this).removeClass('styleable-highlight');
                    });
                  $(element.dom_element).find(element.styleable[i]).off('click.az-styleable').on(
                    'click.az-styleable',
                    function(e) {
                      if ($(this).closest('[data-az-restore]').length == 0) {
                        if ($(this).parent().closest('.styleable-highlight, .editable-highlight').length ==
                          0) {
                          glazed_elements.edit_stack.push({
                            node: this,
                            edit: false,
                            style: true,
                          });
                          editor_opener();
                          return false;
                        }
                        else {
                          glazed_elements.edit_stack.push({
                            node: this,
                            edit: false,
                            style: true,
                          });
                        }
                      }
                    });
                }
                for (var i = 0; i < element.editable.length; i++) {
                  $(element.dom_element).find(element.editable[i]).off('mouseenter.az-editable').on(
                    'mouseenter.az-editable',
                    function() {
                      if ($(this).closest('[data-az-restore]').length == 0)
                        $(this).addClass('editable-highlight');
                    });
                  $(element.dom_element).find(element.editable[i]).off('mouseleave.az-editable').on(
                    'mouseleave.az-editable',
                    function() {
                      if ($(this).closest('[data-az-restore]').length == 0)
                        $(this).removeClass('editable-highlight');
                    });
                  $(element.dom_element).find(element.editable[i]).off('click.az-editable').on(
                    'click.az-editable',
                    function(e) {
                      if ($(this).closest('[data-az-restore]').length == 0) {
                        if ($(this).parent().closest('.styleable-highlight, .editable-highlight').length ==
                          0) {
                          glazed_elements.edit_stack.push({
                            node: this,
                            edit: true,
                            style: true,
                          });
                          editor_opener();
                          return false;
                        }
                        else {
                          glazed_elements.edit_stack.push({
                            node: this,
                            edit: true,
                            style: true,
                          });
                        }
                      }
                    });
                }
                var sort_stack = [];
                var sorted_node = null;
                var timeoutId = null;

                function show_controls(node) {
                  if ($(node).hasClass('sortable-highlight')) {
                    $(node).find('.az-sortable-controls').remove();
                    var controls = $('<div class="az-sortable-controls"></div>').appendTo(node);
                    var clone = $('<div class="az-sortable-clone glyphicon glyphicon-duplicate" title="' + Drupal.t('Clone') + '"></div>').appendTo(controls).click(
                      function() {
                        sortable_disable();
                        $(node).removeClass('sortable-highlight').find('.az-sortable-controls').remove();
                        $(node).clone().insertAfter(node);
                        element.attrs['content'] = $(element.dom_content_element).html();
                        element.restore_content();
                        synchronize();
                        able();
                        return false;
                      });
                    $(clone).css('line-height', $(clone).height() + 'px').css('font-size', $(clone).height() /
                      2 + 'px');
                    var remove = $('<div class="az-sortable-remove glyphicon glyphicon-trash" title="' + Drupal.t('Remove') + '"></div>').appendTo(controls).click(
                      function() {
                        sortable_disable();
                        $(node).removeClass('sortable-highlight').find('.az-sortable-controls').remove();
                        $(node).remove();
                        element.attrs['content'] = $(element.dom_content_element).html();
                        element.restore_content();
                        synchronize();
                        able();
                        return false;
                      });
                    $(remove).css('line-height', $(remove).height() + 'px').css('font-size', $(remove).height() /
                      2 + 'px');
                  }
                }
                $(element.dom_element).off('mousemove.az-able').on('mousemove.az-able', function() {
                  if (sorted_node != null && $(sorted_node).hasClass('sortable-highlight')) {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(function() {
                      show_controls(sorted_node);
                    }, 1000);
                  }
                });
                for (var i = 0; i < element.sortable.length; i++) {
                  (function(i) {
                    $(element.dom_element).find(element.sortable[i]).find('> *').off(
                      'mouseenter.az-sortable').on('mouseenter.az-sortable', function() {
                      if ($(this).closest('[data-az-restore]').length == 0) {
                        var node = this;
                        $(element.dom_element).find('.az-sortable-controls').remove();
                        $(element.dom_element).find('.sortable-highlight').removeClass(
                          'sortable-highlight');
                        if (sorted_node !== null) {
                          clearTimeout(timeoutId);
                        }

                        $(node).addClass('sortable-highlight');
                        sort_stack.push(node);
                        sorted_node = node;
                        timeoutId = setTimeout(function() {
                          show_controls(node);
                        }, 1000);
                      }
                    });
                    $(element.dom_element).find(element.sortable[i]).find('> *').off(
                      'mouseleave.az-sortable').on('mouseleave.az-sortable', function() {
                      if ($(this).closest('[data-az-restore]').length == 0) {
                        var node = this;
                        $(element.dom_element).find('.az-sortable-controls').remove();
                        $(element.dom_element).find('.sortable-highlight').removeClass(
                          'sortable-highlight');
                        if (sorted_node !== null) {
                          clearTimeout(timeoutId);
                        }

                        sort_stack.pop();
                        if (sort_stack.length > 0) {
                          node = sort_stack[sort_stack.length - 1]
                          $(node).addClass('sortable-highlight');

                          sorted_node = node;
                          timeoutId = setTimeout(function() {
                            show_controls(node);
                          }, 1000);
                        }
                        else {
                          sorted_node = null;
                        }
                      }
                    });
                  })(i);
                }
                sortable_enable();
              }
              able();
              synchronize();
            }
          },
          restore_content: function() {
            var element = this;
            var content = $('<div>' + this.attrs['content'] + '</div>');
            for (var id in this.restore_nodes) {
              $(content).find('[data-az-restore="' + id + '"]').html(this.restore_nodes[id]);
            }
            $(document).trigger('glazed_restore', {
              dom: content
            });
            this.attrs['content'] = $(content).html();
          },
          get_content: function() {
            this.restore_content();
            return BaseElement.prototype.get_content.apply(this, arguments);
          },
          restore: function(dom) {
            BaseElement.prototype.restore.apply(this, arguments);
            for (var id in this.restore_nodes) {
              $(dom).find('[data-az-restore="' + id + '"]').html(this.restore_nodes[id]);
            }
            $(document).trigger('glazed_restore', {
              dom: dom
            });
            $(dom).find('[data-az-restore]').removeAttr('data-az-restore');
          },
          showed: function($) {
            BaseElement.prototype.showed.apply(this, arguments);
            var element = this;
            if (element.section) {
              var container = $(element.dom_element).parent().closest('.container, .container-fluid');
              var container_path = $(element.dom_element).parentsUntil('.container, .container-fluid');
              var popup = $(element.dom_element).parent().closest('.az-popup-ctnr');
              var popup_path = $(element.dom_element).parentsUntil('.az-popup-ctnr');

              if ((container.length > 0 && popup.length == 0) || (container.length > 0 && popup.length >
                  0 && container_path.length < popup_path.length))
                $(element.dom_content_element).find('.container, .container-fluid').each(
                  function() {
                    $(this).removeClass(p + 'container');
                    $(this).removeClass(p + 'container-fluid');
                    element.attrs['content'] = $(element.dom_content_element).html();
                    element.restore_content();
                    element.section = false;
                  });
            }
          },
          render: function($) {
            var element = this;
            this.dom_element = $('<div class="az-element az-template ' + this.get_el_classes() +
              '" style="' + this.attrs['style'] + '"></div>');
            this.dom_content_element = $('<div></div>').appendTo(this.dom_element);
            var content = '<div>' + this.attrs['content'] + '</div>';
            content = $(content);
            element.restore_nodes = {};
            for (var i = 0; i < this.restoreable.length; i++) {
              $(content).find(this.restoreable[i]).each(function() {
                var id = _.uniqueId('r');
                $(this).attr('data-az-restore', id);
                element.restore_nodes[id] = $(this).html();
              });
            }
            this.attrs['content'] = $(content).html();
            $(this.attrs['content']).appendTo(this.dom_content_element);
            BaseElement.prototype.render.apply(this, arguments);
          },
        });
      }
      this.template_elements_loaded = true;
      make_glazed_extend();
      this.try_render_unknown_elements();
      $(function() {
        if (window.glazed_editor && Object.keys(elements).length > 0 && glazed_containers.length > 0) {
          var menu = {
            '_': []
          };
          for (var path in elements) {
            var folders = path.split('|');
            folders.pop();
            var current = menu;
            for (var i = 0; i < folders.length; i++) {
              if (!(folders[i] in current))
                current[folders[i]] = {
                  '_': []
                };
              current = current[folders[i]];
            }
            current['_'].push(elements[path]);
          }
          var panel = $('<div id="az-template-elements" class="az-left-sidebar glazed"></div>').appendTo(
            'body');
          $('<div class="glazed-snippets-header clearfix"><img src="'
            + window.glazed_baseurl
            + 'images/glazed-logo-white.svg">'
            + '<h3>' + Drupal.t('Glazed Snippets') + '</h3>'
            + '</div>')
            .appendTo(panel);

          function build_menu(item) {
            if (Object.keys(item).length === 1 && ('_' in item))
              return null;
            var m = $('<ul class="nav az-nav-list"></ul>');
            for (var name in item) {
              if (name != '_') {
                var li = $('<li></li>').appendTo(m).on('mouseenter', function() {
                  $(this).find('> .az-nav-list').css('display', 'block');
                });
                var it = item[name];
                (function(it) {
                  $('<a href="#">' + name + '</a>').appendTo(li).click(function() {
                    var menu_item = this;
                    $(thumbnails).empty();
                    $(thumbnails).css('display', 'block');
                    $(panel).addClass('az-thumbnails');

                    function get_all_thumbnails(item) {
                      for (var name in item) {
                        if (name == '_') {
                          for (var i = 0; i < item[name].length; i++) {
                            $('<img class="az-thumbnail" data-az-base="' + item[name][i].name +
                              '" src="' + encodeURI(item[name][i].thumbnail) +
                              '">'
                            ).appendTo(thumbnails);
                          }
                        }
                        else {
                          get_all_thumbnails(item[name]);
                        }
                      }
                    }
                    get_all_thumbnails(it);
                    $(panel).off('mouseleave').on('mouseleave', function() {
                      if (!dnd) {
                        $(panel).css('left', '');
                        $(panel).removeClass('az-thumbnails');
                        $(thumbnails).css('overflow-y', 'scroll');
                        $(thumbnails).css('display', 'none');
                      }
                    });
                    var dnd = false;
                    var scrollTop = 0;
                    $(thumbnails).sortable({
                      items: '.az-thumbnail',
                      connectWith: '.az-ctnr',
                      start: function(event, ui) {
                        dnd = true;
                        $(panel).css('left', '0px');
                        $(thumbnails).css('overflow-y', 'visible');
                        scrollTop = $(window).scrollTop();
                        $(window).on('scroll.template-elements-sortable', function() {
                          $(window).scrollTop(scrollTop);
                        });
                      },
                      stop: function(event, ui) {
                        dnd = false;
                        $(panel).css('left', '');
                        $(panel).removeClass('az-thumbnails');
                        $(thumbnails).css('overflow-y', 'scroll');
                        $(thumbnails).css('display', 'none');
                        $(window).off('scroll.template-elements-sortable');
                      },
                      update: function(event, ui) {
                        var container = glazed_elements.get_element($(ui.item).parent().closest(
                          '[data-az-id]').attr('data-az-id'));
                        var postition = 0;
                        var children = $(ui.item).parent().find('[data-az-id], .az-thumbnail');
                        for (var i = 0; i < children.length; i++) {
                          if ($(children[i]).hasClass('az-thumbnail')) {
                            postition = i;
                            break;
                          }
                        }
                        var element = glazed_elements.create_element(container, $(ui.item).attr(
                          'data-az-base'), postition, function() {});
                        $(ui.item).detach();
                        $(menu_item).click();
                        $(window).scrollTop(scrollTop);
                      },
                      placeholder: 'az-sortable-placeholder',
                      forcePlaceholderSize: true,
                      over: function(event, ui) {
                        ui.placeholder.attr('class', ui.helper.attr('class'));
                        ui.placeholder.removeClass('ui-sortable-helper');
                        ui.placeholder.addClass('az-sortable-placeholder');
                      }
                    });
                    return false;
                  });
                })(it);
                $(li).append(build_menu(item[name]));
              }
            }
            return m;
          }
          $(panel).append(build_menu(menu));
          $(panel).find('> .az-nav-list > li').on('mouseleave', function() {
            $(this).find('.az-nav-list').css('display', 'none');
          });
          var thumbnails = $('<div id="az-thumbnails"></div>').appendTo(panel);
        }
      });
    },
    create_cms_elements: function(elements) {
      for (var key in elements) {
        var base = 'az_' + key;
        var CMSElement = function(parent, position) {
          CMSElement.baseclass.apply(this, arguments);
        };
        register_element(base, false, CMSElement);

        // Create object.
        var object = {
          name: elements[key],
          icon: 'fa fa-drupal',
          description: Drupal.t(''),
          category: 'CMS',
          instance: key,
          params: [
            make_param_type({
              type: 'cms_settings',
              heading: Drupal.t('Settings'),
              param_name: 'settings',
              instance: key,
            })
          ],
          show_settings_on_create: true,
          is_container: true,
          has_content: true,
          is_cms_element: true,
          get_button: function() {
            // Remove text "Block:" from name.
            var name = this.name.replace(/^Block: /, '');
            return '<div class="well text-center pull-left text-overflow glazed-cms" data-az-element="' + this.base + '"><i class="' + this.icon +
              '"></i>' + name + '</div>';
          },
          // Render button with attribute data-az-tag.
          get_button_with_tag: function() {
            var tag = '';
            // Remove text "View:" from name.
            var name = this.name.replace(/^View: /, '');
            if ($.inArray(window.glazed_views_tags, this.base > -1)) {
              tag = window.glazed_views_tags[this.base];
            }
            return '<div class="well text-center pull-left text-overflow glazed-cms" data-az-element="' + this.base + '" data-az-tag="' + tag +
              '"><i class="' + this.icon + '"></i>' + name + '</div>';
          },
          get_content: function() {
            return '';
          },
          showed: function($) {
            CMSElement.baseclass.prototype.showed.apply(this, arguments);
            if ('content' in this.attrs && this.attrs['content'] != '') {
              $(this.dom_content_element).append(this.attrs['content']);
              this.attrs['content'] = '';
            }
            else {
              var element = this;
              glazed_add_js({
                path: 'vendor/jquery.waypoints/lib/jquery.waypoints.min.js',
                loaded: 'waypoint' in $.fn,
                callback: function() {
                  $(element.dom_element).waypoint(function(direction) {
                    var container = element.parent.get_my_container();
                    var data = {
                      display_title: element.attrs['display_title'],
                      override_pager: element.attrs['override_pager'],
                      items: element.attrs['items'],
                      offset: element.attrs['offset'],
                      contextual_filter: element.attrs['contextual_filter'],
                      toggle_fields: element.attrs['toggle_fields'],
                    }
                    glazed_builder_load_cms_element(element.instance, element.attrs['settings'], container.attrs['container'], data,
                      function(data) {
                        $(element.dom_content_element).empty();
                        $(element.dom_content_element).append(data);
                        Drupal.attachBehaviors($(element.dom_content_element));
                      }, true);
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
          },
          render: function($) {
            this.dom_element = $('<div class="az-element az-cms-element ' + this.get_el_classes() +
              '" style="' + this.attrs['style'] + '"></div>');
            this.dom_content_element = $('<div></div>').appendTo(this.dom_element);
            CMSElement.baseclass.prototype.render.apply(this, arguments);
          }
        };

        if (key.match(/^block-/)) {
          object.params.push(make_param_type({
            type: 'checkbox',
            heading: Drupal.t('Show title'),
            param_name: 'display_title',
            content: 'yes',
            value: {
              'yes': Drupal.t('Yes')
            }
          }));
        }

        // Condition for check views and if contextual filter enabled.
        if (key.match("^view-")) {
          var param_type_items = {
            type: 'textfield',
            heading: Drupal.t('Items to display'),
            param_name: 'items',
            description: Drupal.t('The number of items to display. Enter 0 for no limit.'),
            can_be_empty: true,
            dependency: {
              'element': 'override_pager',
              'value': ['yes']
            }
          };
          // Skip over views that are deleted but still in our views settings cache
          if (!(window.glazed_cms_element_views_settings.hasOwnProperty(base))) {
            continue;
          }
          if (window.glazed_cms_element_views_settings[base].view_display_type == 'block') {
            param_type_items.heading = Drupal.t('Items to display:');
            param_type_items.description = Drupal.t('The number of items to display. Enter 0 for no limit.');
          } else {
            param_type_items.heading = Drupal.t('Items per page:');
            param_type_items.description = Drupal.t('The number to display per page. Enter 0 for no limit.');
          }
          if (window.glazed_cms_element_views_settings[base].title) {
            object.params.push(make_param_type({
              type: 'checkbox',
              heading: Drupal.t('Show title'),
              param_name: 'display_title',
              content: 'yes',
              value: {
                'yes': Drupal.t('Yes')
              },
            }));
          }
          object.params.push(make_param_type({
            type: 'dropdown',
            heading: Drupal.t('Override pager'),
            param_name: 'override_pager',
            value: {
              'no': Drupal.t('No'),
              'yes': Drupal.t('Yes'),
            },
          }));

          if (window.glazed_cms_element_views_settings[base].pager.items_per_page)
            param_type_items.value = window.glazed_cms_element_views_settings[base].pager.items_per_page;
          object.params.push(make_param_type(param_type_items));
          var param_type_offset = {
            type: 'textfield',
            heading: Drupal.t('Pager Offset'),
            param_name: 'offset',
            description: Drupal.t('The number of items to skip.'),
            can_be_empty: true,
            dependency: {
              'element': 'override_pager',
              'value': ['yes']
            }
          };

          if (window.glazed_cms_element_views_settings[base].pager.offset)
            param_type_offset.value = window.glazed_cms_element_views_settings[base].pager.offset;
          object.params.push(make_param_type(param_type_offset));
          if (window.glazed_cms_element_views_settings[base].contextual_filter)
            object.params.push(make_param_type({
              type: 'textfield',
              heading: Drupal.t('Contextual filter:'),
              param_name: 'contextual_filter',
              description: Drupal.t('Separate contextual filter values with a "/". For example, 40/12/10.'),
              can_be_empty: true
            }));
          if (window.glazed_cms_element_views_settings[base].use_fields) {
            var toggleFields = {
              type: 'checkboxes',
              heading: Drupal.t('Field settings'),
              param_name: 'toggle_fields',
              value: {},
              tab: Drupal.t('Toggle Fields'),
            }
            for (var id in  window.glazed_cms_element_views_settings[base].field_list) {
              var item = window.glazed_cms_element_views_settings[base].field_list[id];
              toggleFields.value[id] = item;
            }
              if (window.glazed_cms_element_views_settings[base].field_values !='')
                toggleFields.content = window.glazed_cms_element_views_settings[base].field_values;
            object.params.push(make_param_type(toggleFields));
          }
        }

        // Add basic params.
        object.params = object.params.concat(CMSElement.prototype.params);
        mixin(CMSElement.prototype, object);
      }
      this.cms_elements_loaded = true;
      make_glazed_extend();
      this.try_render_unknown_elements();
    },
    create_element: function(container, base, position, pre_render_callback) {
      var depth = container.get_nested_depth(base);
      if (depth < BaseElement.prototype.max_nested_depth) {

        var constructor = BaseElement.prototype.elements[base];
        if (container instanceof ContainerElement && container.parent == null && !constructor.prototype.section) {
          var section = new SectionElement(container, position);
          section.update_dom();
          var child = new constructor(section, false);
          pre_render_callback(child);
          child.update_dom();
          container.update_empty();
          section.update_empty();
        }
        else {
          var child = new constructor(container, position);
          pre_render_callback(child);
          child.update_dom();
          container.update_empty();
        }
        return child;
      }
      else {
        alert(Drupal.t('Element can not be added. Max nested depth reached.'));
      }
      return false;
    },
    make_elements_modal: function(container, pre_render_callback) {
      var disallowed_elements = container.get_all_disallowed_elements();
      var tabs = {};
      for (var id in BaseElement.prototype.elements) {
        if (BaseElement.prototype.elements[id].prototype.hidden)
          continue;
        if (container.base != 'az_popup') {
          if (disallowed_elements.indexOf(BaseElement.prototype.elements[id].prototype.base) >= 0)
            continue;
        }

        // Without sidebar elements.
        if (BaseElement.prototype.elements[id].prototype.category != 'Template-elements') {

          // Split CMS elements for Blocks and Views.
          if ((BaseElement.prototype.elements[id].prototype.category == 'CMS')) {
            var itemName = BaseElement.prototype.elements[id].prototype.name.match(/^Block/) ? 'Blocks' :
              'Views';
            var blockViews = 'block-views';
            if (BaseElement.prototype.elements[id].prototype.base.indexOf(blockViews) < 0) {
              if (!(itemName in tabs)) {
                tabs[itemName] = [];
              }
              tabs[itemName].push(BaseElement.prototype.elements[id]);
            }
          }
          else {
            if (!(BaseElement.prototype.elements[id].prototype.category in tabs)) {
              tabs[BaseElement.prototype.elements[id].prototype.category] = [];
            }
            tabs[BaseElement.prototype.elements[id].prototype.category].push(BaseElement.prototype.elements[id]);
          }
        }
      }
      var elements_tabs = $('<div id="az-elements-tabs"></div>');
      var i = 0;
      var menu = '<ul class="nav nav-tabs">';
      for (var title in tabs) {
        i++;
        if (title === '')
          title = Drupal.t('Content');
        menu += '<li><a href="#az-elements-tab-' + i + '" data-toggle="tab">' + title + '</a></li>';
      }
      if (window.glazed_online)
        menu += '<li><a href="#az-elements-tab-templates" data-toggle="tab">' + Drupal.t("Saved Templates") +
        '</a></li>';
      menu += '</ul>';
      $(elements_tabs).append(menu);
      i = 0;
      var tabs_content = $('<div class="tab-content"></div>');
      // Save views tab id.
      var viewsIndexTab = 0;
      for (var title in tabs) {
        i++;
        var tab = $('<div id="az-elements-tab-' + i + '" class="tab-pane clearfix"></div>');
        // Check if elements is view.
        if (title == 'Views') {
          viewsIndexTab = i;
          for (var j = 0; j < tabs[title].length; j++) {
            // Use render function for set data-az-tag.
            $(tab).append(tabs[title][j].prototype.get_button_with_tag());
          }
        }
        else {
          for (var j = 0; j < tabs[title].length; j++) {
            $(tab).append(tabs[title][j].prototype.get_button());
          }
        }
        $(tabs_content).append(tab);
      }
      // Create unique tags element for create options.
      var tags = [];
      for (var key in window.glazed_views_tags) {
        if (tags.indexOf(window.glazed_views_tags[key]) == -1) {
          tags.push(window.glazed_views_tags[key]);
        }
      }

      // Filter container
      var tagsFilter = "<div class='filter-tags'><label>" + Drupal.t('Filter by tag') +
        "</label><select><option value='all_views'>" + Drupal.t('show all') + "</option>";
      for (var key in tags) {
        // Set options.
        tagsFilter = tagsFilter + '<option value="' + tags[key] + '">' + tags[key].replace(/_/g, ' ') +
          '</option>';
      }
      tagsFilter = tagsFilter + '</select></div>';
      tagsFilter = $(tagsFilter);
      // Function for triger all views element with extra data.
      tagsFilter.find('select').bind('change', function() {
        var dataTag = this.options[this.selectedIndex].value;
        tabs_content.find('#az-elements-tab-' + viewsIndexTab + ' .well').trigger('filtredData', dataTag);
      });

      // Show and hide eleements.
      tabs_content.find('#az-elements-tab-' + viewsIndexTab + ' .well').bind('filtredData', function(event, tag) {
        var $this = $(this);
        if (tag == 'all_views') {
          // Show all elements.
          $this.show();
        }
        else {
          if ($this.attr('data-az-tag') != tag) {
            $this.hide();
          }
          else {
            $this.show();
          }
        }
      });
      // Added filter object.
      $(tabs_content).find('#az-elements-tab-' + viewsIndexTab).prepend(tagsFilter);
      if (window.glazed_online)
        tab = $('<div id="az-elements-tab-templates" class="tab-pane clearfix"></div>');
      $(tabs_content).append(tab);
      $(elements_tabs).append(tabs_content);

      $('#az-elements-modal').remove();
      var header = '<div class="modal-header"><span class="close" data-dismiss="modal" aria-hidden="true">&times;</span><h4 class="modal-title">' + '<img src="' + window.glazed_baseurl +
        'images/glazed-logo-white.svg">' + '</h4></div>';
      var elements_modal = $('<div id="az-elements-modal" class="modal glazed" style="display:none"><div class="modal-dialog modal-lg"><div class="modal-content">' + header + '<div class="modal-body"></div></div></div></div>');
      $('body').prepend(elements_modal);
      $(elements_modal).find('.modal-body').append(elements_tabs);
      $(elements_tabs).find('> ul a:first')[fp + 'tab']('show');
      $(elements_modal).find('[data-az-element]').click(function() {
        var key = $(this).attr('data-az-element');
        var child = glazed_elements.create_element(container, key, false, pre_render_callback);
        if (child) {
          $('#az-elements-modal')[fp + 'modal']("hide");
          if (child.show_settings_on_create) {
            child.edit();
          }
        }
      });
      if (window.glazed_online)
        $(elements_tabs).find('a[href="#az-elements-tab-templates"]').on('shown.bs.tab', function(e) {
          //e.target
          glazed_get_templates(function(templates) {
            var tab_templates = $(elements_tabs).find('#az-elements-tab-templates');
            $(tab_templates).empty();
            for (var i = 0; i < templates.length; i++) {
              var name = templates[i];
              var button = '<div class="well text-center pull-left text-overflow glazed-saved" data-az-template="' + name +
                '"><i class="glyphicon glyphicon-floppy-disk"></i><div>' + name +
                '</div></div>';
              button = $(button).appendTo(tab_templates).click(function() {
                var key = $(this).attr('data-az-template');
                glazed_load_template(key, function(shortcode) {
                  var length = container.children.length;
                  BaseElement.prototype.parse_shortcode.call(container, shortcode);
                  for (var i = length; i < container.children.length; i++) {
                    container.children[i].recursive_render();
                  }
                  for (var i = length; i < container.children.length; i++) {
                    $(container.dom_content_element).append(container.children[i].dom_element);
                  }
                  if (window.glazed_editor) {
                    container.update_empty();
                    container.update_sortable();
                  }
                  container.recursive_showed();
                  $('#az-elements-modal')[fp + 'modal']("hide");
                });
              });
              $('<span class="fa fa-trash-o" data-az-template="' + name + '"></span>').appendTo(button).click(
                function() {
                  var name = $(this).attr('data-az-template');
                  glazed_delete_template(name);
                  $(tab_templates).find('[data-az-template="' + name + '"]').remove();
                });
            }
          });
        });
    },
    show: function(container, pre_render_callback) {
      $('#az-elements-modal').remove();
      this.make_elements_modal(container, pre_render_callback);
      $('#az-elements-modal')[fp + 'modal']('show');
      $('#az-elements-modal #az-elements-tabs').find('> ul a:first')[fp + 'tab']('show');
    },
    showTemplates: function(container, pre_render_callback) {
      $('#az-elements-modal').remove();
      this.make_templates_modal(container, pre_render_callback);
      $('#az-elements-modal')[fp + 'modal']('show');
      $('#az-elements-modal #az-elements-tabs').find('> ul a:first')[fp + 'tab']('show');
    },
    make_templates_modal: function(container, pre_render_callback) {
      var tabs = {};
      var elements_tabs = $('<div id="az-elements-tabs"></div>');
      var i = 0;
      var menu = '<ul class="nav nav-tabs">';
      if (window.glazed_online)
        menu += '<li><a href="#az-elements-tab-templates" data-toggle="tab">' + Drupal.t("Layouts") +
          '</a></li>';
      menu += '</ul>';
      $(elements_tabs).append(menu);
      var tabs_content = $('<div class="tab-content"></div>');
      // Save views tab id.

      if (window.glazed_online)
        tab = $('<div id="az-elements-tab-templates" class="tab-pane clearfix"></div>');
      $(tabs_content).append(tab);
      $(elements_tabs).append(tabs_content);

      $('#az-elements-modal').remove();
      var header = '<div class="modal-header"><span class="close" data-dismiss="modal" aria-hidden="true">&times;</span><h4 class="modal-title">' + '<img src="' + window.glazed_baseurl +
        'images/glazed-logo-white.svg">' + '</h4></div>';
      var elements_modal = $('<div id="az-elements-modal" class="modal glazed" style="display:none"><div class="modal-dialog modal-lg"><div class="modal-content">' + header + '<div class="modal-body"></div></div></div></div>');
      $('body').prepend(elements_modal);
      $(elements_modal).find('.modal-body').append(elements_tabs);
      if (window.glazed_online)
          //e.target
        glazed_get_page_templates(function(data) {
          var tab_templates = $(elements_tabs).find('#az-elements-tab-templates');
          var columns = [];
          var categories = [];
          columns[0] = $('<div class="col-md-4"></div>');
          columns[1] = $('<div class="col-md-4"></div>');
          columns[2] = $('<div class="col-md-4"></div>');
          var col = 0;
          $(tab_templates).empty();
          if ($.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
              col = i % 3;
              var title = data[i].title;
              var uuid = data[i].uuid;
              var $button = $('<div class="page-template text-center pull-left text-overflow glazed-saved" data-az-template="' + uuid +
                '"><div class="lead">' + title + '</div></div>');
              if (data[i].image != '') {
                var $image = $('<img class="template-image" src="' + data[i].image + '"></img>');
                $image.appendTo($button);
              } else {
                var $icon = $('<i class="glyphicon glyphicon-floppy-disk"></i>');
                $icon.appendTo($button);
              }
              $button.appendTo(columns[col]).click(function () {
                var key = $(this).attr('data-az-template');
                glazed_load_page_template(key, function (shortcode) {
                  var length = container.children.length;
                  BaseElement.prototype.parse_shortcode.call(container, shortcode);
                  for (var i = length; i < container.children.length; i++) {
                    container.children[i].recursive_render();
                  }
                  for (var i = length; i < container.children.length; i++) {
                    $(container.dom_content_element).append(container.children[i].dom_element);
                  }
                  if (window.glazed_editor) {
                    container.update_empty();
                    container.update_sortable();
                  }
                  container.recursive_showed();
                  $('#az-elements-modal')[fp + 'modal']("hide");
                  $(window).trigger('CKinlineAttach');
                });
              });
              columns[0].appendTo(tab_templates);
              columns[1].appendTo(tab_templates);
              columns[2].appendTo(tab_templates);
            }
          } else {
            $(data).appendTo(tab_templates);
          }
        });
    },
    get_element: function(id) {
      return this.elements_instances[id];
    },
    delete_element: function(id) {
      $(document).trigger("glazed_delete_element", id);
      delete this.elements_instances[id];
    },
    add_element: function(id, element, position) {
      this.elements_instances[id] = element;
      $(document).trigger("glazed_add_element", {
        id: id,
        position: position
      });
    },
  });


  function BaseElement(parent, position) {
    this.id = Math.random().toString(36).substr(2, 8);
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
  var classes = {};
  if ('glazed_classes' in window) {
    classes = window.glazed_classes;
  }
  BaseElement.prototype = {
    el_classes: $.extend({
      "optgroup-bootstrap": Drupal.t('Bootstrap classes'),
      "bg-default": Drupal.t('Background default style'),
      "bg-primary": Drupal.t('Background primary style'),
      "bg-success": Drupal.t('Background success style'),
      "center-block": Drupal.t('Block align center'),
      "clearfix": Drupal.t('Clearfix'),
      "hidden-lg": Drupal.t('Hidden on large devices, desktops (≥1200px)'),
      "hidden-md": Drupal.t('Hidden on medium devices, desktops (≥992px)'),
      "hidden-sm": Drupal.t('Hidden on small devices, tablets (≥768px)'),
      "hidden-xs": Drupal.t('Hidden on extra small devices, phones (<768px)'),
      "lead": Drupal.t('Text Lead style'),
      "pull-left": Drupal.t('Pull left'),
      "pull-right": Drupal.t('Pull right'),
      "text-center": Drupal.t('Text align center'),
      "text-default": Drupal.t('Text default style'),
      "text-justify": Drupal.t('Text align justify'),
      "text-left": Drupal.t('Text align left'),
      "text-muted": Drupal.t('Text muted style'),
      "text-primary": Drupal.t('Text primary style'),
      "text-right": Drupal.t('Text align right'),
      "text-success": Drupal.t('Text success style'),
      "visible-lg-block": Drupal.t('Visible on large devices, desktops (≥1200px)'),
      "visible-md-block": Drupal.t('Visible on medium devices, desktops (≥992px)'),
      "visible-sm-block": Drupal.t('Visible on small devices, tablets (≥768px)'),
      "visible-xs-block": Drupal.t('Visible on extra small devices, phones (<768px)'),
      "well": Drupal.t('Well'),
      "small": Drupal.t('Text small style'),
      "optgroup-glazed-shadows": Drupal.t('Drop Shadows'),
      "stpe-dropshadow stpe-dropshadow--curved-hz1 stpe-dropshadow--curved": Drupal.t('Curved Horiztonal Drop Shadow'),
      "stpe-dropshadow stpe-dropshadow--curved-hz2 stpe-dropshadow--curved": Drupal.t('Curved Horizontal Double Drop Shadow'),
      "stpe-dropshadow stpe-dropshadow--curved-vt2 stpe-dropshadow--curved": Drupal.t('Curved vertical double shadow'),
      "stpe-dropshadow stpe-dropshadow--lifted": Drupal.t('Lifted Drop Shadow'),
      "stpe-dropshadow stpe-dropshadow--perspective": Drupal.t('Perspective Drop Shadow'),
      "stpe-dropshadow stpe-dropshadow--raised": Drupal.t('Raised Drop Shadow'),
    },classes),

    elements: {},
    tags: {},
    max_nested_depth: 3,
    name: '',
    category: '',
    description: '',
    params: [
      make_param_type({
        type: 'textfield',
        heading: Drupal.t('Utility classes'),
        param_name: 'el_class',
        description: Drupal.t('Add classes for Bootstrap effects or Glazed theme colors and utilities.')
      }),
      make_param_type({
        type: 'style',
        heading: Drupal.t('Style'),
        param_name: 'style',
        description: Drupal.t('Style options.'),
        tab: Drupal.t('Style')
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Drop shadow'),
        param_name: 'shadow',
        max: '5',
        value: '0',
        tab: Drupal.t('Style')
      }),
      make_param_type({
        type: 'style',
        heading: Drupal.t('Hover style'),
        param_name: 'hover_style',
        important: true,
        description: Drupal.t('Hover style options.'),
        tab: Drupal.t('Hover style')
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Drop shadow'),
        param_name: 'hover_shadow',
        max: '5',
        value: '0',
        tab: Drupal.t('Hover style')
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Left'),
        param_name: 'pos_left',
        tab: Drupal.t('Placement'),
        max: '1',
        step: '0.01',
        hidden: true,
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Right'),
        param_name: 'pos_right',
        tab: Drupal.t('Placement'),
        max: '1',
        step: '0.01',
        hidden: true,
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Top'),
        param_name: 'pos_top',
        tab: Drupal.t('Placement'),
        max: '1',
        step: '0.01',
        hidden: true,
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Bottom'),
        param_name: 'pos_bottom',
        tab: Drupal.t('Placement'),
        max: '1',
        step: '0.01',
        hidden: true,
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Width'),
        param_name: 'pos_width',
        tab: Drupal.t('Placement'),
        max: '1',
        step: '0.01',
        hidden: true,
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Height'),
        param_name: 'pos_height',
        tab: Drupal.t('Placement'),
        max: '1',
        step: '0.01',
        hidden: true,
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Z-index'),
        param_name: 'pos_zindex',
        tab: Drupal.t('Placement'),
        hidden: true,
      }),
    ],
    icon: '',
    thumbnail: '',
    is_container: false,
    has_content: false,
    frontend_render: false,
    show_settings_on_create: false,
    wrapper_class: '',
    weight: 0,
    hidden: false,
    disallowed_elements: [],
    controls_base_position: 'center',
    show_parent_controls: false,
    highlighted: true,
    style_selector: '',
    section: false,
    controls_position: function(wholePage) {
      // Hit Detection
      if (this.dom_element) {
        var elRect = this.dom_element[0].getBoundingClientRect();
        if (wholePage || (elRect.bottom > 0) && (elRect.top < document.documentElement.clientHeight)) {
          var controlsRect = this.controls[0].getBoundingClientRect();
          if ((this.children.length > 0)
              && (_.has(this.children[0].controls, '0'))
              && !(this.children[0].show_parent_controls)) {
            var childControlsRect = this.children[0].controls[0].getBoundingClientRect();
            if (glazedBuilderHit(childControlsRect, controlsRect)) {
              this.children[0].dom_element.addClass('az-element--controls-spacer');
            }
          }
          else if ((_.has(this, 'parent'))
              && (_.has(this.parent.controls, '0'))
              && !(this.show_parent_controls)) {
            var parentControlsRect = this.parent.controls[0].getBoundingClientRect();
            if (glazedBuilderHit(parentControlsRect, controlsRect)) {
              $(this.dom_element).addClass('az-element--controls-spacer');
            }
            if (this.parent.show_parent_controls) {
              var parentL2ControlsRect = this.parent.parent.controls[0].getBoundingClientRect();
              if (glazedBuilderHit(parentL2ControlsRect, controlsRect)) {
                $(this.dom_element).addClass('az-element--controls-spacer');
              }
            }
          }
          // We only consider elements within 300px to be able to collide with the navbar
          // Scrolltop still needs jQuery for cross browser support (chrome/firefox)
          if ((elRect.top + $(window).scrollTop()) < 300) {
            if ($('body.body--glazed-header-navbar_pull_down #navbar').length > 0) {
              var headerRect = $('#navbar .container-col')[0].getBoundingClientRect();
              if (glazedBuilderHit(headerRect, controlsRect)) {
                $(this.dom_element).closest('.glazed-editor').css('margin-top', headerRect.height / 2);
              }
            }
            if ($('body.body--glazed-header-overlay #navbar').length > 0) {
              var headerRect = $('#navbar')[0].getBoundingClientRect();
              if (glazedBuilderHit(headerRect, controlsRect)) {
                this.controls.css('margin-top', headerRect.height + 32);
              }
            }
            if ($('#navbar.glazed-header--fixed').length > 0) {
              var headerRect = $('#navbar')[0].getBoundingClientRect();
              if (glazedBuilderHit(headerRect, controlsRect)) {
                this.controls.css('margin-top', headerRect.height + 32);
              }
            }
          }
          // Scroll controls of tall elements
          if (!this.is_container || this.has_content) {
            var element_height = $(this.dom_element).height();
            var frame_height = $(window).height();
            if (element_height > frame_height) {
              var window_top = $(window).scrollTop();
              var control_top = this.controls.offset().top;
              var element_position_top = $(this.dom_element).offset().top;
              var new_position = (window_top - element_position_top) + frame_height / 2;
              if (new_position > 40 && new_position < element_height) {
                this.controls.css('top', new_position);
              }
              else if (new_position > element_height) {
                this.controls.css('top', element_height - 40);

              }
              else {
                this.controls.css('top', 40);
              }
            }
          }
        }
      }
    },
    update_controls_zindex: function() {
      set_highest_zindex(this.controls);
    },
    show_controls: function() {
      if (window.glazed_editor) {
        var element = this;
        this.controls = $('<div class="controls btn-group btn-group-xs"></div>').prependTo(this
          .dom_element);
        $(this.dom_element).addClass('az-element--controls-' + this.controls_base_position);
        setTimeout(function() {
          element.update_controls_zindex();
        }, 1000);

        $('<span title="' + title("Drag and drop") + '" class="control drag-and-drop btn btn-default glyphicon glyphicon-move"><span class="control-label">' + this.name + '</span></span>').appendTo(this.controls);

        if (this.is_container && !this.has_content) {
          $('<span title="' + title("Add") + '" class="control add btn btn-default glyphicon glyphicon-plus"> </span>').appendTo(this.controls).click({
            object: this
          }, this.click_add);
          $('<span title="' + title("Paste") + '" class="control paste btn btn-default glyphicon glyphicon-hand-down"> </span>').appendTo(this.controls).click({
            object: this
          }, this.click_paste);
        }

        $('<span title="' + title("Edit") + '" class="control edit btn btn-default glyphicon glyphicon-pencil"> </span>').appendTo(this.controls).click({
          object: this
        }, this.click_edit);
        $('<span title="' + title("Copy") + '" class="control copy btn btn-default glyphicon glyphicon-briefcase"> </span>').appendTo(this.controls).click({
          object: this
        }, this.click_copy);
        $('<span title="' + title("Clone") + '" class="control clone btn btn-default glyphicon glyphicon-duplicate"> </span>').appendTo(this.controls).click({
          object: this
        }, this.click_clone);
        $('<span title="' + title("Remove") + '" class="control remove btn btn-default glyphicon glyphicon-trash"> </span>').appendTo(this.controls).click({
          object: this
        }, this.click_remove);
        if (window.glazed_online)
          $('<span title="' + title('Save as template') + '" class="control save-template btn btn-default glyphicon glyphicon-floppy-save"> </span>').appendTo(
            this.controls).click({
            object: this
          }, this.click_save_template);
        this.update_empty();

        var inlineControlsParent = ((element.children.length > 0) && (element.children[0].show_parent_controls));
        if (!inlineControlsParent) {
          $(element.dom_element).hover(
            function() {
              element.controls.addClass('controls--show');
            }, function() {
              element.controls.removeClass('controls--show');
            }
          );
        }

        // This has lower priority than page rendering so we try to avoid doing this at the same time
        setTimeout(function() {
          element.controls_position(true);
        }, 1500);
        $(window).scroll(_.debounce(function() {
          if (window.pageYOffset > 30) {
            element.controls_position(false);
          }
        }, 500));
        $(window).resize(_.debounce(function() {
          element.controls_position(true);
        }, 500));

        if (element.show_parent_controls) {
            var parent = element.parent;
            if (_.isString(element.show_parent_controls)) {
              parent = glazed_elements.get_element($(element.dom_element).closest(element.show_parent_controls)
                .attr('data-az-id'));
            }
            function update_controls(element) {
              element.controls_position(true)
              $(parent.controls).attr('data-az-cid', $(element.dom_element).attr('data-az-id'));
              var offset = $(element.dom_element).offset();
              offset.top = offset.top - parseInt($(element.dom_element).css('margin-top')) + parseInt($(parent.controls).css('margin-top'));
              $(parent.controls).offset(offset);
              offset.left = offset.left + $(parent.controls).width() - 1;
              element.controls.offset(offset);
            }
            // Simultaneous show/hide of child and parent controls on child element hover
            $(element.dom_element).off('mouseenter').on('mouseenter', function() {
              $(element.dom_element).data('hover', true);
              if ($(element.dom_element).parents('.glazed-editor').length > 0) {
                $(parent.controls).addClass('controls--show');
                element.controls.addClass('controls--show');
                update_controls(element);
              }
            });
            $(element.dom_element).off('mouseleave').on('mouseleave', function() {
              $(element.dom_element).data('hover', false);
              if ($(element.dom_element).parents('.glazed-editor').length > 0) {
                $(parent.controls).removeClass('controls--show');
                element.controls.removeClass('controls--show');
              }
            });
            // Showing/Hiding when mousing over parent element controls that are outside the element itself
            setTimeout(function() {
              $(parent.controls).off('mouseenter').on('mouseenter', function() {
                $(parent.controls).data('hover', true);
                var column = glazed_elements.get_element($(this).closest('[data-az-cid]').attr('data-az-cid'));
                if (!_.isUndefined(column))
                  $(column.controls).addClass('controls--show');
              });
              $(parent.controls).off('mouseleave').on('mouseleave', function() {
                $(parent.controls).data('hover', false);
                var column = glazed_elements.get_element($(this).closest('[data-az-cid]').attr('data-az-cid'));
                if (!_.isUndefined(column))
                  $(column.controls).removeClass('controls--show');
              });
            }, 100);
        }
      }
    },
    get_empty: function() {
      return '<div class="az-empty"></div>';
    },
    update_empty: function() {
      if (window.glazed_editor) {
        if ((this.children.length == 0 && this.is_container && !this.has_content) || (this.has_content && this.attrs[
            'content'] == '')) {
          $(this.dom_content_element).find('> .az-empty').remove();
          var empty = $(this.get_empty()).appendTo(this.dom_content_element);
          var pos = '';
          if ($(empty).find('.bottom').length == 0)
            pos = 'bottom';
          if ($(empty).find('.top').length == 0)
            pos = 'top';
          $(empty).click(function(e) {
            if (e.which == 1) {
              var id = $(this).closest('[data-az-id]').attr('data-az-id');
              glazed_elements.show(glazed_elements.get_element(id), function(element) {});
            }
          });
        }
        else {
          $(this.dom_content_element).find('> .az-empty').remove();
        }
      }
    },
    get_button: function() {
      if (this.thumbnail == '') {
        return '<div class="well text-center pull-left text-overflow" data-az-element="' + this.base + '"><i class="' + this.icon +
          '"></i><div>' + this.name + '</div><div class="text-muted small">' +
          this.description + '</div></div>';
      }
      else {
        return '<div class="well pull-left" data-az-element="' + this.base +
          '" style="background-image: url(' + encodeURI(this.thumbnail) +
          '); background-position: center center; background-size: cover;"></div>';
      }
    },
    click_add: function(e) {
      e.data.object.add();
      return false;
    },
    add: function() {
      glazed_elements.show(this, function(element) {});
    },
    update_sortable: function() {
      if (window.glazed_editor) {
        if (this.is_container && !this.has_content || (this instanceof UnknownElement)) {
          $(this.dom_content_element).sortable({
            items: '> .az-element',
            connectWith: '.az-ctnr',
            handle: '> .controls > .drag-and-drop',
            update: this.update_sorting,
            placeholder: 'az-sortable-placeholder',
            forcePlaceholderSize: true,
            //            tolerance: "pointer",
            //            distance: 1,
            over: function(event, ui) {
              ui.placeholder.attr('class', ui.helper.attr('class'));
              ui.placeholder.removeClass('ui-sortable-helper');
              ui.placeholder.addClass('az-sortable-placeholder');
              //$(this).closest('[data-az-id]')
            }
          });
        }
      }
    },
    replace_render: function() {
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
    },
    update_dom: function() {
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
    },
    get_el_classes: function() {
      var classes = this.attrs['el_class'];
      if (this.attrs['shadow'] > 0) {
        classes = classes + ' ' + 'glazed-shadow-' + this.attrs['shadow'];
      }
      if (this.attrs['hover_shadow'] > 0) {
        classes = classes + ' ' + 'glazed-shadow-hover-' + this.attrs['hover_shadow'];
      }
      return classes;
    },
    get_hover_style: function() {
      if ('hover_style' in this.attrs)
        return '<style><!-- .hover-style-' + this.id + ':hover ' + this.style_selector +
          ' { ' + this.attrs['hover_style'] + '} --></style>';
      else
        return '';
    },
    restore: function(dom) {},
    recursive_restore: function(dom) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].recursive_restore(dom);
      }
      this.restore(dom);
    },
    showed: function($) {
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
    },
    render: function($) {
      $(this.dom_element).attr('data-az-id', this.id);
    },
    trigger_start_in_animation: function() {
      for (var i = 0; i < this.children.length; i++) {
        if ('trigger_start_in_animation' in this.children[i]) {
          this.children[i].trigger_start_in_animation();
        }
      }
    },
    trigger_start_out_animation: function() {
      for (var i = 0; i < this.children.length; i++) {
        if ('trigger_start_out_animation' in this.children[i]) {
          this.children[i].trigger_start_out_animation();
        }
      }
    },
    update_data: function() {
      $(this.dom_element).attr('data-azb', this.base);
      for (var i = 0; i < this.params.length; i++) {
        var param = this.params[i];
        if (param.param_name in this.attrs) {
          var value = this.attrs[param.param_name];
          if ((value == '' && param.can_be_empty || value != '') && (param.param_name !== 'content') && (value !==
              param.value)) {
            //if (param.param_name !== 'content') {
            if (!param.safe) {
              value = encodeURIComponent(value);
            }
            $(this.dom_element).attr('data-azat-' + param.param_name, value);
          }
        }
      }

      if (this.dom_content_element != null) {
        $(this.dom_content_element).attr('data-azcnt', 'true');
      }
    },
    recursive_update_data: function() {
      this.update_data();
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].recursive_update_data();
      }
    },
    recursive_clear_animation: function() {
      if ('clear_animation' in this)
        this.clear_animation();
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].recursive_clear_animation();
      }
    },
    recursive_showed: function() {
      this.showed($);
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].recursive_showed();
      }
    },
    update_sorting_children: function() {
      var options = $(this.dom_content_element).sortable('option');
      var children = [];
      $(this.dom_content_element).find(options.items).each(function() {
        children.push(glazed_elements.get_element($(this).attr('data-az-id')));
      });
      this.children = children;
      for (var i = 0; i < this.children.length; i++)
        this.children[i].parent = this;
      this.update_empty();
    },
    update_sorting: function(event, ui) {
      var element = glazed_elements.get_element($(ui.item).closest('[data-az-id]').attr('data-az-id'));
      if (element) {
        ui.source = glazed_elements.get_element($(this).closest('[data-az-id]').attr('data-az-id'));
        ui.from_pos = element.get_child_position();
        ui.source.update_sorting_children();
        ui.target = glazed_elements.get_element($(ui.item).parent().closest('[data-az-id]').attr('data-az-id'));
        if (ui.source.id != ui.target.id)
          ui.target.update_sorting_children();
        ui.to_pos = element.get_child_position();
        $(document).trigger("glazed_update_sorting", ui);
      }
    },
    click_edit: function(e) {
      // Update object content.
      updateEventData(e);

      e.data.object.edit();
      return false;
    },
    edit: function() {
      BaseParamType.prototype.show_editor(this.params, this, this.edited);
    },
    edited: function(attrs) {
      //this.attrs = attrs;
      for (var name in attrs) {
        this.attrs[name] = unescapeParam(attrs[name]);
      }
      this.update_dom();
      $(document).trigger("glazed_edited_element", this.id);
    },
    attrs2string: function() {
      var attrs = '';
      for (var i = 0; i < this.params.length; i++) {
        var param = this.params[i];
        if (param.param_name in this.attrs) {
          var value = this.attrs[param.param_name];
          if ((value == '' && param.can_be_empty || value != '') && (param.param_name !== 'content') && (value !==
              param.value)) {
            //if (param.param_name !== 'content') {
            if (!param.safe) {
              value = encodeURIComponent(value);
            }
            attrs += param.param_name + '="' + value + '" ';
          }
        }
      }
      return attrs;
    },
    get_content: function() {
      for (var i = 0; i < this.params.length; i++) {
        var param = this.params[i];
        if (param.param_name === 'content') {
          if (param.type == "html") {
            return encodeURIComponent(this.attrs['content']);
          }
        }
      }
      return this.attrs['content'];
    },
    set_content: function(content) {
      var value = unescapeParam(content);
      for (var i = 0; i < this.params.length; i++) {
        var param = this.params[i];
        if (param.param_name === 'content') {
          if (param.type == "html") {
            // Support lingering legacy content: try with base64 decoding first
            try {
              value = decodeURIComponent(atob(value.replace(/^#E\-8_/, '')));
            } catch (e) {
              value = decodeURIComponent(value.replace(/^#E\-8_/, ''));
            }
            this.attrs['content'] = value;
            return;
          }
        }
      }
      this.attrs['content'] = value;
    },
    parse_attrs: function(attrs) {
      for (var i = 0; i < this.params.length; i++) {
        var param = this.params[i];
        if (param.param_name in attrs) {
          if (!param.safe) {
            var value = unescapeParam(attrs[param.param_name]);
            // Support lingering legacy content: try with base64 decoding first
            try {
              this.attrs[param.param_name] = decodeURIComponent(atob(value.replace(/^#E\-8_/, '')));
            } catch (e) {
              this.attrs[param.param_name] = decodeURIComponent(value.replace(/^#E\-8_/, ''));
            }
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
    },
    get_nested_depth: function(base) {
      var depth = 0;
      if (this.parent != null) {
        depth += this.parent.get_nested_depth(base);
      }
      if (this.base == base) {
        depth++;
      }
      return depth;
    },
    get_my_shortcode: function() {
      var tags = _.keys(BaseElement.prototype.elements);
      var nested_counter = _.object(tags, Array.apply(null, new Array(tags.length)).map(Number.prototype.valueOf,
        0));
      var shortcode = this.get_shortcode(nested_counter);
      return shortcode;
    },
    get_children_shortcode: function() {
      var tags = _.keys(BaseElement.prototype.elements);
      var nested_counter = _.object(tags, Array.apply(null, new Array(tags.length)).map(Number.prototype.valueOf,
        0));
      var shortcode = '';
      for (var i = 0; i < this.children.length; i++) {
        shortcode += this.children[i].get_shortcode(nested_counter);
      }
      return shortcode;
    },
    get_shortcode: function(nested_counter) {
      nested_counter[this.base]++;
      var contain_shortcode = '';
      for (var i = 0; i < this.children.length; i++) {
        contain_shortcode += this.children[i].get_shortcode(nested_counter);
      }
      if (this.base == 'az_unknown') {
        shortcode = contain_shortcode;
      }
      else {
        var base = '';
        if (nested_counter[this.base] == 1) {
          base = this.base;
        }
        else {
          var c = nested_counter[this.base] - 1;
          base = this.base + '_' + c;
        }

        var attrs = this.attrs2string();
        var shortcode = '[' + base + ' ' + attrs + ']';
        if (this.is_container) {
          if (this.has_content) {
            shortcode += this.get_content() + '[/' + base + ']';
          }
          else {
            shortcode += contain_shortcode + '[/' + base + ']';
          }
        }
      }
      nested_counter[this.base]--;
      return shortcode;
    },
    parse_shortcode: function(content) {
      var tags = _.keys(BaseElement.prototype.tags).join('|'),
        reg = glazed.shortcode.regexp(tags),
        matches = $.trim(content).match(reg);
      if (_.isNull(matches)) {
        if (content.length == 0) {
          return;
        }
        else {
          if (content.substring(0, 1) == '[' && content.slice(-1) == ']')
            this.parse_shortcode('[az_unknown]' + content + '[/az_unknown]');
          else
            this.parse_shortcode('[az_row][az_column width="1/1"][az_text]' + content +
              '[/az_text][/az_column][/az_row]');
        }
      }
      _.each(matches, function(raw) {
        var sub_matches = raw.match(glazed_regexp(tags));
        var sub_content = sub_matches[5];
        var sub_regexp = new RegExp('^[\\s]*\\[\\[?(' + _.keys(BaseElement.prototype.tags).join('|') +
          ')(?![\\w-])');
        var atts_raw = glazed.shortcode.attrs(sub_matches[3]);
        var shortcode = sub_matches[2];

        if (this.get_nested_depth(shortcode) > BaseElement.prototype.max_nested_depth)
          return;

        var constructor = UnknownElement;
        if (shortcode in BaseElement.prototype.tags) {
          constructor = BaseElement.prototype.tags[shortcode];
        }
        if (this instanceof ContainerElement && this.parent == null && !constructor.prototype.section) {
          this.parse_shortcode('[az_section]' + content + '[/az_section]');
          return;
        }
        var element = new constructor(this, true);
        element.parse_attrs(atts_raw.named);

        var settings = BaseElement.prototype.tags[shortcode].prototype;

        if (_.isString(sub_content) && sub_content.match(sub_regexp) && (settings.is_container === true)) {
          element.parse_shortcode(sub_content);
        }
        else if (_.isString(sub_content) && sub_content.length && shortcode === 'az_row') {
          element.parse_shortcode('[az_column width="1/1"][az_text]' + sub_content + '[/az_text][/az_column]');
        }
        else if (_.isString(sub_content) && sub_content.length && shortcode === 'az_column' && !(sub_content.substring(
            0, 1) == '[' && sub_content.slice(-1) == ']')) {
          element.parse_shortcode('[az_text]' + sub_content + '[/az_text]');
        }
        else if (_.isString(sub_content)) {
          if (settings.has_content === true) {
            element.set_content(sub_content);
          }
          else {
            if (sub_content != '')
              element.parse_shortcode('[az_unknown]' + sub_content + '[/az_unknown]');
          }
        }
      }, this);
    },
    parse_html: function(dom_element) {
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
    },
    recursive_render: function() {
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
    },
    detach_children: function() {
      for (var i = 0; i < this.children.length; i++) {
        $(this.children[i].dom_element).detach();
      }
    },
    attach_children: function() {
      for (var i = 0; i < this.children.length; i++) {
        $(this.dom_content_element).append(this.children[i].dom_element);
      }
    },
    click_copy: function(e) {
      e.data.object.copy();
      return false;
    },
    copy: function() {
      var shortcode = this.get_my_shortcode();
      $('#glazed-clipboard').html(encodeURIComponent(shortcode));
    },
    click_paste: function(e) {
      e.data.object.paste(0);
      return false;
    },
    paste: function(start) {
      var shortcode = decodeURIComponent($('#glazed-clipboard').html());
      if (shortcode != '') {
        var length = this.children.length;
        BaseElement.prototype.parse_shortcode.call(this, shortcode);

        var new_children = [];
        for (var i = length; i < this.children.length; i++) {
          this.children[i].recursive_render();
          new_children.push(this.children[i]);
        }
        this.children = this.children.slice(0, length);

        this.children.splice.apply(this.children, [start, 0].concat(new_children));

        this.detach_children();
        this.attach_children();
        this.update_empty();
        this.update_sortable();
        this.recursive_showed();
      }
    },
    click_save_template: function(e) {
      e.data.object.save_template();
      return false;
    },
    save_template: function() {
      var shortcode = this.get_my_shortcode();
      var name = window.prompt(Drupal.t('Enter template name'), '');
      if (name != '' && name != null)
        glazed_save_template(name, shortcode);
    },
    click_clone: function(e) {
      // Update object content.
      updateEventData(e);

      e.data.object.clone();
      return false;
    },
    clone: function() {
      this.copy();
      for (var i = 0; i < this.parent.children.length; i++) {
        if (this.parent.children[i].id == this.id) {
          this.parent.paste(i);
          break;
        }
      }

      // Added inline ckeditor.
      $(window).trigger('CKinlineAttach');
    },
    click_remove: function(e) {
      e.data.object.remove();
      return false;
    },
    remove: function() {
      glazed_elements.delete_element(this.id);
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].remove();
      }
      $(this.dom_element).remove();
      for (var i = 0; i < this.parent.children.length; i++) {
        if (this.parent.children[i].id == this.id) {
          this.parent.children.splice(i, 1);
          break;
        }
      }
      this.parent.update_empty();
    },
    get_child_position: function() {
      for (var i = 0; i < this.parent.children.length; i++) {
        if (this.parent.children[i].id == this.id) {
          return i;
          break;
        }
      }
      return -1;
    },
    add_css: function(path, loaded, callback) {
      var container = this.get_my_container();
      container.css[window.glazed_baseurl + path] = true;
      if (!loaded) {
        window.glazed_add_css(path, callback);
      }
    },
    add_js_list: function(options) {
      var container = this.get_my_container();
      for (var i = 0; i < options.paths.length; i++) {
        container.js[window.glazed_baseurl + options.paths[i]] = true;
      }
      window.glazed_add_js_list(options);
    },
    add_js: function(options) {
      var container = this.get_my_container();
      container.js[window.glazed_baseurl + options.path] = true;
      window.glazed_add_js(options);
    },
    add_external_js: function(url, callback) {
      var container = this.get_my_container();
      container.js[url] = true;
      window.glazed_add_external_js(url, callback);
    },
    get_my_container: function() {
      if (this instanceof ContainerElement) {
        return this;
      }
      else {
        return this.parent.get_my_container();
      }
    },
    get_all_disallowed_elements: function() {
      if ('parent' in this) {
        var disallowed_elements = _.uniq(this.parent.get_all_disallowed_elements().concat(this.disallowed_elements));
        return disallowed_elements;
      }
      else {
        return this.disallowed_elements;
      }
    }
  };

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

// Accepts 2 getBoundingClientRect objects
  function glazedBuilderHit(rect1, rect2) {
    return !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom);
  }


  function AnimatedElement(parent, position) {
    AnimatedElement.baseclass.apply(this, arguments);
  }
  extend(AnimatedElement, BaseElement);
  mixin(AnimatedElement.prototype, {
    params: [
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Animation start'),
        param_name: 'an_start',
        tab: Drupal.t('Animation'),
        value: {
          '': Drupal.t('No animation'),
          'appear': Drupal.t('On appear'),
          'hover': Drupal.t('On hover'),
          'click': Drupal.t('On click'),
          'trigger': Drupal.t('On trigger'),
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Animation in'),
        param_name: 'an_in',
        tab: Drupal.t('Animation'),
        value: glazed_animations,
        dependency: {
          'element': 'an_start',
          'value': ['appear', 'hover', 'click', 'trigger']
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Animation out'),
        param_name: 'an_out',
        tab: Drupal.t('Animation'),
        value: glazed_animations,
        dependency: {
          'element': 'an_start',
          'value': ['hover', 'trigger']
        },
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Hidden'),
        param_name: 'an_hidden',
        tab: Drupal.t('Animation'),
        value: {
          'before_in': Drupal.t("Before in-animation"),
          'after_in': Drupal.t("After in-animation"),
        },
        dependency: {
          'element': 'an_start',
          'value': ['appear', 'hover', 'click', 'trigger']
        },
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Infinite'),
        param_name: 'an_infinite',
        tab: Drupal.t('Animation'),
        value: {
          'yes': Drupal.t("Yes"),
        },
        dependency: {
          'element': 'an_start',
          'value': ['appear', 'hover', 'click', 'trigger']
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Appear Boundary'),
        param_name: 'an_offset',
        tab: Drupal.t('Animation'),
        max: '100',
        description: Drupal.t('In percent. (50% is center, 100% is bottom of screen)'),
        value: '100',
        dependency: {
          'element': 'an_start',
          'value': ['appear']
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Duration'),
        param_name: 'an_duration',
        tab: Drupal.t('Animation'),
        max: '3000',
        description: Drupal.t('In milliseconds.'),
        value: '1000',
        step: '50',
        dependency: {
          'element': 'an_start',
          'value': ['appear', 'hover', 'click', 'trigger']
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('In-delay'),
        param_name: 'an_in_delay',
        tab: Drupal.t('Animation'),
        max: '10000',
        description: Drupal.t('In milliseconds.'),
        value: '0',
        dependency: {
          'element': 'an_start',
          'value': ['appear', 'hover', 'click', 'trigger']
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Out-delay'),
        param_name: 'an_out_delay',
        tab: Drupal.t('Animation'),
        max: '10000',
        description: Drupal.t('In milliseconds.'),
        value: '0',
        dependency: {
          'element': 'an_start',
          'value': ['hover', 'trigger']
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Parent number'),
        param_name: 'an_parent',
        tab: Drupal.t('Animation'),
        max: '10',
        min: '0',
        description: Drupal.t(
          'Define the number of Parent Containers the animation should attempt to break away from.'),
        value: '1',
        dependency: {
          'element': 'an_start',
          'value': ['hover', 'click']
        },
      }),
      make_param_type({
        type: 'textfield',
        heading: Drupal.t('Name for animations'),
        param_name: 'an_name',
        hidden: true,
      }),
    ].concat(AnimatedElement.prototype.params),
    set_in_timeout: function() {
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
    },
    start_in_animation: function() {
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
    },
    set_out_timeout: function() {
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
    },
    start_out_animation: function() {
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
    },
    clear_animation: function() {
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
    },
    end_animation: function() {
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
    },
    trigger_start_in_animation: function() {
      if (this.attrs['an_start'] == 'trigger') {
        this.start_in_animation();
      }
      else {
        AnimatedElement.baseclass.prototype.trigger_start_in_animation.apply(this, arguments);
      }
    },
    trigger_start_out_animation: function() {
      if (this.attrs['an_start'] == 'trigger') {
        this.start_out_animation();
      }
      else {
        AnimatedElement.baseclass.prototype.trigger_start_out_animation.apply(this, arguments);
      }
    },
    animation: function() {
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
    },
    update_scroll_animation: function() {
      // Function here for legacy support
      return false;
    },
    showed: function($) {
      AnimatedElement.baseclass.prototype.showed.apply(this, arguments);
      this.an_name = '';
      if ('an_name' in this.attrs && this.attrs['an_name'] != '') {
        this.an_name = this.attrs['an_name'];
        glazed_elements.elements_instances_by_an_name[this.an_name] = this;
      }
      if ('an_start' in this.attrs && this.attrs['an_start'] != '' && this.attrs['an_start'] != 'no') {
        this.animation();
      }
    },
    render: function($) {
      if ('an_name' in this.attrs && this.attrs['an_name'] != '') {
        $(this.dom_element).attr('data-an-name', this.attrs['an_name']);
      }
      AnimatedElement.baseclass.prototype.render.apply(this, arguments);
    }
  });

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

  glazed_elements = new glazedElements();

  function toggle_editor_controls() {
    if (window.glazed_editor) {
      glazed_add_css('vendor/font-awesome/css/font-awesome.min.css', function() {});
      if ($('#glazed-clipboard').length == 0) {
        $('body').prepend('<div id="glazed-clipboard" style="display:none"></div>');
      }
      glazed_add_js({
        path: 'vendor/chosen/chosen.jquery.min.js'
      });
      glazed_add_css('vendor/chosen/chosen.min.css', function() {});
      for (var id in glazed_elements.elements_instances) {
        var el = glazed_elements.elements_instances[id];
        if (el instanceof ContainerElement) {
          $(el.dom_element).addClass('glazed-editor');
        }
        if (el.controls == null) {
          el.show_controls();
        }
        el.update_sortable();
      }
      $('#az-exporter').show();
    }
    else {
      for (var id in glazed_elements.elements_instances) {
        var el = glazed_elements.elements_instances[id];
        if (el instanceof ContainerElement) {
          $(el.dom_element).removeClass('glazed-editor');
        }
        if (el.controls != null) {
          $(el.controls).remove();
        }
        el.update_empty();
      }
      $('#az-exporter').hide();
    }
  }

  function try_login() {
    if (!('glazed_ajaxurl' in window))
      if (!window.glazed_editor || window.glazed_online)
        delete window.glazed_editor;
    glazed_login(function(data) {
      window.glazed_editor = data;
      $(function() {
        toggle_editor_controls();
      })
    });
  }
  try_login();

  function onReadyFirst(completed) {
    $.holdReady(true);
    if (document.readyState === "complete") {
      setTimeout(completed);
    }
    else if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", completed, false);
      window.addEventListener("load", completed, false);
    }
    else {
      document.attachEvent("onreadystatechange", completed);
      window.attachEvent("onload", completed);
    }
  }
  onReadyFirst(function() {
    glazed_load();
    $.holdReady(false);
  });

  function connect_container(dom_element) {
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
  var glazed_loaded = false;

  function glazed_load() {
    if (glazed_loaded)
      return;
    glazed_loaded = true;
     if (Drupal.settings.glazed_builder.hasOwnProperty('DisallowContainers'));
    var glazedDisallowContainer = Drupal.settings.glazed_builder.DisallowContainers;
    $('.az-container').each(function() {
      var containerId = $(this).attr('data-az-name')
      if ($.inArray(containerId, glazedDisallowContainer) == -1) {
        var container = connect_container(this);
        if (container)
          glazed_containers.push(container);
      }
    });
    if (window.glazed_editor) {
      if ($('#glazed-clipboard').length == 0) {
        $('body').prepend('<div id="glazed-clipboard" class="glazed-backend" style="display:none"></div>');
      }
    }
  }
  $.fn.glazed_builder = function(method) {
    var methods = {
      init: function(options) {
        var settings = $.extend({
          'test': 'test',
        }, options);
        return this.each(function() {
          var textarea = this;
          var container = $(this).data('glazed_builder');
          if (!container) {
            var dom = $('<div>' + $(textarea).val() + '</div>')[0];
            $(dom).find('> script').remove();
            $(dom).find('> link[href]').remove();
            $(dom).find('> .az-container > script').remove();
            $(dom).find('> .az-container > link[href]').remove();
            $(textarea).css('display', 'none');
            var container_dom = null;
            if ($(dom).find('> .az-container[data-az-type][data-az-name]').length > 0) {
              container_dom = $(dom).children().insertAfter(textarea);
            }
            else {
              var type = 'textarea';
              var name = Math.random().toString(36).substr(2);
              if (window.glazed_online) {
                type = window.glazed_type;
                name = window.glazed_name;
              }
              container_dom = $('<div class="az-element az-container" data-az-type="' + type +
                '" data-az-name="' + name + '"></div>').insertAfter(textarea);
              container_dom.append($(dom).html());
            }

            window.glazed_title['Save container'] = Drupal.t(
              'Generate HTML and JS for all elements which placed in current container element.');
            var container = connect_container(container_dom);
            if (container) {
              glazed_containers.push(container);
              $(textarea).data('glazed_builder', container);

              container.save_container = function() {
                glazed_add_js({
                  path: 'jsON-js/json2.min.js',
                  loaded: 'JSON' in window,
                  callback: function() {
                    _.defer(function() {
                      if (container.id in glazed_elements.elements_instances) {
                        var html = container.get_container_html();
                        if (window.glazed_online) {
                          $(textarea).val(html);
                        }
                        else {
                          var type = container.attrs['container'].split('/')[0];
                          var name = container.attrs['container'].split('/')[1];
                          $(textarea).val('<div class="az-element az-container" data-az-type="' +
                            type + '" data-az-name="' + name + '">' + html + '</div>');
                        }
                      }
                    });
                  }
                });
              };
              $(document).on("glazed_add_element", container.save_container);
              $(document).on("glazed_edited_element", container.save_container);
              $(document).on("glazed_update_element", container.save_container);
              $(document).on("glazed_delete_element", container.save_container);
              $(document).on("glazed_update_sorting", container.save_container);
            }
          }
        });
      },
      show: function() {
        this.each(function() {});
      },
      hide: function() {
        this.each(function() {
          var container = $(this).data('glazed_builder');
          if (container) {
            glazed_elements.delete_element(container.id);
            for (var i = 0; i < container.children.length; i++) {
              container.children[i].remove();
            }
            $(container.dom_element).remove();
            $(this).removeData('glazed_builder');

            $(this).css('display', '');
          }
        });
      },
    };
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    }
    else {
      $.error(method);
    }
  };

  function SectionElement(parent, position) {
    SectionElement.baseclass.apply(this, arguments);
  }
  register_animated_element('az_section', true, SectionElement);
  mixin(SectionElement.prototype, {
    name: Drupal.t('Section'),
    icon: 'et et-icon-focus',
    // description: Drupal.t('Bootstrap grid container'),
    category: Drupal.t('Layout'),
    params: [
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Full Width'),
        param_name: 'fluid',
        value: {
          'yes': Drupal.t("Yes"),
        },
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('100% Height'),
        param_name: 'fullheight',
        value: {
          'yes': Drupal.t("Yes"),
        },
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Vertical Centering'),
        param_name: 'vertical_centering',
        value: {
          'yes': Drupal.t('Yes')
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Background Effect'),
        param_name: 'effect',
        tab: Drupal.t('Background Effects'),
        value: {
          '': Drupal.t('Simple Image'),
          'fixed': Drupal.t('Fixed Image'),
          'parallax': Drupal.t('Parallax Image'),
          'gradient': Drupal.t('Gradient'),
          'youtube': Drupal.t('YouTube Video'),
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Parallax speed'),
        param_name: 'parallax_speed',
        tab: Drupal.t('Background Effects'),
        value: 20,
        dependency: {
          'element': 'effect',
          'value': ['parallax']
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Parallax Mode'),
        param_name: 'parallax_mode',
        tab: Drupal.t('Background Effects'),
        value: {
          'fixed': Drupal.t('Fixed'),
          'scroll': Drupal.t('Local'),
        },
        dependency: {
          'element': 'effect',
          'value': ['parallax']
        },
      }),
      make_param_type({
        type: 'colorpicker',
        heading: Drupal.t('Start Color'),
        param_name: 'gradient_start_color',
        tab: Drupal.t('Background Effects'),
        dependency: {
          'element': 'effect',
          'value': ['gradient']
        },
      }),
      make_param_type({
        type: 'colorpicker',
        heading: Drupal.t('End Color'),
        param_name: 'gradient_end_color',
        tab: Drupal.t('Background Effects'),
        dependency: {
          'element': 'effect',
          'value': ['gradient']
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Gradient Direction'),
        param_name: 'gradient_direction',
        tab: Drupal.t('Background Effects'),
        value: '180',
        min: '1',
        max: '360',
        dependency: {
          'element': 'effect',
          'value': ['gradient']
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Start Position'),
        param_name: 'gradient_start',
        tab: Drupal.t('Background Effects'),
        value: '0',
        dependency: {
          'element': 'effect',
          'value': ['gradient']
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('End Position'),
        param_name: 'gradient_end',
        tab: Drupal.t('Background Effects'),
        value: '100',
        dependency: {
          'element': 'effect',
          'value': ['gradient']
        },
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Video Play Options'),
        param_name: 'video_options',
        tab: Drupal.t('Background Effects'),
        description: Drupal.t('Select options for the video.'),
        value: {
          'loop': Drupal.t("Loop"),
          'mute': Drupal.t("Muted"),
        },
        dependency: {
          'element': 'effect',
          'value': ['youtube']
        },
      }),
      make_param_type({
        type: 'textfield',
        heading: Drupal.t('YouTube Video URL'),
        param_name: 'video_youtube',
        tab: Drupal.t('Background Effects'),
        description: Drupal.t('Enter the YouTube video URL.'),
        dependency: {
          'element': 'effect',
          'value': ['youtube']
        },
      }),
      make_param_type({
        type: 'textfield',
        heading: Drupal.t('Start Time in seconds'),
        param_name: 'video_start',
        tab: Drupal.t('Background Effects'),
        description: Drupal.t('Enter time in seconds from where video start to play.'),
        value: '0',
        dependency: {
          'element': 'effect',
          'value': ['youtube']
        },
      }),
      make_param_type({
        type: 'textfield',
        heading: Drupal.t('Stop Time in seconds'),
        param_name: 'video_stop',
        tab: Drupal.t('Background Effects'),
        description: Drupal.t('Enter time in seconds where video ends.'),
        value: '0',
        dependency: {
          'element': 'effect',
          'value': ['youtube']
        },
      }),
    ].concat(SectionElement.prototype.params),
    is_container: true,
    controls_base_position: 'top-left',
    section: true,
    //    disallowed_elements: ['az_section'], - section is useful for popup element which can be placed anywhere
    get_button: function() {
      return '<div class="well text-center text-overflow" data-az-element="' + this.base +
        '"><i class="' + this.icon + '"></i><div>' + this.name + '</div><div class="text-muted small">' + this.description + '</div></div>';
    },
    show_controls: function() {
      if (window.glazed_editor) {
        SectionElement.baseclass.prototype.show_controls.apply(this, arguments);
        if (this.parent instanceof ContainerElement) {
          var element = this;
          $('<div title="' + title("Add Section Below") + '" class="control add-section btn btn-default glyphicon glyphicon-plus-sign" > </div>').appendTo(this.dom_element)
            .click(function() {
              var constructor = BaseElement.prototype.elements['az_section'];
              var child = new constructor(element.parent, element.dom_element.index());
              child.update_dom();
              element.parent.update_empty();
            });
        }
      }
    },
    showed: function($) {
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
                offset: '100%',
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
                  "', showControls:false, autoPlay:true, stopMovieOnBlur:false, loop:" + loop.toString() + ", mute:" +
                  mute.toString() + ", startAt:" + element.attrs['video_start'] + ", stopAt:" +
                  element.attrs['video_stop'] + ", opacity:1, addRaster:false}");
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
    },

    render: function($) {
      this.dom_element = $('<div id="' + this.id + '" class="az-element az-section ' + this.get_el_classes() +
        ' " style="' + this.attrs['style'] + '"></div>');
      if (this.attrs['fullheight'] == 'yes')
        $(this.dom_element).css('height', '100vh');
      if (this.attrs['fluid'] == 'yes')
        this.dom_content_element = $('<div class="az-ctnr container-fluid"></div>').appendTo(this.dom_element);
      else
        this.dom_content_element = $('<div class="az-ctnr container"></div>').appendTo(this.dom_element);
      if (this.attrs['effect'] == 'gradient') {
        var background_css = null;
        var gradient_css = 'linear-gradient('
          + this.attrs['gradient_direction'] + 'deg, '
          + this.attrs['gradient_start_color'] + ' ' + this.attrs['gradient_start'] + '%, '
          + this.attrs['gradient_end_color'] + ' ' + this.attrs['gradient_end'] + '%)';
        if (background_css = $(this.dom_element).css('background-image'))
          $(this.dom_element).css('background-image', gradient_css + ',' + $(this.dom_element).css('background-image'));
        else
          $(this.dom_element).css('background-image', gradient_css);
      }
      if (this.attrs.vertical_centering && this.attrs.vertical_centering === 'yes') {
        $(this.dom_element).addClass('az-util-vertical-centering');
      }
      SectionElement.baseclass.prototype.render.apply(this, arguments);
    },
  });


  function RowElement(parent, position) {
    RowElement.baseclass.apply(this, arguments);
    this.columns = '';
    if (!position || typeof position !== 'boolean') {
      this.set_columns('1/2 + 1/2');
    }
    this.attrs['device'] = 'sm';
  }
  register_animated_element('az_row', true, RowElement);
  mixin(RowElement.prototype, {
    name: Drupal.t('Row'),
    icon: 'et et-icon-grid',
    // description: Drupal.t('Bootstap responsive row'),
    category: Drupal.t('Layout'),
    params: [
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Device breakpoint'),
        param_name: 'device',
        value: {
          xs: Drupal.t('Extra small devices Phones (<768px)'),
          sm: Drupal.t('Small devices Tablets (≥768px)'),
          md: Drupal.t('Medium devices Desktops (≥992px)'),
          lg: Drupal.t('Large devices Desktops (≥1200px)')
        },
        description: Drupal.t('Bootstrap responsive grid breakpoints')
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Equal Height Columns'),
        param_name: 'equal',
        value: {
          'yes': Drupal.t("Yes"),
        },
      }),
      ].concat(RowElement.prototype.params),
    is_container: true,
    controls_base_position: 'top-left',
    get_button: function() {
      return '<div class="well text-center text-overflow" data-az-element="' + this.base +
        '"><i class="' + this.icon + '"></i><div>' + this.name + '</div><div class="text-muted small">' + this.description + '</div></div>';
    },
    show_controls: function() {
      if (window.glazed_editor) {
        RowElement.baseclass.prototype.show_controls.apply(this, arguments);
        this.controls.find('.add').remove();
        this.controls.find('.paste').remove();
        var element = this;
        var controls = this.controls;
        var popoverContent = '<div class="row-layouts clearfix">';
        var layouts = [
          '1/1',
          '1/2 + 1/2',
          '1/3 + 1/3 + 1/3',
          '1/4 + 1/4 + 1/4 + 1/4',
          '1/6 + 1/6 + 1/6 + 1/6 + 1/6 + 1/6',
          '1/4 + 1/2 + 1/4',
          '1/6 + 4/6 + 1/6',
          '1/4 + 3/4',
          '3/4 + 1/4',
          '2/3 + 1/3',
          '1/3 + 2/3',
          '5/12 + 7/12',
        ];
        // Generate mini bootstrap grids http://codepen.io/jur/pen/PZbeaW
        var widths = '';
        for (var i = 0; i < layouts.length; i++) {
          popoverContent += '<div title="' + title('Set ' + layouts[i] + ' colums') + '" ' +
            '" data-az-columns="' + layouts[i] + '" ' +
            'class="az-mini-container control set-columns-layout"><div class="row">';
          widths = layouts[i].replace(' ', '').split('+');
          for (var j = 0; j < widths.length; j++) {
            popoverContent += '<div' + ' class="' + width2span(widths[j], 'xs') + '">' +
              '<div class="content"></div>' + '</div>';
          }
          popoverContent += '</div>';
          popoverContent += '</div>';
        }
        popoverContent +=
          '<small class="az-row-custom set-columns-layout"><a href="#" class="custom-row-control glazed-util-text-muted text-small">Custom layout</a></small>';
        popoverContent += '</div>';

        var columns = $('<span title="' + title("Set row layout") + '" class="control set-columns btn btn-default glyphicon glyphicon-th"> </span>')
          .insertAfter(this.controls.find('.drag-and-drop'))
          [fp + 'popover']({
            container: false,
            selector: false,
            placement:'right',
            html: 'true',
            trigger: 'manual',
            content: popoverContent,
          })
          .click(function() {
            $(columns)[fp + 'popover']('toggle') ;
            set_highest_zindex($(controls));
            set_highest_zindex($(controls).find('.popover'));
            $(controls).find('.popover .set-columns-layout').each(function() {
              $(this).click({
                object: element
              }, element.click_set_columns);
            });
            element.controls.find('.popover').mouseleave(function() {
              $(columns)[fp + 'popover']('hide');
              $(columns).css('display', '');
            });
          });
      }
    },
    update_sortable: function() {
      if (window.glazed_editor) {
        $(this.dom_element).sortable({
          axis: 'x',
          items: '> .az-column',
          handle: '> .controls > .drag-and-drop',
          update: this.update_sorting,
          placeholder: 'az-sortable-placeholder',
          forcePlaceholderSize: true,
          tolerance: "pointer",
          distance: 1,
          over: function(event, ui) {
            ui.placeholder.attr('class', ui.helper.attr('class'));
            ui.placeholder.removeClass('ui-sortable-helper');
            ui.placeholder.addClass('az-sortable-placeholder');
          },
        });
      }
    },
    update_sorting: function(event, ui) {
      RowElement.baseclass.prototype.update_sorting.apply(this, arguments);
      var element = glazed_elements.get_element($(this).closest('[data-az-id]').attr('data-az-id'));
      if (element) {
        for (var i = 0; i < element.children.length; i++) {
          element.children[i].update_empty();
        }
      }
    },
    update_dom: function() {
      RowElement.baseclass.prototype.update_dom.apply(this, arguments);
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].update_dom();
      }
    },
    click_set_columns: function(e) {
      var columns = $(this).attr('data-az-columns');
      if (columns == '' || columns == undefined) {
        if (e.data.object.columns == '') {
          columns = [];
          for (var i = 0; i < e.data.object.children.length; i++) {
            columns.push(e.data.object.children[i].attrs['width']);
          }
          e.data.object.columns = columns.join(' + ');
        }
        columns = window.prompt(Drupal.t('Enter bootstrap grid layout. For example 1/2 + 1/2.'), e.data.object.columns);
      }
      if (columns != '' && columns != null)
        e.data.object.set_columns(columns);
      return false;
    },
    set_columns: function(columns) {
      this.columns = columns;
      var widths = columns.replace(' ', '').split('+');
      if (this.children.length == 0) {
        for (var i = 0; i < widths.length; i++) {
          var child = new ColumnElement(this, true);
          child.update_dom();
          child.update_width(widths[i]);
        }
      }
      else {
        if (this.children.length == widths.length) {
          for (var i = 0; i < widths.length; i++) {
            this.children[i].update_width(widths[i]);
          }
        }
        else {
          if (this.children.length > widths.length) {
            var last_column = this.children[widths.length - 1];
            for (var i = 0; i < this.children.length; i++) {
              if (i < widths.length) {
                this.children[i].update_width(widths[i]);
              }
              else {
                var column = this.children[i];
                for (var j = 0; j < column.children.length; j++) {
                  column.children[j].parent = last_column;
                  last_column.children.push(column.children[j]);
                }
                column.children = [];
              }
            }
            last_column.update_dom();
            var removing_columns = this.children.slice(widths.length, this.children.length);
            for (var i = 0; i < removing_columns.length; i++) {
              removing_columns[i].remove();
            }
          }
          else {
            for (var i = 0; i < widths.length; i++) {
              if (i < this.children.length) {
                this.children[i].update_width(widths[i]);
              }
              else {
                var child = new ColumnElement(this, true);
                child.update_dom();
                child.update_width(widths[i]);
              }
            }
          }
        }
      }
      this.update_sortable();
    },
    showed: function($) {
      RowElement.baseclass.prototype.showed.apply(this, arguments);
    },
    render: function($) {
      this.dom_element = $('<div class="az-element az-row row ' + this.get_el_classes() + '" style="' +
        this.attrs['style'] + '"></div>');
      this.dom_content_element = this.dom_element;
      $(this.dom_element).addClass('az-row--' + this.attrs['device']);
      if (this.attrs['equal'] && this.attrs.equal === 'yes') {
        $(this.dom_element).addClass('az-row--equal-height');
      }
      RowElement.baseclass.prototype.render.apply(this, arguments);

    },
  });


  function ColumnElement(parent, position) {
    ColumnElement.baseclass.call(this, parent, position);
  }

  register_element('az_column', true, ColumnElement);
  mixin(ColumnElement.prototype, {
    name: Drupal.t('Column'),
    params: [
      make_param_type({
        type: 'textfield',
        heading: Drupal.t('Column with'),
        param_name: 'width',
        hidden: true,
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Vertical Centering'),
        param_name: 'vertical_centering',
        value: {
          'yes': Drupal.t('Yes')
        },
      })
    ].concat(ColumnElement.prototype.params),
    hidden: true,
    is_container: true,
    controls_base_position: 'top-left',
    show_parent_controls: true,
    //    disallowed_elements: ['az_section'], - section is useful for popup element which can be placed anywhere
    show_controls: function() {
      if (window.glazed_editor) {
        ColumnElement.baseclass.prototype.show_controls.apply(this, arguments);
        this.controls.find('.clone').remove();
        this.controls.find('.copy').remove();
        this.controls.find('.remove').remove();
      }
    },
    get_my_shortcode: function() {
      return this.get_children_shortcode();
    },
    update_width: function(width) {
      $(this.dom_element).removeClass(width2span(this.attrs['width'], this.parent.attrs['device']));
      this.attrs['width'] = width;
      $(this.dom_element).addClass(width2span(this.attrs['width'], this.parent.attrs['device']));
      $(document).trigger("glazed_update_element", this.id);
    },
    render: function($) {
      this.dom_element = $('<div class="az-element az-ctnr az-column ' + this.get_el_classes() + ' ' +
        width2span(this.attrs['width'], this.parent.attrs['device']) + '" style="' + this.attrs['style'] +
        '"></div>');
      this.dom_content_element = this.dom_element;
      if (this.attrs.vertical_centering && this.attrs.vertical_centering === 'yes') {
        $(this.dom_element).addClass('az-util-vertical-centering');
      }
      ColumnElement.baseclass.prototype.render.apply(this, arguments);
    },
  });


  function TabsElement(parent, position) {
    TabsElement.baseclass.apply(this, arguments);
    if (!position || typeof position !== 'boolean') {
      this.add_tab();
    }
  }
  register_animated_element('az_tabs', true, TabsElement);
  mixin(TabsElement.prototype, {
    name: Drupal.t('Tabs'),
    icon: 'pe pe-7s-folder',
    // description: Drupal.t('Bootstrap content tabs'),
    category: Drupal.t('Layout'),
    params: [
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Tab direction'),
        param_name: 'az_dirrection',
        value: {
          '': Drupal.t('Default'),
          'tabs-left': Drupal.t('Left'),
          'tabs-right': Drupal.t('Right'),
        },
      }),
    ].concat(TabsElement.prototype.params),
    is_container: true,
    controls_base_position: 'top-left',
    get_button: function() {
      return '<div class="well text-center text-overflow" data-az-element="' + this.base +
        '"><i class="' + this.icon + '"></i><div>' + this.name + '</div><div class="text-muted small">' + this.description + '</div></div>';
    },
    show_controls: function() {
      if (window.glazed_editor) {
        TabsElement.baseclass.prototype.show_controls.apply(this, arguments);
        this.controls.find('.add').remove();
        this.controls.find('.paste').remove();
        $('<span title="' + title("Add tab") + '" class="control add-tab btn btn-default ' +
         'glyphicon glyphicon-plus-sign" > </span>').appendTo(this.controls).click({
          object: this
        }, this.click_add_tab);
      }
    },
    update_sortable: function() {
      if (window.glazed_editor) {
        $(this.dom_element).sortable({
          axis: 'x',
          items: '> ul > li',
          update: this.update_sorting,
          placeholder: 'az-sortable-placeholder',
          forcePlaceholderSize: true,
          //          tolerance: "pointer",
          //          distance: 1,
          over: function(event, ui) {
            ui.placeholder.attr('class', ui.helper.attr('class'));
            ui.placeholder.removeClass('ui-sortable-helper');
            ui.placeholder.addClass('az-sortable-placeholder');
          }
        });
      }
    },
    update_sorting: function(event, ui) {
      var element = glazed_elements.get_element($(this).attr('data-az-id'));
      if (element) {
        var options = $(this).sortable('option');
        var children = [];
        $(this).find(options.items).each(function() {
          var id = $(this).find('a[data-toggle="tab"]').attr('href').replace('#', '');
          children.push(glazed_elements.get_element(id));
        });
        element.children = children;
        for (var i = 0; i < element.children.length; i++)
          element.children[i].parent = element;
        element.update_dom();
        $(document).trigger("glazed_update_sorting", ui);
      }
    },
    click_add_tab: function(e) {
      e.data.object.add_tab();
      return false;
    },
    add_tab: function() {
      var child = new TabElement(this, false);
      child.update_dom();
      this.update_dom();
      $(this.dom_element).find('a[href="#' + child.id + '"]')[fp + 'tab']('show');
    },
    showed: function($) {
      TabsElement.baseclass.prototype.showed.apply(this, arguments);
      $(this.dom_element).find('ul.nav-tabs li:first a')[fp + 'tab']('show');
    },
    render: function($) {
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
    },
  });

  function TabElement(parent, position) {
    TabElement.baseclass.apply(this, arguments);
  }
  register_element('az_tab', true, TabElement);
  mixin(TabElement.prototype, {
    name: Drupal.t('Tab'),
    params: [
      make_param_type({
        type: 'textfield',
        heading: Drupal.t('Tab title'),
        param_name: 'title',
        value: Drupal.t('Title')
      }),
    ].concat(TabElement.prototype.params),
    hidden: true,
    is_container: true,
    controls_base_position: 'top-left',
    // show_parent_controls: true,
    get_empty: function() {
      return '<div class="az-empty"><div class="top-left well"><h1>↖</h1>' + '<span class="glyphicon ' +
       'glyphicon-plus-sign"></span>' + Drupal.t(' add a new tab.') + ' ' + Drupal.t(
          'Drag tab headers to change order.') + '</div></div>';
    },
    show_controls: function() {
      if (window.glazed_editor) {
        TabElement.baseclass.prototype.show_controls.apply(this, arguments);
        this.controls.find('.drag-and-drop').remove();
        $('<span class="control btn btn-default glyphicon">' + this.name + '</span>')
          .prependTo(this.controls);
      }
    },
    get_my_shortcode: function() {
      return this.get_children_shortcode();
    },
    edited: function(attrs) {
      TabElement.baseclass.prototype.edited.apply(this, arguments);
      this.parent.update_dom();
      $('a[href="#' + this.id + '"]')[fp + 'tab']('show');
    },
    clone: function() {
      //TabElement.baseclass.prototype.clone.apply(this, arguments);
      var shortcode = TabElement.baseclass.prototype.get_my_shortcode.apply(this, arguments);
      $('#glazed-clipboard').html(encodeURIComponent(shortcode));
      this.parent.paste(this.parent.children.length);
      this.parent.update_dom();
    },
    remove: function() {
      TabElement.baseclass.prototype.remove.apply(this, arguments);
      this.parent.update_dom();
    },
    render: function($) {
      this.dom_element = $('<div id="' + this.id + '" class="az-element az-ctnr az-tab tab-pane ' +
        this.get_el_classes() + '" style="' + this.attrs['style'] + '"></div>');
      this.dom_content_element = this.dom_element;
      TabElement.baseclass.prototype.render.apply(this, arguments);
    },
  });

  function AccordionElement(parent, position) {
    AccordionElement.baseclass.apply(this, arguments);
    if (!position || typeof position !== 'boolean') {
      this.add_toggle();
    }
  }
  register_animated_element('az_accordion', true, AccordionElement);
  mixin(AccordionElement.prototype, {
    name: Drupal.t('Collapsibles'),
    icon: 'pe pe-7s-menu',
    // description: Drupal.t('Bootstrap Collapsibles'),
    category: Drupal.t('Layout'),
    params: [
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t("Collapsed?"),
        param_name: 'collapsed',
        value: {
          'yes': Drupal.t("Yes"),
        },
      }),
    ].concat(AccordionElement.prototype.params),
    is_container: true,
    controls_base_position: 'top-left',
    get_button: function() {
      return '<div class="well text-center text-overflow" data-az-element="' + this.base +
        '"><i class="' + this.icon + '"></i><div>' + this.name + '</div><div class="text-muted small">' + this.description + '</div></div>';
    },
    show_controls: function() {
      if (window.glazed_editor) {
        AccordionElement.baseclass.prototype.show_controls.apply(this, arguments);
        this.controls.find('.add').remove();
        this.controls.find('.paste').remove();
        $('<span title="' + title("Add toggle") + '" class="control add-toggle btn btn-default glyphicon glyphicon-plus-sign" > </span>').appendTo(this.controls)
          .click({
            object: this
          }, this.click_add_toggle);
      }
    },
    update_sortable: function() {
      if (window.glazed_editor) {
        $(this.dom_element).sortable({
          axis: 'y',
          items: '> .az-toggle',
          handle: '> .controls > .drag-and-drop',
          update: this.update_sorting,
          placeholder: 'az-sortable-placeholder',
          forcePlaceholderSize: true,
          //          tolerance: "pointer",
          //          distance: 1,
          over: function(event, ui) {
            ui.placeholder.attr('class', ui.helper.attr('class'));
            ui.placeholder.removeClass('ui-sortable-helper');
            ui.placeholder.addClass('az-sortable-placeholder');
          }
        });
      }
    },
    click_add_toggle: function(e) {
      e.data.object.add_toggle();
      return false;
    },
    add_toggle: function() {
      var child = new ToggleElement(this, false);
      child.update_dom();
      this.update_dom();
    },
    update_dom: function() {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].update_dom();
      }
      AccordionElement.baseclass.prototype.update_dom.apply(this, arguments);
    },
    showed: function($) {
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
    },
    render: function($) {
      this.dom_element = $('<div id="' + this.id + '" class="az-element az-accordion panel-group ' +
        this.get_el_classes() + '" style="' + this.attrs['style'] + '"></div>');
      this.dom_content_element = this.dom_element;
      AccordionElement.baseclass.prototype.render.apply(this, arguments);
    },
  });

  function ToggleElement(parent, position) {
    ToggleElement.baseclass.apply(this, arguments);
  }
  register_element('az_toggle', true, ToggleElement);
  mixin(ToggleElement.prototype, {
    name: Drupal.t('Toggle'),
    params: [
      make_param_type({
        type: 'textfield',
        heading: Drupal.t('Toggle title'),
        param_name: 'title',
        value: Drupal.t('Title')
      }),
    ].concat(ToggleElement.prototype.params),
    hidden: true,
    is_container: true,
    controls_base_position: 'top-left',
    // show_parent_controls: true,
    get_empty: function() {
      return '<div class="az-empty"><div class="top-left well"><h1>↖</h1>' + '<span class="glyphicon ' +
       'glyphicon-plus-sign"></span>' + Drupal.t(
          ' add a new toggle.') + '</div></div>';
    },
    get_my_shortcode: function() {
      return this.get_children_shortcode();
    },
    clone: function() {
      //ToggleElement.baseclass.prototype.clone.apply(this, arguments);
      var shortcode = ToggleElement.baseclass.prototype.get_my_shortcode.apply(this, arguments);
      $('#glazed-clipboard').html(encodeURIComponent(shortcode));
      this.parent.paste(this.parent.children.length);
    },
    render: function($) {
      var type ='panel-default';
      if (this.parent.attrs['type'] != '')
        type = this.parent.attrs['type'];
      this.dom_element = $('<div class="az-element az-toggle panel ' + type + ' ' + this.get_el_classes() + '" style="' + this.attrs['style'] + '"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' +
        this.parent.id + '" href="#' + this.id + '">' + this.attrs['title'] + '</a></h4></div><div id="' +
        this.id + '" class="panel-collapse collapse"><div class="panel-body az-ctnr"></div></div></div>');
      this.dom_content_element = $(this.dom_element).find('.panel-body');
      ToggleElement.baseclass.prototype.render.apply(this, arguments);
    },
  });

  function CarouselElement(parent, position) {
    CarouselElement.baseclass.apply(this, arguments);
    if (!position || typeof position !== 'boolean') {
      this.add_slide();
    }
  }
  register_animated_element('az_carousel', true, CarouselElement);
  mixin(CarouselElement.prototype, {
    name: Drupal.t('Carousel'),
    icon: 'pe pe-7s-more',
    // description: Drupal.t('Bootstrap Carousel'),
    category: Drupal.t('Layout'),
    params: [
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Frames per slide'),
        param_name: 'items',
        min: '1',
        max: '10',
        value: '1',
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Disable Auto Play'),
        param_name: 'autoplay',
        value: {
          'yes': Drupal.t('Yes'),
        },
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Dots Navigation'),
        param_name: 'pagination',
        tab: 'Dots',
        value: {
          'on': Drupal.t('On'),
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Dots Orientation'),
        param_name: 'pagination_orientation',
        tab: 'Dots',
        value: {
          'outside': Drupal.t('Outside Slider'),
          'inside': Drupal.t('Inside Slider'),
        },
        dependency: {
          'element': 'pagination',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Shape'),
        param_name: 'pagination_shape',
        tab: 'Dots',
        value: {
          'circle': Drupal.t('Circle'),
          'square': Drupal.t('Square'),
          'triangle': Drupal.t('Triangle'),
          'bar': Drupal.t('Bar'),
        },
        dependency: {
          'element': 'pagination',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Transform Active'),
        param_name: 'pagination_transform',
        tab: 'Dots',
        value: {
          '': Drupal.t('None'),
          'growTaller': Drupal.t('Grow Taller'),
          'growWider': Drupal.t('Grow Wider'),
          'scaleUp': Drupal.t('Scale up'),
        },
        dependency: {
          'element': 'pagination',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'colorpicker',
        heading: Drupal.t('Dots Color'),
        param_name: 'pagination_color',
        tab: 'Dots',
        dependency: {
          'element': 'pagination',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'colorpicker',
        heading: Drupal.t('Active Dot Color'),
        param_name: 'pagination_active_color',
        tab: 'Dots',
        dependency: {
          'element': 'pagination',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Next/Previous'),
        param_name: 'navigation',
        tab: 'Next/Previous',
        value: {
          'on': Drupal.t('On'),
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Orientation'),
        param_name: 'navigation_orientation',
        tab: 'Next/Previous',
        value: {
          'outside': Drupal.t('Outside Slider'),
          'inside': Drupal.t('Inside Slider'),
        },
        dependency: {
          'element': 'navigation',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Shape'),
        param_name: 'navigation_shape',
        tab: 'Next/Previous',
        value: {
          '': Drupal.t('No Background'),
          'circle': Drupal.t('Circle'),
          'square': Drupal.t('Square'),
          'bar': Drupal.t('Bar'),
        },
        dependency: {
          'element': 'navigation',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'colorpicker',
        heading: Drupal.t('Icon Color'),
        param_name: 'navigation_icon_color',
        tab: 'Next/Previous',
        dependency: {
          'element': 'navigation',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'colorpicker',
        heading: Drupal.t('Icon Hover Color'),
        param_name: 'navigation_icon_hover_color',
        tab: 'Next/Previous',
        dependency: {
          'element': 'navigation',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'colorpicker',
        heading: Drupal.t('Background Color'),
        param_name: 'navigation_background_color',
        tab: 'Next/Previous',
        dependency: {
          'element': 'navigation',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'colorpicker',
        heading: Drupal.t('Background Hover'),
        param_name: 'navigation_background_hover_color',
        tab: 'Next/Previous',
        dependency: {
          'element': 'navigation',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Icon Thickness'),
        param_name: 'navigation_thickness',
        tab: 'Next/Previous',
        min: '1',
        max: '10',
        value: '2',
        dependency: {
          'element': 'navigation',
          'not_empty': {}
        },
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Outside Navigation Position'),
        param_name: 'navigation_position',
        tab: 'Next/Previous',
        value: {
          'adjacent': Drupal.t('Adjacent'),
          'topLeft': Drupal.t('Top Left'),
          'topRight': Drupal.t('Top Right'),
          'bottomCenter': Drupal.t('Bottom Center'),
          'bottomLeft': Drupal.t('Bottom Left'),
          'bottomRight': Drupal.t('Bottom Right'),
        },
        dependency: {
          'element': 'navigation',
          'not_empty': {}
        },
      }),
      // make_param_type({
      //   type: 'checkbox',
      //   heading: Drupal.t('Mouse Drag'),
      //   param_name: 'mouse_drag',
      //   value: {
      //     'on': Drupal.t('On'),
      //   },
      // }),
      // make_param_type({
      //   type: 'checkbox',
      //   heading: Drupal.t('Touch Drag'),
      //   param_name: 'touch_drag',
      //   value: {
      //     'on': Drupal.t('On'),
      //   },
      // }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Auto Play Interval'),
        param_name: 'interval',
        min: '1000',
        max: '20000',
        value: '5000',
        step: '100',
      }),
      make_param_type({
        type: 'dropdown',
        heading: Drupal.t('Transition style'),
        param_name: 'transition',
        value: {
          '': Drupal.t('Default'),
          'fade': Drupal.t('fade'),
          'backSlide': Drupal.t('backSlide'),
          'goDown': Drupal.t('goDown'),
          'fadeUp': Drupal.t('fadeUp'),
        },
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Stop on Hover'),
        param_name: 'stoponhover',
        value: {
          'on': Drupal.t('On'),
        },
      }),
      // This is here for backwards compatibility before the settings were refactored in Glazed Builder 1.0.13
      make_param_type({
        type: 'checkbox',
        hidden: true,
        heading: Drupal.t('Options'),
        param_name: 'options',
        value: {
          'navigation': Drupal.t("Navigation"),
          'auto_play': Drupal.t("Auto play"),
          'mouse': Drupal.t("Mouse drag"),
          'touch': Drupal.t("Touch drag"),
        },
      }),
    ].concat(CarouselElement.prototype.params),
    is_container: true,
    controls_base_position: 'top-left',
    show_settings_on_create: true,
    frontend_render: true,
    get_button: function() {
      return '<div class="well text-center text-overflow" data-az-element="' + this.base +
        '"><i class="' + this.icon + '"></i><div>' + this.name + '</div><div class="text-muted small">' + this.description + '</div></div>';
    },
    show_controls: function() {
      if (window.glazed_editor) {
        CarouselElement.baseclass.prototype.show_controls.apply(this, arguments);
        this.controls.find('.add').remove();
        this.controls.find('.paste').remove();
        var element = this;
        $('<span title="' + title("Add slide") + '" class="control add-toggle btn btn-default glyphicon glyphicon-plus-sign" > </span>').appendTo(this.controls)
          .click({
            object: this
          }, this.click_add_slide);
      }
    },
    update_sortable: function() {},
    click_add_slide: function(e) {
      e.data.object.add_slide();
      return false;
    },
    add_slide: function() {
      var child = new SlideElement(this, true);
      child.update_dom();
      this.update_dom();
    },
    showed: function($) {
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
    },
    render: function($) {
      this.dom_element = $('<div id="' + this.id + '" class="az-element az-carousel ' + this.get_el_classes() +
        '" style="' + this.attrs['style'] + '"></div>');
      this.dom_content_element = $('<div></div>').appendTo(this.dom_element);
      CarouselElement.baseclass.prototype.render.apply(this, arguments);
    },
  });

  function SlideElement(parent, position) {
    SlideElement.baseclass.apply(this, arguments);
  }
  register_element('az_slide', true, SlideElement);
  mixin(SlideElement.prototype, {
    name: Drupal.t('Slide'),
    params: [].concat(SlideElement.prototype.params),
    hidden: true,
    // frontend_render: true,
    is_container: true,
    show_parent_controls: true,
    controls_base_position: 'top-left',
    get_empty: function() {
      return '<div class="az-empty"><div class="top-left well"><h1>↖</h1>' + '<span class="glyphicon ' +
       'glyphicon-plus-sign"></span>' + Drupal.t(' add a new slide.') + '</div></div>';
    },
    show_controls: function() {
      if (window.glazed_editor) {
        SlideElement.baseclass.prototype.show_controls.apply(this, arguments);
        this.controls.find('.clone').remove();
        this.controls.find('.drag-and-drop').remove();
        $('<span class="control btn btn-default glyphicon">' + this.name + '</span>')
          .prependTo(this.controls);
      }
    },
    get_my_shortcode: function() {
      return this.get_children_shortcode();
    },
    edited: function() {
      SlideElement.baseclass.prototype.edited.apply(this, arguments);
      this.parent.update_dom();
    },
    render: function($) {
      var type = 'panel-default';
      if (this.parent.attrs['type'] != '')
        type = this.parent.attrs['type'];
      this.dom_element = $('<div class="az-element az-slide az-ctnr ' + this.get_el_classes() + ' clearfix" style="' + this.attrs['style'] + '"></div>');
      this.dom_content_element = this.dom_element;
      SlideElement.baseclass.prototype.render.apply(this, arguments);
    },
  });

  function LayersElement(parent, position) {
    LayersElement.baseclass.apply(this, arguments);
  }
  register_animated_element('az_layers', true, LayersElement);
  mixin(LayersElement.prototype, {
    name: Drupal.t('Positioned Layers'),
    icon: 'et et-icon-layers',
    description: Drupal.t('Free Positioning'),
    category: Drupal.t('Layout'),
    params: [
      make_param_type({
        type: 'textfield',
        heading: Drupal.t('Width'),
        param_name: 'width',
        description: Drupal.t('For example 100px, or 50%.'),
        value: '100%',
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Height'),
        param_name: 'height',
        max: '10000',
        value: '500',
      }),
      make_param_type({
        type: 'checkbox',
        heading: Drupal.t('Responsive?'),
        param_name: 'responsive',
        value: {
          'yes': Drupal.t("Yes"),
        },
      }),
      make_param_type({
        type: 'bootstrap_slider',
        heading: Drupal.t('Original width'),
        param_name: 'o_width',
        hidden: true,
      }),
    ].concat(LayersElement.prototype.params),
    show_settings_on_create: true,
    is_container: true,
    controls_base_position: 'top-left',
    disallowed_elements: ['az_layers'],
    get_button: function() {
      return '<div class="well text-center text-overflow" data-az-element="' + this.base +
        '"><i class="' + this.icon + '"></i><div>' + this.name + '</div><div class="text-muted small">' + this.description + '</div></div>';
    },
    zindex_normalize: function() {
      var zindexes = [];
      for (var i = 0; i < this.children.length; i++) {
        if (isNaN(parseInt(this.children[i].attrs['pos_zindex']))) {
          this.children[i].attrs['pos_zindex'] = 0;
        }
        zindexes.push(parseInt(this.children[i].attrs['pos_zindex']));
      }
      zindexes = _.sortBy(zindexes, function(num) {
        return num;
      });
      zindexes = _.uniq(zindexes);
      for (var i = 0; i < this.children.length; i++) {
        var ind = _.sortedIndex(zindexes, parseInt(this.children[i].attrs['pos_zindex']));
        $(this.children[i].dom_element).css("z-index", ind);
        this.children[i].attrs['pos_zindex'] = ind;
      }
    },
    update_sortable: function() {
      if (window.glazed_editor) {
        var element = this;
        element.zindex_normalize();

        function store_position(dom_element) {
          var id = $(dom_element).closest('[data-az-id]').attr('data-az-id');
          var el = glazed_elements.get_element(id);
          el.attrs['pos_left'] = parseInt($(dom_element).css("left")) / ($(element.dom_content_element).width() /
            100) + "%";
          el.attrs['pos_top'] = parseInt($(dom_element).css("top")) / ($(element.dom_content_element).height() /
            100) + "%";
          el.attrs['pos_width'] = parseInt($(dom_element).css("width")) / ($(element.dom_content_element).width() /
            100) + "%";
          el.attrs['pos_height'] = parseInt($(dom_element).css("height")) / ($(element.dom_content_element).height() /
            100) + "%";
          to_percents(dom_element);
          element.attrs['o_width'] = $(element.dom_element).width();
          $(document).trigger("glazed_update_element", id);
        }

        function to_percents(dom_element) {
          $(dom_element).css("left", parseInt($(dom_element).css("left")) / ($(element.dom_content_element).width() /
            100) + "%");
          $(dom_element).css("top", parseInt($(dom_element).css("top")) / ($(element.dom_content_element).height() /
            100) + "%");
          $(dom_element).css("width", parseInt($(dom_element).css("width")) / ($(element.dom_content_element).width() /
            100) + "%");
          $(dom_element).css("height", parseInt($(dom_element).css("height")) / ($(element.dom_content_element)
            .height() / 100) + "%");
        }
        $(this.dom_content_element).resizable({
          //          containment: "parent",
          start: function(event, ui) {
            for (var i = 0; i < element.children.length; i++) {
              var dom_element = element.children[i].dom_element;
              to_percents(dom_element);
            }
          },
          stop: function(event, ui) {
            element.attrs['width'] = parseInt($(element.dom_content_element).css("width")) / ($(element.dom_element)
              .width() / 100) + "%";
            $(element.dom_content_element).width(element.attrs['width']);
            element.attrs['height'] = $(element.dom_content_element).height();
            $(document).trigger("glazed_update_element", element.id);
          }
        });
        for (var i = 0; i < this.children.length; i++) {
          if (!$.isNumeric($(this.children[i].dom_element).css("z-index"))) {
            $(this.children[i].dom_element).css("z-index", 0);
          }
          if (this.children[i].controls == null) {
            this.children[i].show_controls();
          }
          if (this.children[i].attrs['pos_top'] == null) {
            this.children[i].attrs['pos_top'] = '50%';
          }
          if (this.children[i].attrs['pos_left'] == null) {
            this.children[i].attrs['pos_left'] = '50%';
          }
          if (this.children[i].attrs['pos_width'] == null) {
            this.children[i].attrs['pos_width'] = '50%';
          }
          if (this.children[i].attrs['pos_height'] == null) {
            this.children[i].attrs['pos_height'] = '50%';
          }
          if (this.children[i].controls.find('.width100').length == 0)
            $('<span title="' + title("100% width") + '" class="control width100 btn btn-default glyphicon glyphicon-resize-horizontal" > </span>').appendTo(this
              .children[i].controls).click({
              object: this.children[i]
            }, function(e) {
              e.data.object.attrs['pos_left'] = '0%';
              $(e.data.object.dom_element).css("left", '0%');
              e.data.object.attrs['pos_width'] = '100%';
              $(e.data.object.dom_element).css("width", '100%');
              return false;
            });
          if (this.children[i].controls.find('.heigth100').length == 0)
            $('<span title="' + title("100% heigth") + '" class="control heigth100 btn btn-default glyphicon glyphicon-resize-vertical" > </span>').appendTo(this.children[
              i].controls).click({
              object: this.children[i]
            }, function(e) {
              e.data.object.attrs['pos_top'] = '0%';
              $(e.data.object.dom_element).css("top", '0%');
              e.data.object.attrs['pos_height'] = '100%';
              $(e.data.object.dom_element).css("height", '100%');
              return false;
            });
          if (this.children[i].controls.find('.forward').length == 0)
            $('<span title="' + title("Bring forward") + '" class="control forward btn btn-default glyphicon glyphicon-arrow-up" > </span>').appendTo(this.children[
              i].controls).click({
              object: this.children[i]
            }, function(e) {
              if ($.isNumeric($(e.data.object.dom_element).css("z-index"))) {
                $(e.data.object.dom_element).css("z-index", Math.round($(e.data.object.dom_element).css(
                  "z-index")) + 1);
                e.data.object.attrs['pos_zindex'] = $(e.data.object.dom_element).css("z-index");
              }
              else {
                $(e.data.object.dom_element).css("z-index", 0);
                e.data.object.attrs['pos_zindex'] = 0;
              }
              element.zindex_normalize();
              return false;
            });
          if (this.children[i].controls.find('.backward').length == 0)
            $('<span title="' + title("Send backward") + '" class="control backward btn btn-default glyphicon glyphicon-arrow-down" > </span>').appendTo(this.children[
              i].controls).click({
              object: this.children[i]
            }, function(e) {
              if ($.isNumeric($(e.data.object.dom_element).css("z-index"))) {
                if (Math.round($(e.data.object.dom_element).css("z-index")) > 0) {
                  $(e.data.object.dom_element).css("z-index", Math.round($(e.data.object.dom_element).css(
                    "z-index")) - 1);
                  e.data.object.attrs['pos_zindex'] = $(e.data.object.dom_element).css("z-index");
                }
              }
              else {
                $(e.data.object.dom_element).css("z-index", 0);
                e.data.object.attrs['pos_zindex'] = 0;
              }
              element.zindex_normalize();
              return false;
            });

          $(this.children[i].dom_element).draggable({
            handle: "> .controls > .drag-and-drop",
            containment: "#" + this.id,
            scroll: false,
            snap: "#" + this.id + ", .az-element",
            //connectToSortable: '.az-ctnr',
            stop: function(event, ui) {
              store_position(this);
            }
          });
          $(this.children[i].dom_element).resizable({
            containment: "#" + this.id,
            stop: function(event, ui) {
              store_position(this);
            }
          });
        }
      }
    },
    show_controls: function() {
      if (window.glazed_editor) {
        LayersElement.baseclass.prototype.show_controls.apply(this, arguments);
        this.update_sortable();
        var element = this;
        $(this.dom_content_element).dblclick(function(e) {
          if (e.which == 1) {
            glazed_elements.show(element, function(new_element) {
              new_element.attrs['pos_top'] = e.offsetY.toString() + 'px';
              new_element.attrs['pos_left'] = e.offsetX.toString() + 'px';
            });
          }
        });
      }
    },
    attach_children: function() {
      LayersElement.baseclass.prototype.attach_children.apply(this, arguments);
      if (window.glazed_editor)
        this.update_sortable();
    },
    showed: function($) {
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
    },
    render: function($) {
      this.dom_element = $('<div class="az-element az-layers ' + this.get_el_classes() + '" style="' + this.attrs[
        'style'] + '"><div id="' + this.id + '" class="az-ctnr"></div></div>');
      this.dom_content_element = $(this.dom_element).find('.az-ctnr');
      $(this.dom_content_element).css('width', this.attrs['width']);
      $(this.dom_content_element).css('height', this.attrs['height']);
      LayersElement.baseclass.prototype.render.apply(this, arguments);
    },
  });

  function ContainerElement(parent, position) {
    ContainerElement.baseclass.apply(this, arguments);
    this.rendered = false;
    this.loaded_container = null;
    this.js = {};
    this.css = {};
  }
  register_animated_element('az_container', true, ContainerElement);
  mixin(ContainerElement.prototype, {
    name: Drupal.t('Glazed Container'),
    icon: 'et et-icon-download',
    description: Drupal.t('AJAX Load Fields'),
    category: Drupal.t('Layout'),
    params: [
      make_param_type({
        type: 'container',
        heading: Drupal.t('Glazed Container'),
        param_name: 'container',
        description: Drupal.t('Type and name used as identificator to save container on server.'),
        value: '/',
      }),
    ].concat(ContainerElement.prototype.params),
    show_settings_on_create: true,
    is_container: true,
    hidden: !window.glazed_online,
    controls_base_position: 'top-left',
    saveable: true,
    get_button: function() {
      return '<div class="well text-center text-overflow" data-az-element="' + this.base +
        '"><i class="' + this.icon + '"></i><div>' + this.name + '</div><div class="text-muted small">' + this.description + '</div></div>';
    },
    get_empty: function() {
      var dom_element = '<div class="az-empty"><div class="top well"><strong>' + '  <h3 class="glazed-choose-layout">Choose a Layout</h3></strong>'
           + '<p class="lead">' + Drupal.t('Or add elements from the + button or sidebar.' + '</p></div>')
           + '<div class="top-right well"><h1>↗</h1>'
           + ' <span class="glyphicon glyphicon-save"></span>' +
        Drupal.t(' Don\'t forget to save frequently') + '</div></div>';
      var $dom_element = $(dom_element);
      $dom_element.find('.glazed-choose-layout').bind('click',function(e){
        e.stopPropagation();
        if (e.which == 1) {
          var id = $(this).closest('[data-az-id]').attr('data-az-id');
          glazed_elements.showTemplates(glazed_elements.get_element(id), function(element) {

          });
        }
      })
      return $dom_element;
    },
    show_controls: function() {
      if (window.glazed_editor) {
        var element = this;
        var helpContent = '<ul class="nav">'
        // helpContent += '<li><a href="http://www.sooperthemes.com/" taget="_blank">Start Tour</a></li>';
        helpContent += '<li><a href="https://www.youtube.com/watch?v=lODF-8byKRA" target="_blank">Basic Controls Video</a></li>';
        helpContent += '<li><a href="http://www.sooperthemes.com/documentation" target="_blank">Documentation</a></li>';
        helpContent += '<li><a href="http://www.sooperthemes.com/dashboard/tickets" target="_blank">Support Forum</a></li>';
        helpContent += '</ul>'
        ContainerElement.baseclass.prototype.show_controls.apply(this, arguments);
        if (this.parent == null) {
          // Setting up the Glazed Container main controls
          $('<span title="' + title("Toggle editor") + '" class="control toggle-editor btn btn-default glyphicon glyphicon-eye-open" > </span>')
          .appendTo(this.controls)
            .click(function() {
              $(element.dom_element).toggleClass('glazed-editor');
              return false;
            });
          $('<span role="button" tabindex="0" title="' + title("Documentation and Support") + '" class="control glazed-help btn btn-default glyphicon glyphicon-question-sign glazed-builder-popover"> </span>')
          .appendTo(this.controls)
          .popover({
            html : true,
            placement: 'left',
            content: function() {
              return helpContent;
            },
            title: function() {
              return 'Support and Documentation';
            }
          });
          // $('<span title="' + title("Toggle animations") + '" class="control toggle-animations btn ' +
          //    'btn-default glyphicon glyphicon-play-circle" > </span>').appendTo(this.controls)
          //   .click(function() {
          //     $(element.dom_element).toggleClass('glazed-animations-disabled');
          //     return false;
          //   });
          this.controls.removeClass(p + 'btn-group-xs');
          this.controls.find('.edit').remove();
          this.controls.find('.copy').remove();
          this.controls.find('.clone').remove();
          this.controls.find('.remove').remove();
          this.controls.find('.js-animation').remove();
          this.controls.find('.drag-and-drop').attr('title', '');
          this.controls.find('.drag-and-drop').removeClass(p + 'glyphicon-move');
          this.controls.find('.drag-and-drop').removeClass('drag-and-drop');
        }
        if (this.saveable)
          $('<span title="' + title("Save container") + '" class="control save-container btn btn-success glyphicon glyphicon-save" > </span>').appendTo(this.controls).click({
            object: this
          }, this.click_save_container);
      }
    },
    get_my_shortcode: function() {
      return this.get_children_shortcode();
    },
    get_hover_styles: function(element) {
      var hover_styles = '';
      if (element.attrs['hover_style'] != '')
        hover_styles = element.get_hover_style();
      for (var i = 0; i < element.children.length; i++) {
        hover_styles = hover_styles + this.get_hover_styles(element.children[i]);
      }
      return hover_styles;
    },
    get_js: function(element) {
      var html = '';
      for (var url in element.js)
        html += '<script src="' + url + '"></script>\n';
      return html;
    },
    get_css: function(element) {
      var html = '';
      for (var url in element.css)
        html += '<link rel="stylesheet" type="text/css" href="' + url + '">\n';
      return html;
    },
    get_loader: function() {
      var element = this;

      function get_object_method_js(object, method, own) {
        if (own) {
          if (!object.hasOwnProperty(method))
            return '';
        }
        return method + ': ' + object[method].toString() + ",\n";
      }

      function get_object_property_js(object, property, own) {
        if (own) {
          if (!object.hasOwnProperty(property))
            return '';
        }
        return property + ': ' + JSON.stringify(object[property]) + ",\n";
      }

      function get_object_js(object, own) {
        var js = '{';
        for (var key in object) {
          if (own) {
            if (!object.hasOwnProperty(key))
              continue;
          }
          if ($.isFunction(object[key])) {
            js += get_object_method_js(object, key, own);
          }
          else {
            js += get_object_property_js(object, key, own);
          }
        }
        js += '}';
        return js;
      }

      function get_class_method_js(class_function, method, own) {
        if (own) {
          if (!class_function.prototype.hasOwnProperty(method))
            return '';
        }
        return class_function.name + '.prototype.' + method + '=' + class_function.prototype[method].toString() +
          "\n";
      }

      function get_class_property_js(class_function, property, own) {
        if (own) {
          if (!class_function.prototype.hasOwnProperty(property))
            return '';
        }
        return class_function.name + '.prototype.' + property + '=' + JSON.stringify(class_function.prototype[
          property]) + ";\n";
      }

      function get_class_js(class_function, own) {
        var js = '';
        js += class_function.toString() + "\n";
        if ('baseclass' in class_function) {
          js += extend.name + "(" + class_function.name + ", " + class_function.baseclass.name + ");\n";
        }
        for (var key in class_function.prototype) {
          if (own) {
            if (!class_function.prototype.hasOwnProperty(key))
              continue;
          }
          if ($.isFunction(class_function.prototype[key])) {
            js += get_class_method_js(class_function, key, own);
          }
          else {
            js += get_class_property_js(class_function, key, own);
          }
        }
        return js;
      }

      function get_element_params_js(class_function) {
        var params = [];
        for (var i = 0; i < class_function.prototype.params.length; i++) {
          var param = {};
          param.param_name = class_function.prototype.params[i].param_name;
          param.value = '';
          if ('value' in class_function.prototype.params[i] && _.isString(class_function.prototype.params[i].value))
            param.value = class_function.prototype.params[i].value;
          param.safe = class_function.prototype.params[i].safe;
          params.push(param);
        }
        return class_function.name + '.prototype.params=' + JSON.stringify(params) + ";\n";
      }

      function get_element_object_js(object, own) {
        var element = {};
        element.base = object.base;
        if ('showed' in object)
          element.showed = object.showed;
        element.params = [];
        for (var i = 0; i < object.params.length; i++) {
          if ('value' in object.params[i] && _.isString(object.params[i].value)) {
            var param = {};
            param.param_name = object.params[i].param_name;
            param.value = object.params[i].value;
            element.params.push(param);
          }
          else {
            var param = {};
            param.param_name = object.params[i].param_name;
            param.value = '';
            element.params.push(param);
          }
        }
        if (object.hasOwnProperty('is_container'))
          element.is_container = object.is_container;
        if (object.hasOwnProperty('has_content'))
          element.has_content = object.has_content;
        if (object.hasOwnProperty('frontend_render')) {
          element.frontend_render = object.frontend_render;
          if (element.frontend_render) {
            element.render = object.render;
            if (object.hasOwnProperty('recursive_render'))
              element.recursive_render = object.recursive_render;
          }
        }
        return get_object_js(element, own);
      }

      function get_contained_elements(element) {
        var bases = {};
        bases[element.base] = true;
        for (var i = 0; i < element.children.length; i++) {
          var b = get_contained_elements(element.children[i]);
          $.extend(bases, b);
        }
        return bases;
      }

      function check_attributes(element) {
        var attributes = {};
        if ('an_start' in element.attrs && element.attrs['an_start'] != '') {
          attributes['an_start'] = true;
        }
        for (var i = 0; i < element.children.length; i++) {
          $.extend(attributes, check_attributes(element.children[i]));
        }
        return attributes;
      }

      var bases = get_contained_elements(element);
      var attributes = check_attributes(element);

      function get_javascript() {
        var javascript = '';
       /*
        * IMPORTANT: DO NOT DELETE FOLLOWING COMMENTED CODE BLOCK
        *
        * Commented code is exported to glazed_frontend.js to prevent all this
        * code going into the raw fields along with custom js that is needed
        * for JS plugin initialisation, hover styles and animations.
        * Whene any of the here referenced methods and functions are changed the
        * output of the commented code should be used to update glazed_frontend.js
        * ~ Jur 06/07/2016
        *
        */
        // javascript += "(function($) {\n";
        // javascript += "if('glazed_backend' in window) return;\n";
        // javascript += "window.glazed_frontend = true;\n";
        // javascript += "window.glazed_elements = [];\n";
        // javascript += "window.glazed_extend = [];\n";
        // javascript += glazed_load_container.toString() + "\n";

        // javascript += extend.toString() + "\n";
        // javascript += mixin.toString() + "\n";
        // javascript += substr_replace.toString() + "\n";
        // javascript += unescapeParam.toString() + "\n";
        // javascript += "$.fn.closest_descendents = " + $.fn.closest_descendents.toString() + " \n";

        // javascript += BaseParamType.toString() + "\n";
        // javascript += BaseParamType.name + ".prototype.safe = true;\n";
        // javascript += BaseParamType.name + ".prototype.param_types = {};\n";

        // javascript += make_param_type.toString() + "\n";

        // javascript += 'window.glazed_add_css=' + window.glazed_add_css.toString() + "\n";
        // javascript += 'window.glazed_add_js=' + window.glazed_add_js.toString() + "\n";
        // javascript += 'window.glazed_add_js_list=' + window.glazed_add_js_list.toString() + "\n";
        // javascript += "var glazed_js_waiting_callbacks = {};\n";
        // javascript += "var glazed_loaded_js = {};\n";
        // javascript += 'window.glazed_add_external_js=' + window.glazed_add_external_js.toString() + "\n";

        // javascript += glazedElements.toString() + "\n";
        // javascript += glazedElements.name + ".prototype.elements_instances = {};\n";
        // javascript += glazedElements.name + ".prototype.elements_instances_by_an_name = {};\n";
        // javascript += get_class_method_js(glazedElements, 'get_element', true);
        // javascript += get_class_method_js(glazedElements, 'delete_element', true);
        // javascript += get_class_method_js(glazedElements, 'add_element', true);
        // javascript += get_class_method_js(glazedElements, 'try_render_unknown_elements', false);

        // javascript += BaseElement.toString() + "\n";
        // javascript += BaseElement.name + ".prototype.elements = {};\n";
        // javascript += BaseElement.name + ".prototype.tags = {};\n";
        // javascript += get_element_params_js(BaseElement);
        // javascript += get_class_method_js(BaseElement, 'get_hover_style', true);
        // javascript += get_class_method_js(BaseElement, 'showed', true);
        // javascript += get_class_method_js(BaseElement, 'render', true);
        // javascript += get_class_method_js(BaseElement, 'recursive_render', true);
        // javascript += get_class_method_js(BaseElement, 'replace_render', true);
        // javascript += get_class_method_js(BaseElement, 'update_dom', true);
        // javascript += get_class_method_js(BaseElement, 'attach_children', true);
        // javascript += get_class_method_js(BaseElement, 'detach_children', true);
        // javascript += get_class_method_js(BaseElement, 'recursive_showed', true);
        // javascript += get_class_method_js(BaseElement, 'parse_attrs', true);
        // javascript += get_class_method_js(BaseElement, 'parse_html', true);
        // javascript += get_class_method_js(BaseElement, 'add_css', true);
        // javascript += get_class_method_js(BaseElement, 'add_js_list', true);
        // javascript += get_class_method_js(BaseElement, 'add_js', true);
        // javascript += get_class_method_js(BaseElement, 'add_external_js', true);
        // javascript += get_class_method_js(BaseElement, 'get_my_container', true);
        // if ('an_start' in attributes) {
        //   javascript += get_class_method_js(BaseElement, 'trigger_start_in_animation', true);
        //   javascript += get_class_method_js(BaseElement, 'trigger_start_out_animation', true);
        // }
        // javascript += register_element.toString() + "\n";
        // javascript += UnknownElement.toString() + "\n";
        // javascript += register_element.name + "('az_unknown', true, " + UnknownElement.name + ");\n";
        // javascript += UnknownElement.name + ".prototype.has_content = true;\n";

        // // switched off for better loader js portability to new envs/urls ~ Jur 06/07/2016
        // // javascript += "window.glazed_baseurl = '" + window.glazed_baseurl + "';\n";
        // // if ('glazed_ajaxurl' in window)
        // //   javascript += "window.glazed_ajaxurl = '" + toAbsoluteURL(window.glazed_ajaxurl) + "';\n";
        // javascript +=
        //   "window.glazed_online = (window.location.protocol == 'http:' || window.location.protocol == 'https:');\n";
        // javascript += "var glazed_elements = new " + glazedElements.name + "();\n";
        // javascript += "var p = '';\n";
        // javascript += "var fp = '';\n";
        // javascript += "var scroll_magic = null;\n";
        // javascript += "window.glazed_editor = false;\n";
        // if ('glazed_exporter' in window)
        //   javascript += "window.glazed_exported = " + window.glazed_exporter.toString() + ";\n";
        // javascript += "var glazed_containers = [];\n";
        // javascript += "var glazed_containers_loaded = {};\n";
        // javascript += connect_container.toString() + "\n";

        // javascript += AnimatedElement.toString() + "\n";
        // javascript += extend.name + "(" + AnimatedElement.name + ", " + BaseElement.name + ");\n";
        // javascript += get_element_params_js(AnimatedElement);
        // if ('an_start' in attributes) {
        //   javascript += get_class_method_js(AnimatedElement, 'set_in_timeout', true);
        //   javascript += get_class_method_js(AnimatedElement, 'start_in_animation', true);
        //   javascript += get_class_method_js(AnimatedElement, 'set_out_timeout', true);
        //   javascript += get_class_method_js(AnimatedElement, 'start_out_animation', true);
        //   javascript += get_class_method_js(AnimatedElement, 'clear_animation', true);
        //   javascript += get_class_method_js(AnimatedElement, 'end_animation', true);
        //   javascript += get_class_method_js(AnimatedElement, 'trigger_start_in_animation', true);
        //   javascript += get_class_method_js(AnimatedElement, 'trigger_start_out_animation', true);
        //   javascript += get_class_method_js(AnimatedElement, 'animation', true);
        // }
        // if ('an_start' in attributes)
        //   javascript += get_class_method_js(AnimatedElement, 'showed', true);
        // javascript += get_class_method_js(AnimatedElement, 'render', true);
        // javascript += register_animated_element.toString() + "\n";

        // // javascript += FormDataElement.toString() + "\n";
        // // javascript += extend.name + "(" + FormDataElement.name + ", " + AnimatedElement.name + ");\n";
        // // javascript += FormDataElement.name + ".prototype.form_elements = {};\n";
        // // javascript += register_form_data_element.toString() + "\n";

        // if (SectionElement.prototype.base in bases) {
        //   javascript += SectionElement.toString() + "\n";
        //   javascript += register_animated_element.name + "('" + SectionElement.prototype.base + "', true, " +
        //     SectionElement.name + ");\n";
        //   javascript += get_element_params_js(SectionElement);
        //   javascript += get_class_method_js(SectionElement, 'showed', true);
        // }

        // if (RowElement.prototype.base in bases) {
        //   javascript += RowElement.toString() + "\n";
        //   javascript += register_animated_element.name + "('" + RowElement.prototype.base + "', true, " +
        //     RowElement.name + ");\n";
        //   javascript += get_element_params_js(RowElement);
        //   javascript += get_class_method_js(RowElement, 'showed', true);
        //   javascript += RowElement.name + ".prototype.set_columns = function(columns){};\n";
        //   javascript += ColumnElement.toString() + "\n";
        //   javascript += register_element.name + "('" + ColumnElement.prototype.base + "', true, " +
        //     ColumnElement.name + ");\n";
        //   javascript += get_element_params_js(ColumnElement);
        //   javascript += get_class_method_js(ColumnElement, 'showed', true);
        // }

        // if (ContainerElement.prototype.base in bases) {
        //   javascript += ContainerElement.toString() + "\n";
        //   javascript += register_animated_element.name + "('" + ContainerElement.prototype.base + "', true, " +
        //     ContainerElement.name + ");\n";
        //   javascript += get_element_params_js(ContainerElement);
        //   javascript += get_class_method_js(ContainerElement, 'showed', true);
        //   javascript += get_class_method_js(ContainerElement, 'load_container', true);
        //   javascript += get_class_method_js(ContainerElement, 'update_dom', true);
        //   javascript += get_class_method_js(ContainerElement, 'render', true);
        //   javascript += get_class_method_js(ContainerElement, 'recursive_render', true);
        // }

        // if (LayersElement.prototype.base in bases) {
        //   javascript += LayersElement.toString() + "\n";
        //   javascript += register_animated_element.name + "('" + LayersElement.prototype.base + "', true, " +
        //     LayersElement.name + ");\n";
        //   javascript += get_element_params_js(LayersElement);
        //   javascript += get_class_method_js(LayersElement, 'showed', true);
        // }

        // if (TabsElement.prototype.base in bases) {
        //   javascript += TabsElement.toString() + "\n";
        //   javascript += register_animated_element.name + "('" + TabsElement.prototype.base + "', true, " +
        //     TabsElement.name + ");\n";
        //   javascript += get_element_params_js(TabsElement);
        //   javascript += get_class_method_js(TabsElement, 'showed', true);
        //   javascript += get_class_method_js(TabsElement, 'render', true);
        //   javascript += TabElement.toString() + "\n";
        //   javascript += register_element.name + "('" + TabElement.prototype.base + "', true, " + TabElement.name +
        //     ");\n";
        //   javascript += get_element_params_js(TabElement);
        //   javascript += get_class_method_js(TabElement, 'render', true);
        // }

        // if (AccordionElement.prototype.base in bases) {
        //   javascript += AccordionElement.toString() + "\n";
        //   javascript += register_animated_element.name + "('" + AccordionElement.prototype.base + "', true, " +
        //     AccordionElement.name + ");\n";
        //   javascript += get_element_params_js(AccordionElement);
        //   javascript += get_class_method_js(AccordionElement, 'showed', true);
        //   javascript += get_class_method_js(AccordionElement, 'render', true);
        //   javascript += ToggleElement.toString() + "\n";
        //   javascript += register_element.name + "('" + ToggleElement.prototype.base + "', true, " +
        //     ToggleElement.name + ");\n";
        //   javascript += get_element_params_js(ToggleElement);
        //   javascript += get_class_method_js(ToggleElement, 'render', true);
        //   javascript += get_class_method_js(ToggleElement, 'showed', true);
        // }

        // if (CarouselElement.prototype.base in bases) {
        //   javascript += CarouselElement.toString() + "\n";
        //   javascript += register_animated_element.name + "('" + CarouselElement.prototype.base + "', true, " +
        //     CarouselElement.name + ");\n";
        //   javascript += get_element_params_js(CarouselElement);
        //   javascript += CarouselElement.name + ".prototype.frontend_render = true;\n";
        //   javascript += get_class_method_js(CarouselElement, 'showed', true);
        //   javascript += get_class_method_js(CarouselElement, 'render', true);
        //   javascript += SlideElement.toString() + "\n";
        //   javascript += register_element.name + "('" + SlideElement.prototype.base + "', true, " + SlideElement
        //     .name + ");\n";
        //   javascript += get_element_params_js(SlideElement);
        //   javascript += SlideElement.name + ".prototype.frontend_render = true;\n";
        //   javascript += get_class_method_js(SlideElement, 'showed', true);
        //   javascript += get_class_method_js(SlideElement, 'render', true);
        // }

        // javascript += "if (!('glazed_elements' in window)) { window.glazed_elements = []; }\n";
        // if ('glazed_elements' in window) {
        //   for (var i = 0; i < window.glazed_elements.length; i++) {
        //     // Modified this line to include all render and showed code in glazed_frontend.js
        //     if (true || window.glazed_elements[i].base in bases)
        //       javascript += "window.glazed_elements.push(" + get_element_object_js(window.glazed_elements[i],
        //         true) + ");\n";
        //   }
        // }

        // if ('glazed_extend' in window) {
        //   for (var i = 0; i < window.glazed_extend.length; i++) {
        //     javascript += "window.glazed_extend.push(" + get_object_js(window.glazed_extend[i], true) +
        //       ");\n";
        //   }
        // }
        // javascript += create_glazed_elements.toString() + "\n";
        // javascript += create_glazed_elements.name + "();\n";
        // javascript += make_glazed_extend.toString() + "\n";
        // javascript += make_glazed_extend.name + "();\n";
        // //        javascript += create_template_elements.toString() + "\n";
        // //        javascript += create_template_elements.name + "();\n";
        // //        javascript += create_cms_elements.toString() + "\n";
        // //        javascript += create_cms_elements.name + "();\n";

        // if (window.glazed_online) {
        //   hashCode = function(s) {
        //     return s.split("").reduce(function(a, b) {
        //       a = ((a << 5) - a) + b.charCodeAt(0);
        //       return a & a
        //     }, 0);
        //   }
        //   javascript += "$(document).ready(function(){connect_container($('[data-az-hash=\""
        //   + hashCode(javascript) + "\"]'));});\n";
        // }
        // else {
        //   var type = element.attrs['container'].split('/')[0];
        //   var name = element.attrs['container'].split('/')[1];
        //   javascript += "$(document).ready(function(){"
        //     + "connect_container($('[data-az-type=\""
        //     + type + "\"][data-az-name=\"" + name + "\"]'));});\n";
        // }

        // javascript += "})(window.jQuery);\n";

       /*
        * END GLAZED_FRONTEND.JS BLOCK
        */
        return javascript;
      }

     /*
      * See if this container needs glazed frontend rendering
      * A positive return will result in glazed loader javascript being added to the field value
      */
      function check_el_dynamic(element) {
        if ('an_start' in element.attrs && element.attrs['an_start'] != '') {
          animation = true;
          return true;
        }
        if (element.constructor.prototype.hasOwnProperty('showed')) {
          var js = true;
          if ('is_cms_element' in element || 'is_template_element' in element)
            js = false;
          switch (element.base) {
            case 'az_container':
              if (element.parent == null)
                js = false;
              break;
            case 'az_section':
              if (element.attrs['effect'] == '')
                js = false;
              break;
            case 'az_row':
              if (element.attrs['equal'] != 'yes')
                js = false;
              break;
            default:
              break;
          }
          if (js) {
            return true;
          }
        }
        for (var i = 0; i < element.children.length; i++) {
          if (check_el_dynamic(element.children[i])) {
            return true;
          }
        }
        return false;
      }
      var javascript = '';
      var url = '';
      if ('glazed_development' in window) {
        url = window.glazed_baseurl + 'glazed_frontend.js';
      }
      else {
        url = window.glazed_baseurl + 'glazed_frontend.min.js';
      }
      if (check_el_dynamic(element)) {
        javascript += "<script src=\"" + url + "\"></script>\n";
      }
      return javascript;
    },
    get_html: function() {
      // Cleanup on save. Removes elements and classes that aren't to be saved
      // @todo make this extendable via api
      this.recursive_update_data();
      this.recursive_clear_animation();
      var dom = $('<div>' + $(this.dom_content_element).html() + '</div>');
      this.recursive_restore(dom);
      $(dom).find('.az-element > .controls').remove();
      $(dom).find('.az-section > .add-section').remove();
      $(dom).find('> .controls').remove();
      $(dom).find('.az-sortable-controls').remove();
      $(dom).find('.az-empty').remove();
      $(dom).find('.ui-resizable-e').remove();
      $(dom).find('.ui-resizable-s').remove();
      $(dom).find('.ui-resizable-se').remove();
      // Removed ckeditor-inline elements.
      $(dom).find('.az-text .ckeditor-inline').each(function() {
        var $this = $(this);
        var content = $this.contents();
        $this.replaceWith(content);
      });
      $(dom).find('.az-text').removeClass('cke_editable cke_editable_inline cke_contents_ltr cke_show_borders');
      $(dom).find('.init-colorbox-processed').removeClass('init-colorbox-processed');

      $(dom).find('.az-element--controls-center').removeClass('az-element--controls-center');
      $(dom).find('.az-element--controls-top-left').removeClass('az-element--controls-top-left');
      $(dom).find('.az-element--controls-spacer').removeClass('az-element--controls-spacer');
      $(dom).find('.editable-highlight').removeClass('editable-highlight');
      $(dom).find('.styleable-highlight').removeClass('styleable-highlight');
      $(dom).find('.sortable-highlight').removeClass('sortable-highlight');
      $(dom).find('.ui-draggable').removeClass('ui-draggable');
      $(dom).find('.ui-resizable').removeClass('ui-resizable');
      $(dom).find('.ui-sortable').removeClass('ui-sortable');
      $(dom).find('.az-element.az-container > .az-ctnr').empty();
      $(dom).find('.az-element.az-cms-element').empty();

      // Remove mb Youtube Player Elements.
      $(dom).find('.mbYTP_wrapper').remove();

      //$(dom).find('[data-az-id]').removeAttr('data-az-id');
      return $(dom).html();
    },
    get_container_html: function() {
      return this.get_html() + this.get_css(this) + this.get_hover_styles(this) + this.get_js(this) + this.get_loader();
    },
    click_save_container: function(e) {
      e.data.object.save_container();
      return false;
    },
    save_container: function() {
      var element = this;
      if ('html_content' in this || true) {
        glazed_add_js({
          path: 'jsON-js/json2.min.js',
          loaded: 'JSON' in window,
          callback: function() {
            var html = element.get_container_html();
            glazed_save_container(element.attrs['container'].split('/')[0], element.attrs['container'].split(
              '/')[1], html);
          }
        });
      }
      else {
        if (this.attrs['container'] != '') {
          var shortcode = this.get_children_shortcode();
          glazed_save_container(this.attrs['container'].split('/')[0], this.attrs['container'].split('/')[1],
            shortcode);
        }
      }
    },
    load_container: function() {
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
    },
    clone: function() {
      ContainerElement.baseclass.prototype.clone.apply(this, arguments);
      this.rendered = true;
    },
    recursive_render: function() {
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
    },
    update_dom: function() {
      if (this.loaded_container != this.attrs['container']) {
        this.children = [];
        $(this.dom_content_element).empty();
        this.rendered = false;
        if (this.parent != null) {
          ContainerElement.baseclass.prototype.update_dom.apply(this, arguments);
        }
      }
    },
    showed: function($) {
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
    },
    render: function($) {
      if (this.attrs.container != '/') {
        this.dom_element = $('<div class="az-element az-container"><div class="az-ctnr"></div></div>');
        this.dom_content_element = $(this.dom_element).find('.az-ctnr');
        ContainerElement.baseclass.prototype.render.apply(this, arguments);
      }
    },
  });


  function UnknownElement(parent, position) {
    UnknownElement.baseclass.apply(this, arguments);
  }
  register_element('az_unknown', true, UnknownElement);
  mixin(UnknownElement.prototype, {
    has_content: true,
    hidden: true,
    render: function($) {
      this.dom_element = $('<div class = "az-element az-unknown">' + Drupal.t('Element Not Found.') + '</div>');
      this.dom_content_element = this.dom_element;
      if ('content' in this.attrs) {
        var match = /\[[^\]]*\]([^\[]*)\[\/[^\]]*\]/.exec(this.attrs['content']);
        if (match) {
          $(this.dom_element).append(match[1]);
        }
      }
      UnknownElement.baseclass.prototype.render.apply(this, arguments);
    },
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

  function create_template_elements() {
    if (!window.glazed_editor || window.glazed_online)
      glazed_get_elements(function(elements) {
        if (_.isObject(elements)) {
          glazed_elements.create_template_elements(elements);
        }
      });
  }
  create_template_elements();

  function create_cms_elements() {
    glazed_builder_get_cms_element_names(function(elements) {
      if (_.isObject(elements)) {
        glazed_elements.create_cms_elements(elements);
      }
      else {
        glazed_elements.cms_elements_loaded = true;
      }
    });
  }
  create_cms_elements();

  /**
   * Allow extending of glazed element via window.glazed_extend.exampleElement
   * @todo test and document
   */
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

  // Update object content.
  function updateEventData(e) {

    // Search all text elements.
    var domContent = [];

    $(document).find('.az-element.az-text, .az-element.az-blockquote').each(function() {
      var $this = $(this);
      if ($this.children('.ckeditor-inline').length > 0) {
        domContent[$this.attr('data-az-id')] = $this.children('.ckeditor-inline').html();
      }
    });
    // Update parent element.
    if (e.data.object.id in domContent) {
      e.data.object.attrs.content = domContent[e.data.object.id];
    }

    // Recursive function for update child elements.
    function recursive_update(elem) {
      for (var i = 0; i < elem.children.length; i++) {
        recursive_update(elem.children[i]);
      }
      if (elem.id in domContent) {
        elem.attrs.content = domContent[elem.id];
      }
    }

    // Update child elements of parent.
    for (var i = 0; i < e.data.object.children.length; i++) {
      recursive_update(e.data.object.children[i]);
    }

  }

  // Message to prevent leaving page without saving
  var attachOnLoad = function() {
    $(
      'button.control.add:not(.attachOnLoadBinded-processed), button.control.edit:not(.attachOnLoadBinded-processed), .az-empty:not(.attachOnLoadBinded-processed), button.control.remove:not(.attachOnLoadBinded-processed), #az-thumbnails:not(.attachOnLoadBinded-processed)'
    ).once('attachOnLoadBinded', function() {
      $(this).bind('mousedown', function() {
        window.attachOnLoad = true;
      });
    });
  };

  $(window).on("load", function() {

    attachOnLoad();

    $('button.control.save-container').once('attachOnLoad', function() {
      $(this).bind('click', function() {
        attachOnLoad();
        window.attachOnLoad = false;
      });
    });

    $('body').once('windowBeforeunload', function() {
      $(window).bind('beforeunload', function() {
        if (typeof window.attachOnLoad !== 'undefined' && window.attachOnLoad) {
          return ' ';
        }
      });
    });

  });
  // Added inline ckeditor.
  Drupal.behaviors.CKinlineAttach = {
    attach: function() {
      // Elements for add ckeditor-inline.
      var items = '.az-element.az-text, .az-element.az-blockquote';


      // Attach window function for load ckeditor-inline.
      $(window).bind('CKinlineAttach', function() {
        function ckeditor_add_inline_editor() {
          CKEDITOR.on('instanceCreated', function( evt ) {
            var editor = evt.editor;
            editor.on('focus', function() {
              $(editor.element.$).parents('.az-element').addClass('az-element--hide-controls');
            });
            editor.on('blur', function() {
              $(editor.element.$).parents('.az-element').removeClass('az-element--hide-controls');
            });
          });

          // Turn off automatic editor creation on admin pages to avoid max input vars
          // error on Drupal FAPI Ajax buttons. (CKE creates a lot of IDs)
          if (window.location.href.indexOf('/admin/') > 0) {
            CKEDITOR.disableAutoInline = true;
          }

          // Don't add spaces to empty blocks
          CKEDITOR.config.fillEmptyBlocks = false;
          // Disabling content filtering.
          CKEDITOR.config.allowedContent = true;
          // Prevent wrapping inline content in paragraphs
          CKEDITOR.config.autoParagraph = false;

          // Theme integration
          CKEDITOR.config.contentsCss = ['//cdn.jsdelivr.net/bootstrap/3.3.7/css/bootstrap.min.css'];
          if (typeof window.Drupal.settings.glazed != "undefined" && typeof window.Drupal.settings.glazed.glazedPath.length != "undefined") {
            CKEDITOR.config.contentsCss.push(Drupal.settings.basePath + window.Drupal.settings.glazed.glazedPath +
              'css/glazed.css');
          }

          // Styles dropdown
          CKEDITOR.config.stylesSet = [{
            name: 'Lead',
            element: 'p',
            attributes: {
              'class': 'lead'
            }
          }, {
            name: 'Muted',
            element: 'p',
            attributes: {
              'class': 'text-muted'
            }
          }, {
            name: 'Highlighted',
            element: 'mark'
          }, {
            name: 'Small',
            element: 'small'
          }, {
            name: 'Button Primary',
            element: 'div',
            attributes: {
              'class': 'btn btn-primary'
            }
          }, {
            name: 'Button Default',
            element: 'div',
            attributes: {
              'class': 'btn btn-default'
            }
          }, ];

          var palette = [];
          for (var name in window.sooperthemes_theme_palette) {
            palette.push(window.sooperthemes_theme_palette[name].substring(1));
          }

          // Only once apply this settings
          var palletsString = palette.join(',') + ',';
          if ((CKEDITOR.config.hasOwnProperty('colorButton_colors')) && (CKEDITOR.config.colorButton_colors.indexOf(palletsString)) < 0) {
            CKEDITOR.config.colorButton_colors = palletsString + CKEDITOR.config.colorButton_colors;
          }

          // Added config toolbar
          var toolbar = [{
            name: 'basicstyles',
            items: ['Bold', 'Italic', 'RemoveFormat']
          }, {
            name: 'colors',
            items: ['TextColor']
          }, {
            name: 'styles',
            items: ['Format', 'Styles', 'FontSize']
          }, {
            name: 'paragraph',
            items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', 'BulletedList',
              'NumberedList'
            ]
          }, {
            name: 'links',
            items: ['Link', 'Unlink']
          }, {
            name: 'insert',
            items: ['Image', 'Table']
          }, {
            name: 'clipboard',
            items: ['Undo', 'Redo']
          }, ];
          CKEDITOR.config.toolbar = toolbar;

          CKEDITOR.config.fontSize_sizes = '8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;36/36px;48/48px;60/60px;72/72px;90/90px;117/117px;144/144px';

          // Don't move about our Glazed Builder stylesheet link tags
          CKEDITOR.config.protectedSource.push(/<link.*?>/gi);

          // Search glazed containers.
          $('body').find('.glazed').each(function() {
            if ($(this).hasClass('glazed-editor')) {
              $(this).find(items).each(function() {

                var $text = $(this);
                // Replaced only ckeditor-inline containers.
                if (!$text.find('.ckeditor-inline').length) {
                  $controls = $text.find('.controls').appendTo('body');
                  $text.wrapInner("<div class='ckeditor-inline' contenteditable='true' />");
                  $text.prepend($controls);

                  // Initialize new editor.
                  var editor = $text.find('.ckeditor-inline')[0];
                  if (typeof editor != "undefined") {
                    $(editor).bind('click', function (event) {
                      // Make sure the toolbar is not overridden after editing
                      // text in modal window.
                      CKEDITOR.config.toolbar = toolbar;
                      if ($(editor).hasClass('cke_focus') == false) {
                        CKEDITOR.inline(editor);
                      }
                      $(this).off(event);
                    });
                  }
                }
              });
            }
            $(this).find('.ckeditor-inline').bind('click', function() {
              // Added message to prevent leaving page without saving.
              window.attachOnLoad = true;
            });
          });
        }
        // Check exist CKEDITOR.
        if ('CKEDITOR' in window) {
          ckeditor_add_inline_editor();
        }
        else {
          // Load CKEDITOR.
          glazed_add_js({
            path: 'vendor/ckeditor/ckeditor.js',
            callback: function() {
              if (_.isObject(CKEDITOR)) {
                ckeditor_add_inline_editor();
              }
            }
          });
        }
      }).trigger('CKinlineAttach');

      // Update dom elements after save.
      $('button.control.save-container').on('click', function() {
        window.attachOnLoad = false;
        $(window).trigger('CKinlineAttach');
      });

      // Disable and inline ckeditor-inline.
      $('.controls .control.toggle-editor').bind('click', function() {
        var container = '.wrap-containers .glazed';
        $(container).each(function() {
          var $this = $(this);
          if ($this.hasClass('glazed-editor')) {
            $this.find('.az-element.az-text .ckeditor-inline, .az-element.az-blockquote .ckeditor-inline').each(function () {
              var $this = $(this);
              $this.attr('contenteditable', true);

              // Initialized editor.
              var editor = $this[0];
              if (typeof editor != "undefined") {
                $(editor).bind('click', function (event) {
                  CKEDITOR.inline(editor);
                  $(this).off(event);
                });
              }
            });
          }
          else {
            $(this).find('.az-element.az-text .ckeditor-inline, .az-element.az-blockquote .ckeditor-inline').each(function () {
              var $this = $(this);
              $this.attr('contenteditable', false);
              $this.off('click');
            });

            // Destroy instances.
            for (var name in CKEDITOR.instances) {
              CKEDITOR.instances[name].destroy();
            }
          }
        });
      });

      // Remove Glazed Builder Popovers on Click Body
      $(document).on('click', function (e) {
        if (!$(e.target).is('.glazed-builder-popover')) {
          $('.glazed-builder-popover').popover('hide');
        }
      });
    }
  }

})(window.jQuery);
