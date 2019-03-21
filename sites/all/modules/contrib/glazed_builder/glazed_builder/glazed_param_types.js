(function($) {
  var p = '';
  var fp = '';
  if ('glazed_prefix' in window) {
    p = window.glazed_prefix;
    fp = window.glazed_prefix.replace('-', '_');
  }

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

  function t(text) {
    if ('glazed_t' in window) {
      return window.glazed_t(text);
    }
    else {
      return text;
    }
  }

  window.glazed_open_popup = function(url) {
    window.open(url, '', 'location,width=800,height=600,top=0');
  }

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

  function image_select(input) {
    images_select(input, '');
  }

  function images_select(input, delimiter) {
    if ('images_select' in window) {
      window.images_select(input, delimiter);
    }
    else {
      // 23/12/2016 removed code for proprietary file manager ~Jur
    }
  }

  function colorpicker(input) {
    if ('wpColorPicker' in $.fn) {
      $(input).wpColorPicker();
      _.defer(function() {
        $(input).wpColorPicker({
          change: _.throttle(function() {
            $(input).trigger('change');
          }, 1000)
        });
      });
    }
    else {
      window.wpColorPickerL10n = {
        "clear": Drupal.t("Clear"),
        "defaultString": Drupal.t("Default"),
        "pick": Drupal.t("Select Color"),
        "current": Drupal.t("Current Color")
      }
      glazed_add_js({
        path: 'vendor/jquery.iris/dist/iris.min.js?v1',
        callback: function() {
          glazed_add_js({
            path: 'js/glazed.iris.js',
            callback: function() {
              glazed_add_css('css/color-picker.min.css', function() {
                $(input).wpColorPicker();
              });
            }
          });
        }
      });
    }
  }

  function nouislider(slider, min, max, value, step, target) {
    glazed_add_css('vendor/noUiSlider/jquery.nouislider.min.css', function() {});
    glazed_add_js({
      path: 'vendor/noUiSlider/jquery.nouislider.min.js',
      callback: function() {
        $(slider).noUiSlider({
          start: [(value == '' || isNaN(parseFloat(value)) || value == 'NaN') ? min : parseFloat(value)],
          step: parseFloat(step),
          range: {
            min: [parseFloat(min)],
            max: [parseFloat(max)]
          },
        }).on('change', function() {
          $(target).val($(slider).val());
        });
      }
    });
  }

  function initBootstrapSlider(slider, min, max, value, step, formatter) {
    glazed_add_css('vendor/bootstrap-slider/bootstrap-slider.min.css', function() {});
    glazed_add_js({
      path: 'vendor/bootstrap-slider/bootstrap-slider.min.js',
      callback: function () {
        if (formatter) {
          $(slider).bootstrapSlider({
            step: parseFloat(step),
            min: parseFloat(min),
            max: parseFloat(max),
            tooltip: 'hide',
            value: (value == '' || isNaN(parseFloat(value)) || value == 'NaN') ? min : parseFloat(value),
            formatter: function (value) {
              return value + ' px';
            },
          });
        } else {
          $(slider).bootstrapSlider({
            step: parseFloat(step),
            min: parseFloat(min),
            max: parseFloat(max),
            tooltip: 'hide',
            value: (value == '' || isNaN(parseFloat(value)) || value == 'NaN') ? min : parseFloat(value),
          });
        }
      }
    });
  }

  function initBootstrapSwitch(element) {
    glazed_add_css('vendor/bootstrap-switch/bootstrap-switch.min.css', function () {
    });
    glazed_add_js({
      path: 'vendor/bootstrap-switch/bootstrap-switch.min.js',
      callback: function () {
        $(element).find('[type="checkbox"]').bootstrapSwitch({
          onColor: "success",
          onText: "On",
          offText: "Off",
          size: "small",
        }).on('switchChange.bootstrapSwitch', function(event, state) {
          $(this).trigger('change');
        });
      }
    });
  }

  function render_image(value, width, height) {
    if ($.isNumeric(width))
      width = width + 'px';
    if ($.isNumeric(height))
      height = height + 'px';
    var img = $('<div style="background-image: url(' + encodeURI(value) + ');" data-src="' + value + '" ></div>');
    if (width.length > 0)
      $(img).css('width', width);
    if (height.length > 0)
      $(img).css('height', height);
    return img;
  }

  var icons = [];
  if ('glazed_icons' in window)
    icons = window.glazed_icons;

  var glazed_param_types = [

  {
    type: 'bootstrap_slider',
    create: function() {
      this.min = 0;
      this.max = 100;
      this.step = 1;
      this.formatter = false;
    },
    get_value: function() {
      var v = $(this.dom_element).find('input[name="' + this.param_name + '"]').val();
      return (v == '') ? NaN : parseFloat(v).toString();
    },
    render: function(value) {
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><input class="form-control" name="' + this.param_name +
        '" type="text" value="' + value + '"></div><p class="help-block">' +
        this.description + '</p></div>');
    },
    opened: function() {
      initBootstrapSlider(
        $(this.dom_element).find('input[name="' + this.param_name + '"]'),
        this.min,
        this.max,
        this.get_value(),
        this.step,
        this.formatter);
    },
  },

  {
    type: 'checkbox',
    get_value: function() {
      var values = [];
      _.each($(this.dom_element).find('input[name="' + this.param_name + '"]:checked'), function(obj) {
        values.push($(obj).val());
      });
      return values.join(',');
    },
    render: function(value) {
      if (value == null)
        value = '';
      var values = value.split(',');
      var inputs = '';
      var count = Object.keys(this.value).length;
      if (count == 1) {
        for (var name in this.value) {
          if (_.indexOf(values, name) >= 0) {
            inputs += '<div class="checkbox"><input name="' + this.param_name +
              '" type="checkbox" checked value="' + name + '"></div>';
          }
          else {
            inputs += '<div class="checkbox"><input name="' + this.param_name +
              '" type="checkbox" value="' + name + '"></div>';
          }
        }
        this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading + '</label><div class="wrap-checkbox">' + inputs +
          '</div><p class="help-block">' + this.description + '</p>');
        initBootstrapSwitch(this.dom_element);
      } else {
        for (var name in this.value) {
          if (_.indexOf(values, name) >= 0) {
            inputs += '<div class="checkbox"><label><input name="' + this.param_name +
              '" type="checkbox" checked value="' + name + '">' + this.value[name] + '</label></div>';
          }
          else {
            inputs += '<div class="checkbox"><label><input name="' + this.param_name +
              '" type="checkbox" value="' + name + '">' + this.value[name] + '</label></div>';
          }
        }
        this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading + '</label><div class="wrap-checkbox">' + inputs +
          '</div><p class="help-block">' + this.description + '</p>');
      }
    }
  },

  {
    type: 'checkboxes',
      get_value: function() {
      var values = [];
      _.each($(this.dom_element).find('input[name="' + this.param_name + '"]:checked'), function(obj) {
        values.push($(obj).val());
      });
      return values.join(',');
    },
    render: function(value) {
      if (value == null)
        value = '';
      var values = value.split(',');
      var inputs = '';
      if (value == '') {
        for (var name in this.value) {
          inputs += '<label>' + this.value[name] + '</label><div class="wrap-checkbox"><div class="checkbox"><input name="' + this.param_name +
            '" type="checkbox" checked value="' + name + '"></div></div>';
        }
      } else {
        for (var name in this.value) {
          if (_.indexOf(values, name) >= 0) {
            inputs += '<label>' + this.value[name] + '</label><div class="wrap-checkbox"><div class="checkbox"><input name="' + this.param_name +
              '" type="checkbox" checked value="' + name + '"></div></div>';
          }
          else {
            inputs += '<label>' + this.value[name] + '</label><div class="wrap-checkbox"><div class="checkbox"><input name="' + this.param_name +
              '" type="checkbox" value="' + name + '"></div></div>';
          }
        }
      }
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '">' + inputs +
        '<p class="help-block">' + this.description + '</p>');
      initBootstrapSwitch(this.dom_element);
    }
  },

  {
    type: 'colorpicker',
    get_value: function() {
      return $(this.dom_element).find('#' + this.id).val();
    },
    render: function(value) {
      this.id = _.uniqueId();
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><input id="' + this.id + '" name="' + this.param_name + '" type="text" value="' + value +
        '"></div><p class="help-block">' + this.description + '</p></div>');
    },
    opened: function() {
      colorpicker('#' + this.id);
    },
  },

  {
    type: 'css',
    safe: false,
    get_value: function() {
      return $(this.dom_element).find('#' + this.id).val();
    },
    opened: function() {
      var param = this;
      glazed_add_js({
        path: 'vendor/ace/ace.js',
        callback: function() {
          var aceeditor = ace.edit(param.id);
          aceeditor.setTheme("ace/theme/chrome");
          aceeditor.getSession().setMode("ace/mode/css");
          aceeditor.setOptions({
            minLines: 10,
            maxLines: 30,
          });
          $(param.dom_element).find('#' + param.id).val(aceeditor.getSession().getValue());
          aceeditor.on(
            'change',
            function(e) {
              $(param.dom_element).find('#' + param.id).val(aceeditor.getSession().getValue());
              aceeditor.resize();
            }
          );
        }
      });
    },
    render: function(value) {
      this.id = _.uniqueId();
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading + '</label><div id="' +
        this.id + '"><textarea class="form-control" rows="10" cols="45" name="' + this.param_name +
        '" ">' + value + '</textarea></div><p class="help-block">' + this.description + '</p></div>'
      );
    },
  },

  {
    type: 'datetime',
    create: function() {
      this.formatDate = '';
      this.formatTime = '';
      this.timepicker = false;
      this.datepicker = false;
    },
    get_value: function() {
      return $(this.dom_element).find('input[name="' + this.param_name + '"]').val();
    },
    render: function(value) {
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><input class="form-control" name="' + this.param_name +
        '" type="text" value="' + value + '"></div><p class="help-block">' + this.description +
        '</p></div>');
    },
    opened: function() {
      var param = this;
      glazed_add_css('vendor/datetimepicker/jquery.datetimepicker.css', function() {});
      glazed_add_js({
        path: 'vendor/datetimepicker/jquery.datetimepicker.js',
        callback: function() {
          if (param.datepicker && param.timepicker)
            param.format = param.formatDate + ' ' + param.formatTime;
          if (param.datepicker && !param.timepicker)
            param.format = param.formatDate;
          if (!param.datepicker && param.timepicker)
            param.format = param.formatTime;
          $(param.dom_element).find('input[name="' + param.param_name + '"]').datetimepicker({
            format: param.format,
            timepicker: param.timepicker,
            datepicker: param.datepicker,
            inline: true,
          });
        }
      });
    },
  },

  {
    type: 'dropdown',
    get_value: function () {
      if (Object.keys(this.value).length < 10) {
        var val = $(this.dom_element).find('input[name="' + this.param_name + '"]:checked').val();
        if (typeof val != 'undefined')
          return val;
      } else {
        return $(this.dom_element).find('select[name="' + this.param_name + '"] > option:selected').val();
      }
    },
    render: function (value) {
      var content = '<div class="form-radios">';
      if (Object.keys(this.value).length < 10) {
        /* Render radios */
        var inValue = value in this.value;
        for (var name in this.value) {
          var radio = '';
          var inputName = (name == '') ? 'default' : name;
          var id = 'dropdown-' + this.param_name + '-' + inputName;
          if (!inValue) {
            radio += '<div class="form-item form-type-radio">'
              + '<input type="radio" id="' + id + '" name="' + this.param_name + '" value="' + name + '" checked="checked" class="form-radio">'
              + '<label class="option" for="' + id + '">' + this.value[name] + ' </label>'
              + '</div>';
            inValue = true;
          } else {
            if (name == value) {
              radio += '<div class="form-item form-type-radio">'
                + '<input type="radio" id="' + id + '" name="' + this.param_name + '" value="' + name + '" checked="checked" class="form-radio">'
                + '<label class="option" for="' + id + '">' + this.value[name] + ' </label>'
                + '</div>';
            }
            else {
              radio += '<div class="form-item form-type-radio">'
                + '<input type="radio" id="' + id + '" name="' + this.param_name + '" value="' + name + '" class="form-radio">'
                + '<label class="option" for="' + id + '">' + this.value[name] + ' </label>'
                + '</div>';
            }
          }
          content += radio;
        }
        content += '</div>';
      } else {
        /* Render select */
        content = '<select name="' + this.param_name + '" class="form-control">';
        for (var name in this.value) {
          var option = '';
          if (name == value) {
            option = '<option selected value="' + name + '">' + this.value[name] + '</option>';
          }
          else {
            option = '<option value="' + name + '">' + this.value[name] + '</option>';
          }
          content += option;
        }
        content += '/<select>';
      }
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading + '</label><div>' + content +
        '</div><p class="help-block">' + this.description + '</p></div>');
    }
  },

  {
    type: 'google_font',
    hidden: !'glazed_google_fonts' in window,
    get_value: function() {
      var font = $(this.dom_element).find('input[name="' + this.param_name + '"]').val();
      var subset = $(this.dom_element).find('input[name="' + this.param_name + '_subset"]').val();
      var variant = $(this.dom_element).find('input[name="' + this.param_name + '_variant"]').val();
      return font + '|' + subset + '|' + variant;
    },
    render: function(value) {
      var font = '';
      var subset = '';
      var variant = '';
      if (_.isString(value) && value != '' && value.split('|').length == 3) {
        font = value.split('|')[0];
        subset = value.split('|')[1];
        variant = value.split('|')[2];
      }
      var font_input = '<div class="col-sm-4"><label>' + this.heading + '</label><input class="form-control" name="' + this.param_name + '" type="text" value="' + font + '"></div>';
      var subset_input = '<div class="col-sm-4"><label>' + Drupal.t('Subset') + '</label><input class="form-control" name="' + this.param_name + '_subset" type="text" value="' + subset + '"></div>';
      var variant_input = '<div class="col-sm-4"><label>' + Drupal.t('Variant') + '</label><input class="' +
        'form-control" name="' + this.param_name + '_variant" type="text" value="' + variant + '"></div>';
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><div class="row">' + font_input +
        subset_input + variant_input + '</div><p class="help-block">' + this.description +
        '</p></div>');
    },
    opened: function() {
      var element = this;
      var fonts = Object.keys(window.glazed_google_fonts);
      fonts = _.object(fonts, fonts);
      var font_select = null;
      var subset_select = null;
      var variant_select = null;
      font_select = chosen_select(fonts, $(this.dom_element).find('input[name="' + this.param_name + '"]'));
      $(font_select).chosen().change(function() {
        var f = Object.keys(window.glazed_google_fonts)[0];
        if ($(this).val() in window.glazed_google_fonts)
          f = window.glazed_google_fonts[$(this).val()];
        var subsets = {};
        for (var i = 0; i < f.subsets.length; i++) {
          subsets[f.subsets[i].id] = f.subsets[i].name;
        }
        var variants = {};
        for (var i = 0; i < f.variants.length; i++) {
          variants[f.variants[i].id] = f.variants[i].name;
        }

        $(subset_select).parent().find('.direct-input').click();
        subset_select = chosen_select(subsets, $(element.dom_element).find('input[name="' + element.param_name +
          '_subset"]'));

        $(variant_select).parent().find('.direct-input').click();
        variant_select = chosen_select(variants, $(element.dom_element).find('input[name="' + element.param_name +
          '_variant"]'));
      });
      $(font_select).chosen().trigger('change');
    },
  },

  {
    type: 'html',
    safe: false,
    get_value: function() {
      return $(this.dom_element).find('#' + this.id).val();
    },
    opened: function() {
      var param = this;
      glazed_add_js({
        path: 'vendor/ace/ace.js',
        callback: function() {
          var aceeditor = ace.edit(param.id);
          aceeditor.setTheme("ace/theme/chrome");
          aceeditor.getSession().setMode("ace/mode/html");
          aceeditor.setOptions({
            minLines: 10,
            maxLines: 30,
          });
          $(param.dom_element).find('#' + param.id).val(aceeditor.getSession().getValue());
          aceeditor.on(
            'change',
            function(e) {
              $(param.dom_element).find('#' + param.id).val(aceeditor.getSession().getValue());
              aceeditor.resize();
            }
          );
        }
      });
    },
    render: function(value) {
      this.id = _.uniqueId();
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading + '</label><div id="' +
        this.id + '"><textarea class="form-control" rows="10" cols="45" name="' + this.param_name +
        '" ">' + value + '</textarea></div><p class="help-block">' + this.description + '</p></div>'
      );
    },
  },

  {
    type: 'icon',
    icons: [
    // Glyphicons
    'glyphicon glyphicon-asterisk', 'glyphicon glyphicon-plus', 'glyphicon glyphicon-euro', 'glyphicon glyphicon-minus', 'glyphicon glyphicon-cloud', 'glyphicon glyphicon-envelope', 'glyphicon glyphicon-pencil', 'glyphicon glyphicon-glass', 'glyphicon glyphicon-music', 'glyphicon glyphicon-search', 'glyphicon glyphicon-heart', 'glyphicon glyphicon-star', 'glyphicon glyphicon-star-empty', 'glyphicon glyphicon-user', 'glyphicon glyphicon-film', 'glyphicon glyphicon-th-large', 'glyphicon glyphicon-th', 'glyphicon glyphicon-th-list', 'glyphicon glyphicon-ok', 'glyphicon glyphicon-remove', 'glyphicon glyphicon-zoom-in', 'glyphicon glyphicon-zoom-out', 'glyphicon glyphicon-off', 'glyphicon glyphicon-signal', 'glyphicon glyphicon-cog', 'glyphicon glyphicon-trash', 'glyphicon glyphicon-home', 'glyphicon glyphicon-file', 'glyphicon glyphicon-time', 'glyphicon glyphicon-road', 'glyphicon glyphicon-download-alt', 'glyphicon glyphicon-download', 'glyphicon glyphicon-upload', 'glyphicon glyphicon-inbox', 'glyphicon glyphicon-play-circle', 'glyphicon glyphicon-repeat', 'glyphicon glyphicon-refresh', 'glyphicon glyphicon-list-alt', 'glyphicon glyphicon-lock', 'glyphicon glyphicon-flag', 'glyphicon glyphicon-headphones', 'glyphicon glyphicon-volume-off', 'glyphicon glyphicon-volume-down', 'glyphicon glyphicon-volume-up', 'glyphicon glyphicon-qrcode', 'glyphicon glyphicon-barcode', 'glyphicon glyphicon-tag', 'glyphicon glyphicon-tags', 'glyphicon glyphicon-book', 'glyphicon glyphicon-bookmark', 'glyphicon glyphicon-print', 'glyphicon glyphicon-camera', 'glyphicon glyphicon-font', 'glyphicon glyphicon-bold', 'glyphicon glyphicon-italic', 'glyphicon glyphicon-text-height', 'glyphicon glyphicon-text-width', 'glyphicon glyphicon-align-left', 'glyphicon glyphicon-align-center', 'glyphicon glyphicon-align-right', 'glyphicon glyphicon-align-justify', 'glyphicon glyphicon-list', 'glyphicon glyphicon-indent-left', 'glyphicon glyphicon-indent-right', 'glyphicon glyphicon-facetime-video', 'glyphicon glyphicon-picture', 'glyphicon glyphicon-map-marker', 'glyphicon glyphicon-adjust', 'glyphicon glyphicon-tint', 'glyphicon glyphicon-edit', 'glyphicon glyphicon-share', 'glyphicon glyphicon-check', 'glyphicon glyphicon-move', 'glyphicon glyphicon-step-backward', 'glyphicon glyphicon-fast-backward', 'glyphicon glyphicon-backward', 'glyphicon glyphicon-play', 'glyphicon glyphicon-pause', 'glyphicon glyphicon-stop', 'glyphicon glyphicon-forward', 'glyphicon glyphicon-fast-forward', 'glyphicon glyphicon-step-forward', 'glyphicon glyphicon-eject', 'glyphicon glyphicon-chevron-left', 'glyphicon glyphicon-chevron-right', 'glyphicon glyphicon-plus-sign', 'glyphicon glyphicon-minus-sign', 'glyphicon glyphicon-remove-sign', 'glyphicon glyphicon-ok-sign', 'glyphicon glyphicon-question-sign', 'glyphicon glyphicon-info-sign', 'glyphicon glyphicon-screenshot', 'glyphicon glyphicon-remove-circle', 'glyphicon glyphicon-ok-circle', 'glyphicon glyphicon-ban-circle', 'glyphicon glyphicon-arrow-left', 'glyphicon glyphicon-arrow-right', 'glyphicon glyphicon-arrow-up', 'glyphicon glyphicon-arrow-down', 'glyphicon glyphicon-share-alt', 'glyphicon glyphicon-resize-full', 'glyphicon glyphicon-resize-small', 'glyphicon glyphicon-exclamation-sign', 'glyphicon glyphicon-gift', 'glyphicon glyphicon-leaf', 'glyphicon glyphicon-fire', 'glyphicon glyphicon-eye-open', 'glyphicon glyphicon-eye-close', 'glyphicon glyphicon-warning-sign', 'glyphicon glyphicon-plane', 'glyphicon glyphicon-calendar', 'glyphicon glyphicon-random', 'glyphicon glyphicon-comment', 'glyphicon glyphicon-magnet', 'glyphicon glyphicon-chevron-up', 'glyphicon glyphicon-chevron-down', 'glyphicon glyphicon-retweet', 'glyphicon glyphicon-shopping-cart', 'glyphicon glyphicon-folder-close', 'glyphicon glyphicon-folder-open', 'glyphicon glyphicon-resize-vertical', 'glyphicon glyphicon-resize-horizontal', 'glyphicon glyphicon-hdd', 'glyphicon glyphicon-bullhorn', 'glyphicon glyphicon-bell', 'glyphicon glyphicon-certificate', 'glyphicon glyphicon-thumbs-up', 'glyphicon glyphicon-thumbs-down', 'glyphicon glyphicon-hand-right', 'glyphicon glyphicon-hand-left', 'glyphicon glyphicon-hand-up', 'glyphicon glyphicon-hand-down', 'glyphicon glyphicon-circle-arrow-right', 'glyphicon glyphicon-circle-arrow-left', 'glyphicon glyphicon-circle-arrow-up', 'glyphicon glyphicon-circle-arrow-down', 'glyphicon glyphicon-globe', 'glyphicon glyphicon-wrench', 'glyphicon glyphicon-tasks', 'glyphicon glyphicon-filter', 'glyphicon glyphicon-briefcase', 'glyphicon glyphicon-fullscreen', 'glyphicon glyphicon-dashboard', 'glyphicon glyphicon-paperclip', 'glyphicon glyphicon-heart-empty', 'glyphicon glyphicon-link', 'glyphicon glyphicon-phone', 'glyphicon glyphicon-pushpin', 'glyphicon glyphicon-usd', 'glyphicon glyphicon-gbp', 'glyphicon glyphicon-sort', 'glyphicon glyphicon-sort-by-alphabet', 'glyphicon glyphicon-sort-by-alphabet-alt', 'glyphicon glyphicon-sort-by-order', 'glyphicon glyphicon-sort-by-order-alt', 'glyphicon glyphicon-sort-by-attributes', 'glyphicon glyphicon-sort-by-attributes-alt', 'glyphicon glyphicon-unchecked', 'glyphicon glyphicon-expand', 'glyphicon glyphicon-collapse-down', 'glyphicon glyphicon-collapse-up', 'glyphicon glyphicon-log-in', 'glyphicon glyphicon-flash', 'glyphicon glyphicon-log-out', 'glyphicon glyphicon-new-window', 'glyphicon glyphicon-record', 'glyphicon glyphicon-save', 'glyphicon glyphicon-open', 'glyphicon glyphicon-saved', 'glyphicon glyphicon-import', 'glyphicon glyphicon-export', 'glyphicon glyphicon-send', 'glyphicon glyphicon-floppy-disk', 'glyphicon glyphicon-floppy-saved', 'glyphicon glyphicon-floppy-remove', 'glyphicon glyphicon-floppy-save', 'glyphicon glyphicon-floppy-open', 'glyphicon glyphicon-credit-card', 'glyphicon glyphicon-transfer', 'glyphicon glyphicon-cutlery', 'glyphicon glyphicon-header', 'glyphicon glyphicon-compressed', 'glyphicon glyphicon-earphone', 'glyphicon glyphicon-phone-alt', 'glyphicon glyphicon-tower', 'glyphicon glyphicon-stats', 'glyphicon glyphicon-sd-video', 'glyphicon glyphicon-hd-video', 'glyphicon glyphicon-subtitles', 'glyphicon glyphicon-sound-stereo', 'glyphicon glyphicon-sound-dolby', 'glyphicon glyphicon-sound-5-1', 'glyphicon glyphicon-sound-6-1', 'glyphicon glyphicon-sound-7-1', 'glyphicon glyphicon-copyright-mark', 'glyphicon glyphicon-registration-mark', 'glyphicon glyphicon-cloud-download', 'glyphicon glyphicon-cloud-upload', 'glyphicon glyphicon-tree-conifer', 'glyphicon glyphicon-tree-deciduous',
    // ET Line icons
    'et et-icon-mobile', 'et et-icon-laptop', 'et et-icon-desktop', 'et et-icon-tablet', 'et et-icon-phone', 'et et-icon-document', 'et et-icon-documents', 'et et-icon-search', 'et et-icon-clipboard', 'et et-icon-newspaper', 'et et-icon-notebook', 'et et-icon-book-open', 'et et-icon-browser', 'et et-icon-calendar', 'et et-icon-presentation', 'et et-icon-picture', 'et et-icon-pictures', 'et et-icon-video', 'et et-icon-camera', 'et et-icon-printer', 'et et-icon-toolbox', 'et et-icon-briefcase', 'et et-icon-wallet', 'et et-icon-gift', 'et et-icon-bargraph', 'et et-icon-grid', 'et et-icon-expand', 'et et-icon-focus', 'et et-icon-edit', 'et et-icon-adjustments', 'et et-icon-ribbon', 'et et-icon-hourglass', 'et et-icon-lock', 'et et-icon-megaphone', 'et et-icon-shield', 'et et-icon-trophy', 'et et-icon-flag', 'et et-icon-map', 'et et-icon-puzzle', 'et et-icon-basket', 'et et-icon-envelope', 'et et-icon-streetsign', 'et et-icon-telescope', 'et et-icon-gears', 'et et-icon-key', 'et et-icon-paperclip', 'et et-icon-attachment', 'et et-icon-pricetags', 'et et-icon-lightbulb', 'et et-icon-layers', 'et et-icon-pencil', 'et et-icon-tools', 'et et-icon-tools-2', 'et et-icon-scissors', 'et et-icon-paintbrush', 'et et-icon-magnifying-glass', 'et et-icon-circle-compass', 'et et-icon-linegraph', 'et et-icon-mic', 'et et-icon-strategy', 'et et-icon-beaker', 'et et-icon-caution', 'et et-icon-recycle', 'et et-icon-anchor', 'et et-icon-profile-male', 'et et-icon-profile-female', 'et et-icon-bike', 'et et-icon-wine', 'et et-icon-hotairballoon', 'et et-icon-globe', 'et et-icon-genius', 'et et-icon-map-pin', 'et et-icon-dial', 'et et-icon-chat', 'et et-icon-heart', 'et et-icon-cloud', 'et et-icon-upload', 'et et-icon-download', 'et et-icon-target', 'et et-icon-hazardous', 'et et-icon-piechart', 'et et-icon-speedometer', 'et et-icon-global', 'et et-icon-compass', 'et et-icon-lifesaver', 'et et-icon-clock', 'et et-icon-aperture', 'et et-icon-quote', 'et et-icon-scope', 'et et-icon-alarmclock', 'et et-icon-refresh', 'et et-icon-happy', 'et et-icon-sad', 'et et-icon-facebook', 'et et-icon-twitter', 'et et-icon-googleplus', 'et et-icon-rss', 'et et-icon-tumblr', 'et et-icon-linkedin', 'et et-icon-dribbble',
    // Material Icons
    'material-icons mat-3d_rotation', 'material-icons mat-ac_unit', 'material-icons mat-access_alarm', 'material-icons mat-access_alarms', 'material-icons mat-access_time', 'material-icons mat-accessibility', 'material-icons mat-accessible', 'material-icons mat-account_balance', 'material-icons mat-account_balance_wallet', 'material-icons mat-account_box', 'material-icons mat-account_circle', 'material-icons mat-adb', 'material-icons mat-add', 'material-icons mat-add_a_photo', 'material-icons mat-add_alarm', 'material-icons mat-add_alert', 'material-icons mat-add_box', 'material-icons mat-add_circle', 'material-icons mat-add_circle_outline', 'material-icons mat-add_location', 'material-icons mat-add_shopping_cart', 'material-icons mat-add_to_photos', 'material-icons mat-add_to_queue', 'material-icons mat-adjust', 'material-icons mat-airline_seat_flat', 'material-icons mat-airline_seat_flat_angled', 'material-icons mat-airline_seat_individual_suite', 'material-icons mat-airline_seat_legroom_extra', 'material-icons mat-airline_seat_legroom_normal', 'material-icons mat-airline_seat_legroom_reduced', 'material-icons mat-airline_seat_recline_extra', 'material-icons mat-airline_seat_recline_normal', 'material-icons mat-airplanemode_active', 'material-icons mat-airplanemode_inactive', 'material-icons mat-airplay', 'material-icons mat-airport_shuttle', 'material-icons mat-alarm', 'material-icons mat-alarm_add', 'material-icons mat-alarm_off', 'material-icons mat-alarm_on', 'material-icons mat-album', 'material-icons mat-all_inclusive', 'material-icons mat-all_out', 'material-icons mat-android', 'material-icons mat-announcement', 'material-icons mat-apps', 'material-icons mat-archive', 'material-icons mat-arrow_back', 'material-icons mat-arrow_downward', 'material-icons mat-arrow_drop_down', 'material-icons mat-arrow_drop_down_circle', 'material-icons mat-arrow_drop_up', 'material-icons mat-arrow_forward', 'material-icons mat-arrow_upward', 'material-icons mat-art_track', 'material-icons mat-aspect_ratio', 'material-icons mat-assessment', 'material-icons mat-assignment', 'material-icons mat-assignment_ind', 'material-icons mat-assignment_late', 'material-icons mat-assignment_return', 'material-icons mat-assignment_returned', 'material-icons mat-assignment_turned_in', 'material-icons mat-assistant', 'material-icons mat-assistant_photo', 'material-icons mat-attach_file', 'material-icons mat-attach_money', 'material-icons mat-attachment', 'material-icons mat-audiotrack', 'material-icons mat-autorenew', 'material-icons mat-av_timer', 'material-icons mat-backspace', 'material-icons mat-backup', 'material-icons mat-battery_alert', 'material-icons mat-battery_charging_full', 'material-icons mat-battery_full', 'material-icons mat-battery_std', 'material-icons mat-battery_unknown', 'material-icons mat-beach_access', 'material-icons mat-beenhere', 'material-icons mat-block', 'material-icons mat-bluetooth', 'material-icons mat-bluetooth_audio', 'material-icons mat-bluetooth_connected', 'material-icons mat-bluetooth_disabled', 'material-icons mat-bluetooth_searching', 'material-icons mat-blur_circular', 'material-icons mat-blur_linear', 'material-icons mat-blur_off', 'material-icons mat-blur_on', 'material-icons mat-book', 'material-icons mat-bookmark', 'material-icons mat-bookmark_border', 'material-icons mat-border_all', 'material-icons mat-border_bottom', 'material-icons mat-border_clear', 'material-icons mat-border_color', 'material-icons mat-border_horizontal', 'material-icons mat-border_inner', 'material-icons mat-border_left', 'material-icons mat-border_outer', 'material-icons mat-border_right', 'material-icons mat-border_style', 'material-icons mat-border_top', 'material-icons mat-border_vertical', 'material-icons mat-branding_watermark', 'material-icons mat-brightness_1', 'material-icons mat-brightness_2', 'material-icons mat-brightness_3', 'material-icons mat-brightness_4', 'material-icons mat-brightness_5', 'material-icons mat-brightness_6', 'material-icons mat-brightness_7', 'material-icons mat-brightness_auto', 'material-icons mat-brightness_high', 'material-icons mat-brightness_low', 'material-icons mat-brightness_medium', 'material-icons mat-broken_image', 'material-icons mat-brush', 'material-icons mat-bubble_chart', 'material-icons mat-bug_report', 'material-icons mat-build', 'material-icons mat-burst_mode', 'material-icons mat-business', 'material-icons mat-business_center', 'material-icons mat-cached', 'material-icons mat-cake', 'material-icons mat-call', 'material-icons mat-call_end', 'material-icons mat-call_made', 'material-icons mat-call_merge', 'material-icons mat-call_missed', 'material-icons mat-call_missed_outgoing', 'material-icons mat-call_received', 'material-icons mat-call_split', 'material-icons mat-call_to_action', 'material-icons mat-camera', 'material-icons mat-camera_alt', 'material-icons mat-camera_enhance', 'material-icons mat-camera_front', 'material-icons mat-camera_rear', 'material-icons mat-camera_roll', 'material-icons mat-cancel', 'material-icons mat-card_giftcard', 'material-icons mat-card_membership', 'material-icons mat-card_travel', 'material-icons mat-casino', 'material-icons mat-cast', 'material-icons mat-cast_connected', 'material-icons mat-center_focus_strong', 'material-icons mat-center_focus_weak', 'material-icons mat-change_history', 'material-icons mat-chat', 'material-icons mat-chat_bubble', 'material-icons mat-chat_bubble_outline', 'material-icons mat-check', 'material-icons mat-check_box', 'material-icons mat-check_box_outline_blank', 'material-icons mat-check_circle', 'material-icons mat-chevron_left', 'material-icons mat-chevron_right', 'material-icons mat-child_care', 'material-icons mat-child_friendly', 'material-icons mat-chrome_reader_mode', 'material-icons mat-class', 'material-icons mat-clear', 'material-icons mat-clear_all', 'material-icons mat-close', 'material-icons mat-closed_caption', 'material-icons mat-cloud', 'material-icons mat-cloud_circle', 'material-icons mat-cloud_done', 'material-icons mat-cloud_download', 'material-icons mat-cloud_off', 'material-icons mat-cloud_queue', 'material-icons mat-cloud_upload', 'material-icons mat-code', 'material-icons mat-collections', 'material-icons mat-collections_bookmark', 'material-icons mat-color_lens', 'material-icons mat-colorize', 'material-icons mat-comment', 'material-icons mat-compare', 'material-icons mat-compare_arrows', 'material-icons mat-computer', 'material-icons mat-confirmation_number', 'material-icons mat-contact_mail', 'material-icons mat-contact_phone', 'material-icons mat-contacts', 'material-icons mat-content_copy', 'material-icons mat-content_cut', 'material-icons mat-content_paste', 'material-icons mat-control_point', 'material-icons mat-control_point_duplicate', 'material-icons mat-copyright', 'material-icons mat-create', 'material-icons mat-create_new_folder', 'material-icons mat-credit_card', 'material-icons mat-crop', 'material-icons mat-crop_16_9', 'material-icons mat-crop_3_2', 'material-icons mat-crop_5_4', 'material-icons mat-crop_7_5', 'material-icons mat-crop_din', 'material-icons mat-crop_free', 'material-icons mat-crop_landscape', 'material-icons mat-crop_original', 'material-icons mat-crop_portrait', 'material-icons mat-crop_rotate', 'material-icons mat-crop_square', 'material-icons mat-dashboard', 'material-icons mat-data_usage', 'material-icons mat-date_range', 'material-icons mat-dehaze', 'material-icons mat-delete', 'material-icons mat-delete_forever', 'material-icons mat-delete_sweep', 'material-icons mat-description', 'material-icons mat-desktop_mac', 'material-icons mat-desktop_windows', 'material-icons mat-details', 'material-icons mat-developer_board', 'material-icons mat-developer_mode', 'material-icons mat-device_hub', 'material-icons mat-devices', 'material-icons mat-devices_other', 'material-icons mat-dialer_sip', 'material-icons mat-dialpad', 'material-icons mat-directions', 'material-icons mat-directions_bike', 'material-icons mat-directions_boat', 'material-icons mat-directions_bus', 'material-icons mat-directions_car', 'material-icons mat-directions_railway', 'material-icons mat-directions_run', 'material-icons mat-directions_subway', 'material-icons mat-directions_transit', 'material-icons mat-directions_walk', 'material-icons mat-disc_full', 'material-icons mat-dns', 'material-icons mat-do_not_disturb', 'material-icons mat-do_not_disturb_alt', 'material-icons mat-do_not_disturb_off', 'material-icons mat-do_not_disturb_on', 'material-icons mat-dock', 'material-icons mat-domain', 'material-icons mat-done', 'material-icons mat-done_all', 'material-icons mat-donut_large', 'material-icons mat-donut_small', 'material-icons mat-drafts', 'material-icons mat-drag_handle', 'material-icons mat-drive_eta', 'material-icons mat-dvr', 'material-icons mat-edit', 'material-icons mat-edit_location', 'material-icons mat-eject', 'material-icons mat-email', 'material-icons mat-enhanced_encryption', 'material-icons mat-equalizer', 'material-icons mat-error', 'material-icons mat-error_outline', 'material-icons mat-euro_symbol', 'material-icons mat-ev_station', 'material-icons mat-event', 'material-icons mat-event_available', 'material-icons mat-event_busy', 'material-icons mat-event_note', 'material-icons mat-event_seat', 'material-icons mat-exit_to_app', 'material-icons mat-expand_less', 'material-icons mat-expand_more', 'material-icons mat-explicit', 'material-icons mat-explore', 'material-icons mat-exposure', 'material-icons mat-exposure_neg_1', 'material-icons mat-exposure_neg_2', 'material-icons mat-exposure_plus_1', 'material-icons mat-exposure_plus_2', 'material-icons mat-exposure_zero', 'material-icons mat-extension', 'material-icons mat-face', 'material-icons mat-fast_forward', 'material-icons mat-fast_rewind', 'material-icons mat-favorite', 'material-icons mat-favorite_border', 'material-icons mat-featured_play_list', 'material-icons mat-featured_video', 'material-icons mat-feedback', 'material-icons mat-fiber_dvr', 'material-icons mat-fiber_manual_record', 'material-icons mat-fiber_new', 'material-icons mat-fiber_pin', 'material-icons mat-fiber_smart_record', 'material-icons mat-file_download', 'material-icons mat-file_upload', 'material-icons mat-filter', 'material-icons mat-filter_1', 'material-icons mat-filter_2', 'material-icons mat-filter_3', 'material-icons mat-filter_4', 'material-icons mat-filter_5', 'material-icons mat-filter_6', 'material-icons mat-filter_7', 'material-icons mat-filter_8', 'material-icons mat-filter_9', 'material-icons mat-filter_9_plus', 'material-icons mat-filter_b_and_w', 'material-icons mat-filter_center_focus', 'material-icons mat-filter_drama', 'material-icons mat-filter_frames', 'material-icons mat-filter_hdr', 'material-icons mat-filter_list', 'material-icons mat-filter_none', 'material-icons mat-filter_tilt_shift', 'material-icons mat-filter_vintage', 'material-icons mat-find_in_page', 'material-icons mat-find_replace', 'material-icons mat-fingerprint', 'material-icons mat-first_page', 'material-icons mat-fitness_center', 'material-icons mat-flag', 'material-icons mat-flare', 'material-icons mat-flash_auto', 'material-icons mat-flash_off', 'material-icons mat-flash_on', 'material-icons mat-flight', 'material-icons mat-flight_land', 'material-icons mat-flight_takeoff', 'material-icons mat-flip', 'material-icons mat-flip_to_back', 'material-icons mat-flip_to_front', 'material-icons mat-folder', 'material-icons mat-folder_open', 'material-icons mat-folder_shared', 'material-icons mat-folder_special', 'material-icons mat-font_download', 'material-icons mat-format_align_center', 'material-icons mat-format_align_justify', 'material-icons mat-format_align_left', 'material-icons mat-format_align_right', 'material-icons mat-format_bold', 'material-icons mat-format_clear', 'material-icons mat-format_color_fill', 'material-icons mat-format_color_reset', 'material-icons mat-format_color_text', 'material-icons mat-format_indent_decrease', 'material-icons mat-format_indent_increase', 'material-icons mat-format_italic', 'material-icons mat-format_line_spacing', 'material-icons mat-format_list_bulleted', 'material-icons mat-format_list_numbered', 'material-icons mat-format_paint', 'material-icons mat-format_quote', 'material-icons mat-format_shapes', 'material-icons mat-format_size', 'material-icons mat-format_strikethrough', 'material-icons mat-format_textdirection_l_to_r', 'material-icons mat-format_textdirection_r_to_l', 'material-icons mat-format_underlined', 'material-icons mat-forum', 'material-icons mat-forward', 'material-icons mat-forward_10', 'material-icons mat-forward_30', 'material-icons mat-forward_5', 'material-icons mat-free_breakfast', 'material-icons mat-fullscreen', 'material-icons mat-fullscreen_exit', 'material-icons mat-functions', 'material-icons mat-g_translate', 'material-icons mat-gamepad', 'material-icons mat-games', 'material-icons mat-gavel', 'material-icons mat-gesture', 'material-icons mat-get_app', 'material-icons mat-gif', 'material-icons mat-golf_course', 'material-icons mat-gps_fixed', 'material-icons mat-gps_not_fixed', 'material-icons mat-gps_off', 'material-icons mat-grade', 'material-icons mat-gradient', 'material-icons mat-grain', 'material-icons mat-graphic_eq', 'material-icons mat-grid_off', 'material-icons mat-grid_on', 'material-icons mat-group', 'material-icons mat-group_add', 'material-icons mat-group_work', 'material-icons mat-hd', 'material-icons mat-hdr_off', 'material-icons mat-hdr_on', 'material-icons mat-hdr_strong', 'material-icons mat-hdr_weak', 'material-icons mat-headset', 'material-icons mat-headset_mic', 'material-icons mat-healing', 'material-icons mat-hearing', 'material-icons mat-help', 'material-icons mat-help_outline', 'material-icons mat-high_quality', 'material-icons mat-highlight', 'material-icons mat-highlight_off', 'material-icons mat-history', 'material-icons mat-home', 'material-icons mat-hot_tub', 'material-icons mat-hotel', 'material-icons mat-hourglass_empty', 'material-icons mat-hourglass_full', 'material-icons mat-http', 'material-icons mat-https', 'material-icons mat-image', 'material-icons mat-image_aspect_ratio', 'material-icons mat-import_contacts', 'material-icons mat-import_export', 'material-icons mat-important_devices', 'material-icons mat-inbox', 'material-icons mat-indeterminate_check_box', 'material-icons mat-info', 'material-icons mat-info_outline', 'material-icons mat-input', 'material-icons mat-insert_chart', 'material-icons mat-insert_comment', 'material-icons mat-insert_drive_file', 'material-icons mat-insert_emoticon', 'material-icons mat-insert_invitation', 'material-icons mat-insert_link', 'material-icons mat-insert_photo', 'material-icons mat-invert_colors', 'material-icons mat-invert_colors_off', 'material-icons mat-iso', 'material-icons mat-keyboard', 'material-icons mat-keyboard_arrow_down', 'material-icons mat-keyboard_arrow_left', 'material-icons mat-keyboard_arrow_right', 'material-icons mat-keyboard_arrow_up', 'material-icons mat-keyboard_backspace', 'material-icons mat-keyboard_capslock', 'material-icons mat-keyboard_hide', 'material-icons mat-keyboard_return', 'material-icons mat-keyboard_tab', 'material-icons mat-keyboard_voice', 'material-icons mat-kitchen', 'material-icons mat-label', 'material-icons mat-label_outline', 'material-icons mat-landscape', 'material-icons mat-language', 'material-icons mat-laptop', 'material-icons mat-laptop_chromebook', 'material-icons mat-laptop_mac', 'material-icons mat-laptop_windows', 'material-icons mat-last_page', 'material-icons mat-launch', 'material-icons mat-layers', 'material-icons mat-layers_clear', 'material-icons mat-leak_add', 'material-icons mat-leak_remove', 'material-icons mat-lens', 'material-icons mat-library_add', 'material-icons mat-library_books', 'material-icons mat-library_music', 'material-icons mat-lightbulb_outline', 'material-icons mat-line_style', 'material-icons mat-line_weight', 'material-icons mat-linear_scale', 'material-icons mat-link', 'material-icons mat-linked_camera', 'material-icons mat-list', 'material-icons mat-live_help', 'material-icons mat-live_tv', 'material-icons mat-local_activity', 'material-icons mat-local_airport', 'material-icons mat-local_atm', 'material-icons mat-local_bar', 'material-icons mat-local_cafe', 'material-icons mat-local_car_wash', 'material-icons mat-local_convenience_store', 'material-icons mat-local_dining', 'material-icons mat-local_drink', 'material-icons mat-local_florist', 'material-icons mat-local_gas_station', 'material-icons mat-local_grocery_store', 'material-icons mat-local_hospital', 'material-icons mat-local_hotel', 'material-icons mat-local_laundry_service', 'material-icons mat-local_library', 'material-icons mat-local_mall', 'material-icons mat-local_movies', 'material-icons mat-local_offer', 'material-icons mat-local_parking', 'material-icons mat-local_pharmacy', 'material-icons mat-local_phone', 'material-icons mat-local_pizza', 'material-icons mat-local_play', 'material-icons mat-local_post_office', 'material-icons mat-local_printshop', 'material-icons mat-local_see', 'material-icons mat-local_shipping', 'material-icons mat-local_taxi', 'material-icons mat-location_city', 'material-icons mat-location_disabled', 'material-icons mat-location_off', 'material-icons mat-location_on', 'material-icons mat-location_searching', 'material-icons mat-lock', 'material-icons mat-lock_open', 'material-icons mat-lock_outline', 'material-icons mat-looks', 'material-icons mat-looks_3', 'material-icons mat-looks_4', 'material-icons mat-looks_5', 'material-icons mat-looks_6', 'material-icons mat-looks_one', 'material-icons mat-looks_two', 'material-icons mat-loop', 'material-icons mat-loupe', 'material-icons mat-low_priority', 'material-icons mat-loyalty', 'material-icons mat-mail', 'material-icons mat-mail_outline', 'material-icons mat-map', 'material-icons mat-markunread', 'material-icons mat-markunread_mailbox', 'material-icons mat-memory', 'material-icons mat-menu', 'material-icons mat-merge_type', 'material-icons mat-message', 'material-icons mat-mic', 'material-icons mat-mic_none', 'material-icons mat-mic_off', 'material-icons mat-mms', 'material-icons mat-mode_comment', 'material-icons mat-mode_edit', 'material-icons mat-monetization_on', 'material-icons mat-money_off', 'material-icons mat-monochrome_photos', 'material-icons mat-mood', 'material-icons mat-mood_bad', 'material-icons mat-more', 'material-icons mat-more_horiz', 'material-icons mat-more_vert', 'material-icons mat-motorcycle', 'material-icons mat-mouse', 'material-icons mat-move_to_inbox', 'material-icons mat-movie', 'material-icons mat-movie_creation', 'material-icons mat-movie_filter', 'material-icons mat-multiline_chart', 'material-icons mat-music_note', 'material-icons mat-music_video', 'material-icons mat-my_location', 'material-icons mat-nature', 'material-icons mat-nature_people', 'material-icons mat-navigate_before', 'material-icons mat-navigate_next', 'material-icons mat-navigation', 'material-icons mat-near_me', 'material-icons mat-network_cell', 'material-icons mat-network_check', 'material-icons mat-network_locked', 'material-icons mat-network_wifi', 'material-icons mat-new_releases', 'material-icons mat-next_week', 'material-icons mat-nfc', 'material-icons mat-no_encryption', 'material-icons mat-no_sim', 'material-icons mat-not_interested', 'material-icons mat-note', 'material-icons mat-note_add', 'material-icons mat-notifications', 'material-icons mat-notifications_active', 'material-icons mat-notifications_none', 'material-icons mat-notifications_off', 'material-icons mat-notifications_paused', 'material-icons mat-offline_pin', 'material-icons mat-ondemand_video', 'material-icons mat-opacity', 'material-icons mat-open_in_browser', 'material-icons mat-open_in_new', 'material-icons mat-open_with', 'material-icons mat-pages', 'material-icons mat-pageview', 'material-icons mat-palette', 'material-icons mat-pan_tool', 'material-icons mat-panorama', 'material-icons mat-panorama_fish_eye', 'material-icons mat-panorama_horizontal', 'material-icons mat-panorama_vertical', 'material-icons mat-panorama_wide_angle', 'material-icons mat-party_mode', 'material-icons mat-pause', 'material-icons mat-pause_circle_filled', 'material-icons mat-pause_circle_outline', 'material-icons mat-payment', 'material-icons mat-people', 'material-icons mat-people_outline', 'material-icons mat-perm_camera_mic', 'material-icons mat-perm_contact_calendar', 'material-icons mat-perm_data_setting', 'material-icons mat-perm_device_information', 'material-icons mat-perm_identity', 'material-icons mat-perm_media', 'material-icons mat-perm_phone_msg', 'material-icons mat-perm_scan_wifi', 'material-icons mat-person', 'material-icons mat-person_add', 'material-icons mat-person_outline', 'material-icons mat-person_pin', 'material-icons mat-person_pin_circle', 'material-icons mat-personal_video', 'material-icons mat-pets', 'material-icons mat-phone', 'material-icons mat-phone_android', 'material-icons mat-phone_bluetooth_speaker', 'material-icons mat-phone_forwarded', 'material-icons mat-phone_in_talk', 'material-icons mat-phone_iphone', 'material-icons mat-phone_locked', 'material-icons mat-phone_missed', 'material-icons mat-phone_paused', 'material-icons mat-phonelink', 'material-icons mat-phonelink_erase', 'material-icons mat-phonelink_lock', 'material-icons mat-phonelink_off', 'material-icons mat-phonelink_ring', 'material-icons mat-phonelink_setup', 'material-icons mat-photo', 'material-icons mat-photo_album', 'material-icons mat-photo_camera', 'material-icons mat-photo_filter', 'material-icons mat-photo_library', 'material-icons mat-photo_size_select_actual', 'material-icons mat-photo_size_select_large', 'material-icons mat-photo_size_select_small', 'material-icons mat-picture_as_pdf', 'material-icons mat-picture_in_picture', 'material-icons mat-picture_in_picture_alt', 'material-icons mat-pie_chart', 'material-icons mat-pie_chart_outlined', 'material-icons mat-pin_drop', 'material-icons mat-place', 'material-icons mat-play_arrow', 'material-icons mat-play_circle_filled', 'material-icons mat-play_circle_outline', 'material-icons mat-play_for_work', 'material-icons mat-playlist_add', 'material-icons mat-playlist_add_check', 'material-icons mat-playlist_play', 'material-icons mat-plus_one', 'material-icons mat-poll', 'material-icons mat-polymer', 'material-icons mat-pool', 'material-icons mat-portable_wifi_off', 'material-icons mat-portrait', 'material-icons mat-power', 'material-icons mat-power_input', 'material-icons mat-power_settings_new', 'material-icons mat-pregnant_woman', 'material-icons mat-present_to_all', 'material-icons mat-print', 'material-icons mat-priority_high', 'material-icons mat-public', 'material-icons mat-publish', 'material-icons mat-query_builder', 'material-icons mat-question_answer', 'material-icons mat-queue', 'material-icons mat-queue_music', 'material-icons mat-queue_play_next', 'material-icons mat-radio', 'material-icons mat-radio_button_checked', 'material-icons mat-radio_button_unchecked', 'material-icons mat-rate_review', 'material-icons mat-receipt', 'material-icons mat-recent_actors', 'material-icons mat-record_voice_over', 'material-icons mat-redeem', 'material-icons mat-redo', 'material-icons mat-refresh', 'material-icons mat-remove', 'material-icons mat-remove_circle', 'material-icons mat-remove_circle_outline', 'material-icons mat-remove_from_queue', 'material-icons mat-remove_red_eye', 'material-icons mat-remove_shopping_cart', 'material-icons mat-reorder', 'material-icons mat-repeat', 'material-icons mat-repeat_one', 'material-icons mat-replay', 'material-icons mat-replay_10', 'material-icons mat-replay_30', 'material-icons mat-replay_5', 'material-icons mat-reply', 'material-icons mat-reply_all', 'material-icons mat-report', 'material-icons mat-report_problem', 'material-icons mat-restaurant', 'material-icons mat-restaurant_menu', 'material-icons mat-restore', 'material-icons mat-restore_page', 'material-icons mat-ring_volume', 'material-icons mat-room', 'material-icons mat-room_service', 'material-icons mat-rotate_90_degrees_ccw', 'material-icons mat-rotate_left', 'material-icons mat-rotate_right', 'material-icons mat-rounded_corner', 'material-icons mat-router', 'material-icons mat-rowing', 'material-icons mat-rss_feed', 'material-icons mat-rv_hookup', 'material-icons mat-satellite', 'material-icons mat-save', 'material-icons mat-scanner', 'material-icons mat-schedule', 'material-icons mat-school', 'material-icons mat-screen_lock_landscape', 'material-icons mat-screen_lock_portrait', 'material-icons mat-screen_lock_rotation', 'material-icons mat-screen_rotation', 'material-icons mat-screen_share', 'material-icons mat-sd_card', 'material-icons mat-sd_storage', 'material-icons mat-search', 'material-icons mat-security', 'material-icons mat-select_all', 'material-icons mat-send', 'material-icons mat-sentiment_dissatisfied', 'material-icons mat-sentiment_neutral', 'material-icons mat-sentiment_satisfied', 'material-icons mat-sentiment_very_dissatisfied', 'material-icons mat-sentiment_very_satisfied', 'material-icons mat-settings', 'material-icons mat-settings_applications', 'material-icons mat-settings_backup_restore', 'material-icons mat-settings_bluetooth', 'material-icons mat-settings_brightness', 'material-icons mat-settings_cell', 'material-icons mat-settings_ethernet', 'material-icons mat-settings_input_antenna', 'material-icons mat-settings_input_component', 'material-icons mat-settings_input_composite', 'material-icons mat-settings_input_hdmi', 'material-icons mat-settings_input_svideo', 'material-icons mat-settings_overscan', 'material-icons mat-settings_phone', 'material-icons mat-settings_power', 'material-icons mat-settings_remote', 'material-icons mat-settings_system_daydream', 'material-icons mat-settings_voice', 'material-icons mat-share', 'material-icons mat-shop', 'material-icons mat-shop_two', 'material-icons mat-shopping_basket', 'material-icons mat-shopping_cart', 'material-icons mat-short_text', 'material-icons mat-show_chart', 'material-icons mat-shuffle', 'material-icons mat-signal_cellular_4_bar', 'material-icons mat-signal_cellular_connected_no_internet_4_bar', 'material-icons mat-signal_cellular_no_sim', 'material-icons mat-signal_cellular_null', 'material-icons mat-signal_cellular_off', 'material-icons mat-signal_wifi_4_bar', 'material-icons mat-signal_wifi_4_bar_lock', 'material-icons mat-signal_wifi_off', 'material-icons mat-sim_card', 'material-icons mat-sim_card_alert', 'material-icons mat-skip_next', 'material-icons mat-skip_previous', 'material-icons mat-slideshow', 'material-icons mat-slow_motion_video', 'material-icons mat-smartphone', 'material-icons mat-smoke_free', 'material-icons mat-smoking_rooms', 'material-icons mat-sms', 'material-icons mat-sms_failed', 'material-icons mat-snooze', 'material-icons mat-sort', 'material-icons mat-sort_by_alpha', 'material-icons mat-spa', 'material-icons mat-space_bar', 'material-icons mat-speaker', 'material-icons mat-speaker_group', 'material-icons mat-speaker_notes', 'material-icons mat-speaker_notes_off', 'material-icons mat-speaker_phone', 'material-icons mat-spellcheck', 'material-icons mat-star', 'material-icons mat-star_border', 'material-icons mat-star_half', 'material-icons mat-stars', 'material-icons mat-stay_current_landscape', 'material-icons mat-stay_current_portrait', 'material-icons mat-stay_primary_landscape', 'material-icons mat-stay_primary_portrait', 'material-icons mat-stop', 'material-icons mat-stop_screen_share', 'material-icons mat-storage', 'material-icons mat-store', 'material-icons mat-store_mall_directory', 'material-icons mat-straighten', 'material-icons mat-streetview', 'material-icons mat-strikethrough_s', 'material-icons mat-style', 'material-icons mat-subdirectory_arrow_left', 'material-icons mat-subdirectory_arrow_right', 'material-icons mat-subject', 'material-icons mat-subscriptions', 'material-icons mat-subtitles', 'material-icons mat-subway', 'material-icons mat-supervisor_account', 'material-icons mat-surround_sound', 'material-icons mat-swap_calls', 'material-icons mat-swap_horiz', 'material-icons mat-swap_vert', 'material-icons mat-swap_vertical_circle', 'material-icons mat-switch_camera', 'material-icons mat-switch_video', 'material-icons mat-sync', 'material-icons mat-sync_disabled', 'material-icons mat-sync_problem', 'material-icons mat-system_update', 'material-icons mat-system_update_alt', 'material-icons mat-tab', 'material-icons mat-tab_unselected', 'material-icons mat-tablet', 'material-icons mat-tablet_android', 'material-icons mat-tablet_mac', 'material-icons mat-tag_faces', 'material-icons mat-tap_and_play', 'material-icons mat-terrain', 'material-icons mat-text_fields', 'material-icons mat-text_format', 'material-icons mat-textsms', 'material-icons mat-texture', 'material-icons mat-theaters', 'material-icons mat-thumb_down', 'material-icons mat-thumb_up', 'material-icons mat-thumbs_up_down', 'material-icons mat-time_to_leave', 'material-icons mat-timelapse', 'material-icons mat-timeline', 'material-icons mat-timer', 'material-icons mat-timer_10', 'material-icons mat-timer_3', 'material-icons mat-timer_off', 'material-icons mat-title', 'material-icons mat-toc', 'material-icons mat-today', 'material-icons mat-toll', 'material-icons mat-tonality', 'material-icons mat-touch_app', 'material-icons mat-toys', 'material-icons mat-track_changes', 'material-icons mat-traffic', 'material-icons mat-train', 'material-icons mat-tram', 'material-icons mat-transfer_within_a_station', 'material-icons mat-transform', 'material-icons mat-translate', 'material-icons mat-trending_down', 'material-icons mat-trending_flat', 'material-icons mat-trending_up', 'material-icons mat-tune', 'material-icons mat-turned_in', 'material-icons mat-turned_in_not', 'material-icons mat-tv', 'material-icons mat-unarchive', 'material-icons mat-undo', 'material-icons mat-unfold_less', 'material-icons mat-unfold_more', 'material-icons mat-update', 'material-icons mat-usb', 'material-icons mat-verified_user', 'material-icons mat-vertical_align_bottom', 'material-icons mat-vertical_align_center', 'material-icons mat-vertical_align_top', 'material-icons mat-vibration', 'material-icons mat-video_call', 'material-icons mat-video_label', 'material-icons mat-video_library', 'material-icons mat-videocam', 'material-icons mat-videocam_off', 'material-icons mat-videogame_asset', 'material-icons mat-view_agenda', 'material-icons mat-view_array', 'material-icons mat-view_carousel', 'material-icons mat-view_column', 'material-icons mat-view_comfy', 'material-icons mat-view_compact', 'material-icons mat-view_day', 'material-icons mat-view_headline', 'material-icons mat-view_list', 'material-icons mat-view_module', 'material-icons mat-view_quilt', 'material-icons mat-view_stream', 'material-icons mat-view_week', 'material-icons mat-vignette', 'material-icons mat-visibility', 'material-icons mat-visibility_off', 'material-icons mat-voice_chat', 'material-icons mat-voicemail', 'material-icons mat-volume_down', 'material-icons mat-volume_mute', 'material-icons mat-volume_off', 'material-icons mat-volume_up', 'material-icons mat-vpn_key', 'material-icons mat-vpn_lock', 'material-icons mat-wallpaper', 'material-icons mat-warning', 'material-icons mat-watch', 'material-icons mat-watch_later', 'material-icons mat-wb_auto', 'material-icons mat-wb_cloudy', 'material-icons mat-wb_incandescent', 'material-icons mat-wb_iridescent', 'material-icons mat-wb_sunny', 'material-icons mat-wc', 'material-icons mat-web', 'material-icons mat-web_asset', 'material-icons mat-weekend', 'material-icons mat-whatshot', 'material-icons mat-widgets', 'material-icons mat-wifi', 'material-icons mat-wifi_lock', 'material-icons mat-wifi_tethering', 'material-icons mat-work', 'material-icons mat-wrap_text', 'material-icons mat-youtube_searched_for', 'material-icons mat-zoom_in', 'material-icons mat-zoom_out', 'material-icons mat-zoom_out_map e56b',
    // Font Awesome 4
    'fa fa-500px', 'fa fa-address-book', 'fa fa-address-book-o', 'fa fa-address-card', 'fa fa-address-card-o', 'fa fa-adjust', 'fa fa-adn', 'fa fa-align-center', 'fa fa-align-justify', 'fa fa-align-left', 'fa fa-align-right', 'fa fa-amazon', 'fa fa-ambulance', 'fa fa-american-sign-language-interpreting', 'fa fa-anchor', 'fa fa-android', 'fa fa-angellist', 'fa fa-angle-double-down', 'fa fa-angle-double-left', 'fa fa-angle-double-right', 'fa fa-angle-double-up', 'fa fa-angle-down', 'fa fa-angle-left', 'fa fa-angle-right', 'fa fa-angle-up', 'fa fa-apple', 'fa fa-archive', 'fa fa-area-chart', 'fa fa-arrow-circle-down', 'fa fa-arrow-circle-left', 'fa fa-arrow-circle-o-down', 'fa fa-arrow-circle-o-left', 'fa fa-arrow-circle-o-right', 'fa fa-arrow-circle-o-up', 'fa fa-arrow-circle-right', 'fa fa-arrow-circle-up', 'fa fa-arrow-down', 'fa fa-arrow-left', 'fa fa-arrow-right', 'fa fa-arrow-up', 'fa fa-arrows', 'fa fa-arrows-alt', 'fa fa-arrows-h', 'fa fa-arrows-v', 'fa fa-assistive-listening-systems', 'fa fa-asterisk', 'fa fa-at', 'fa fa-audio-description', 'fa fa-backward', 'fa fa-balance-scale', 'fa fa-ban', 'fa fa-bandcamp', 'fa fa-bar-chart', 'fa fa-barcode', 'fa fa-bars', 'fa fa-bath', 'fa fa-battery-empty', 'fa fa-battery-full', 'fa fa-battery-half', 'fa fa-battery-quarter', 'fa fa-battery-three-quarters', 'fa fa-bed', 'fa fa-beer', 'fa fa-behance', 'fa fa-behance-square', 'fa fa-bell', 'fa fa-bell-o', 'fa fa-bell-slash', 'fa fa-bell-slash-o', 'fa fa-bicycle', 'fa fa-binoculars', 'fa fa-birthday-cake', 'fa fa-bitbucket', 'fa fa-bitbucket-square', 'fa fa-black-tie', 'fa fa-blind', 'fa fa-bluetooth', 'fa fa-bluetooth-b', 'fa fa-bold', 'fa fa-bolt', 'fa fa-bomb', 'fa fa-book', 'fa fa-bookmark', 'fa fa-bookmark-o', 'fa fa-braille', 'fa fa-briefcase', 'fa fa-btc', 'fa fa-bug', 'fa fa-building', 'fa fa-building-o', 'fa fa-bullhorn', 'fa fa-bullseye', 'fa fa-bus', 'fa fa-buysellads', 'fa fa-calculator', 'fa fa-calendar', 'fa fa-calendar-check-o', 'fa fa-calendar-minus-o', 'fa fa-calendar-o', 'fa fa-calendar-plus-o', 'fa fa-calendar-times-o', 'fa fa-camera', 'fa fa-camera-retro', 'fa fa-car', 'fa fa-caret-down', 'fa fa-caret-left', 'fa fa-caret-right', 'fa fa-caret-square-o-down', 'fa fa-caret-square-o-left', 'fa fa-caret-square-o-right', 'fa fa-caret-square-o-up', 'fa fa-caret-up', 'fa fa-cart-arrow-down', 'fa fa-cart-plus', 'fa fa-cc', 'fa fa-cc-amex', 'fa fa-cc-diners-club', 'fa fa-cc-discover', 'fa fa-cc-jcb', 'fa fa-cc-mastercard', 'fa fa-cc-paypal', 'fa fa-cc-stripe', 'fa fa-cc-visa', 'fa fa-certificate', 'fa fa-chain-broken', 'fa fa-check', 'fa fa-check-circle', 'fa fa-check-circle-o', 'fa fa-check-square', 'fa fa-check-square-o', 'fa fa-chevron-circle-down', 'fa fa-chevron-circle-left', 'fa fa-chevron-circle-right', 'fa fa-chevron-circle-up', 'fa fa-chevron-down', 'fa fa-chevron-left', 'fa fa-chevron-right', 'fa fa-chevron-up', 'fa fa-child', 'fa fa-chrome', 'fa fa-circle', 'fa fa-circle-o', 'fa fa-circle-o-notch', 'fa fa-circle-thin', 'fa fa-clipboard', 'fa fa-clock-o', 'fa fa-clone', 'fa fa-cloud', 'fa fa-cloud-download', 'fa fa-cloud-upload', 'fa fa-code', 'fa fa-code-fork', 'fa fa-codepen', 'fa fa-codiepie', 'fa fa-coffee', 'fa fa-cog', 'fa fa-cogs', 'fa fa-columns', 'fa fa-comment', 'fa fa-comment-o', 'fa fa-commenting', 'fa fa-commenting-o', 'fa fa-comments', 'fa fa-comments-o', 'fa fa-compass', 'fa fa-compress', 'fa fa-connectdevelop', 'fa fa-contao', 'fa fa-copyright', 'fa fa-creative-commons', 'fa fa-credit-card', 'fa fa-credit-card-alt', 'fa fa-crop', 'fa fa-crosshairs', 'fa fa-css3', 'fa fa-cube', 'fa fa-cubes', 'fa fa-cutlery', 'fa fa-dashcube', 'fa fa-database', 'fa fa-deaf', 'fa fa-delicious', 'fa fa-desktop', 'fa fa-deviantart', 'fa fa-diamond', 'fa fa-digg', 'fa fa-dot-circle-o', 'fa fa-download', 'fa fa-dribbble', 'fa fa-dropbox', 'fa fa-drupal', 'fa fa-edge', 'fa fa-eercast', 'fa fa-eject', 'fa fa-ellipsis-h', 'fa fa-ellipsis-v', 'fa fa-empire', 'fa fa-envelope', 'fa fa-envelope-o', 'fa fa-envelope-open', 'fa fa-envelope-open-o', 'fa fa-envelope-square', 'fa fa-envira', 'fa fa-eraser', 'fa fa-etsy', 'fa fa-eur', 'fa fa-exchange', 'fa fa-exclamation', 'fa fa-exclamation-circle', 'fa fa-exclamation-triangle', 'fa fa-expand', 'fa fa-expeditedssl', 'fa fa-external-link', 'fa fa-external-link-square', 'fa fa-eye', 'fa fa-eye-slash', 'fa fa-eyedropper', 'fa fa-facebook', 'fa fa-facebook-official', 'fa fa-facebook-square', 'fa fa-fast-backward', 'fa fa-fast-forward', 'fa fa-fax', 'fa fa-female', 'fa fa-fighter-jet', 'fa fa-file', 'fa fa-file-archive-o', 'fa fa-file-audio-o', 'fa fa-file-code-o', 'fa fa-file-excel-o', 'fa fa-file-image-o', 'fa fa-file-o', 'fa fa-file-pdf-o', 'fa fa-file-powerpoint-o', 'fa fa-file-text', 'fa fa-file-text-o', 'fa fa-file-video-o', 'fa fa-file-word-o', 'fa fa-files-o', 'fa fa-film', 'fa fa-filter', 'fa fa-fire', 'fa fa-fire-extinguisher', 'fa fa-firefox', 'fa fa-first-order', 'fa fa-flag', 'fa fa-flag-checkered', 'fa fa-flag-o', 'fa fa-flask', 'fa fa-flickr', 'fa fa-floppy-o', 'fa fa-folder', 'fa fa-folder-o', 'fa fa-folder-open', 'fa fa-folder-open-o', 'fa fa-font', 'fa fa-font-awesome', 'fa fa-fonticons', 'fa fa-fort-awesome', 'fa fa-forumbee', 'fa fa-forward', 'fa fa-foursquare', 'fa fa-free-code-camp', 'fa fa-frown-o', 'fa fa-futbol-o', 'fa fa-gamepad', 'fa fa-gavel', 'fa fa-gbp', 'fa fa-genderless', 'fa fa-get-pocket', 'fa fa-gg', 'fa fa-gg-circle', 'fa fa-gift', 'fa fa-git', 'fa fa-git-square', 'fa fa-github', 'fa fa-github-alt', 'fa fa-github-square', 'fa fa-gitlab', 'fa fa-glass', 'fa fa-glide', 'fa fa-glide-g', 'fa fa-globe', 'fa fa-google', 'fa fa-google-plus', 'fa fa-google-plus-official', 'fa fa-google-plus-square', 'fa fa-google-wallet', 'fa fa-graduation-cap', 'fa fa-gratipay', 'fa fa-grav', 'fa fa-h-square', 'fa fa-hacker-news', 'fa fa-hand-lizard-o', 'fa fa-hand-o-down', 'fa fa-hand-o-left', 'fa fa-hand-o-right', 'fa fa-hand-o-up', 'fa fa-hand-paper-o', 'fa fa-hand-peace-o', 'fa fa-hand-pointer-o', 'fa fa-hand-rock-o', 'fa fa-hand-scissors-o', 'fa fa-hand-spock-o', 'fa fa-handshake-o', 'fa fa-hashtag', 'fa fa-hdd-o', 'fa fa-header', 'fa fa-headphones', 'fa fa-heart', 'fa fa-heart-o', 'fa fa-heartbeat', 'fa fa-history', 'fa fa-home', 'fa fa-hospital-o', 'fa fa-hourglass', 'fa fa-hourglass-end', 'fa fa-hourglass-half', 'fa fa-hourglass-o', 'fa fa-hourglass-start', 'fa fa-houzz', 'fa fa-html5', 'fa fa-i-cursor', 'fa fa-id-badge', 'fa fa-id-card', 'fa fa-id-card-o', 'fa fa-ils', 'fa fa-imdb', 'fa fa-inbox', 'fa fa-indent', 'fa fa-industry', 'fa fa-info', 'fa fa-info-circle', 'fa fa-inr', 'fa fa-instagram', 'fa fa-internet-explorer', 'fa fa-ioxhost', 'fa fa-italic', 'fa fa-joomla', 'fa fa-jpy', 'fa fa-jsfiddle', 'fa fa-key', 'fa fa-keyboard-o', 'fa fa-krw', 'fa fa-language', 'fa fa-laptop', 'fa fa-lastfm', 'fa fa-lastfm-square', 'fa fa-leaf', 'fa fa-leanpub', 'fa fa-lemon-o', 'fa fa-level-down', 'fa fa-level-up', 'fa fa-life-ring', 'fa fa-lightbulb-o', 'fa fa-line-chart', 'fa fa-link', 'fa fa-linkedin', 'fa fa-linkedin-square', 'fa fa-linode', 'fa fa-linux', 'fa fa-list', 'fa fa-list-alt', 'fa fa-list-ol', 'fa fa-list-ul', 'fa fa-location-arrow', 'fa fa-lock', 'fa fa-long-arrow-down', 'fa fa-long-arrow-left', 'fa fa-long-arrow-right', 'fa fa-long-arrow-up', 'fa fa-low-vision', 'fa fa-magic', 'fa fa-magnet', 'fa fa-male', 'fa fa-map', 'fa fa-map-marker', 'fa fa-map-o', 'fa fa-map-pin', 'fa fa-map-signs', 'fa fa-mars', 'fa fa-mars-double', 'fa fa-mars-stroke', 'fa fa-mars-stroke-h', 'fa fa-mars-stroke-v', 'fa fa-maxcdn', 'fa fa-meanpath', 'fa fa-medium', 'fa fa-medkit', 'fa fa-meetup', 'fa fa-meh-o', 'fa fa-mercury', 'fa fa-microchip', 'fa fa-microphone', 'fa fa-microphone-slash', 'fa fa-minus', 'fa fa-minus-circle', 'fa fa-minus-square', 'fa fa-minus-square-o', 'fa fa-mixcloud', 'fa fa-mobile', 'fa fa-modx', 'fa fa-money', 'fa fa-moon-o', 'fa fa-motorcycle', 'fa fa-mouse-pointer', 'fa fa-music', 'fa fa-neuter', 'fa fa-newspaper-o', 'fa fa-object-group', 'fa fa-object-ungroup', 'fa fa-odnoklassniki', 'fa fa-odnoklassniki-square', 'fa fa-opencart', 'fa fa-openid', 'fa fa-opera', 'fa fa-optin-monster', 'fa fa-outdent', 'fa fa-pagelines', 'fa fa-paint-brush', 'fa fa-paper-plane', 'fa fa-paper-plane-o', 'fa fa-paperclip', 'fa fa-paragraph', 'fa fa-pause', 'fa fa-pause-circle', 'fa fa-pause-circle-o', 'fa fa-paw', 'fa fa-paypal', 'fa fa-pencil', 'fa fa-pencil-square', 'fa fa-pencil-square-o', 'fa fa-percent', 'fa fa-phone', 'fa fa-phone-square', 'fa fa-picture-o', 'fa fa-pie-chart', 'fa fa-pied-piper', 'fa fa-pied-piper-alt', 'fa fa-pied-piper-pp', 'fa fa-pinterest', 'fa fa-pinterest-p', 'fa fa-pinterest-square', 'fa fa-plane', 'fa fa-play', 'fa fa-play-circle', 'fa fa-play-circle-o', 'fa fa-plug', 'fa fa-plus', 'fa fa-plus-circle', 'fa fa-plus-square', 'fa fa-plus-square-o', 'fa fa-podcast', 'fa fa-power-off', 'fa fa-print', 'fa fa-product-hunt', 'fa fa-puzzle-piece', 'fa fa-qq', 'fa fa-qrcode', 'fa fa-question', 'fa fa-question-circle', 'fa fa-question-circle-o', 'fa fa-quora', 'fa fa-quote-left', 'fa fa-quote-right', 'fa fa-random', 'fa fa-ravelry', 'fa fa-rebel', 'fa fa-recycle', 'fa fa-reddit', 'fa fa-reddit-alien', 'fa fa-reddit-square', 'fa fa-refresh', 'fa fa-registered', 'fa fa-renren', 'fa fa-repeat', 'fa fa-reply', 'fa fa-reply-all', 'fa fa-retweet', 'fa fa-road', 'fa fa-rocket', 'fa fa-rss', 'fa fa-rss-square', 'fa fa-rub', 'fa fa-safari', 'fa fa-scissors', 'fa fa-scribd', 'fa fa-search', 'fa fa-search-minus', 'fa fa-search-plus', 'fa fa-sellsy', 'fa fa-server', 'fa fa-share', 'fa fa-share-alt', 'fa fa-share-alt-square', 'fa fa-share-square', 'fa fa-share-square-o', 'fa fa-shield', 'fa fa-ship', 'fa fa-shirtsinbulk', 'fa fa-shopping-bag', 'fa fa-shopping-basket', 'fa fa-shopping-cart', 'fa fa-shower', 'fa fa-sign-in', 'fa fa-sign-language', 'fa fa-sign-out', 'fa fa-signal', 'fa fa-simplybuilt', 'fa fa-sitemap', 'fa fa-skyatlas', 'fa fa-skype', 'fa fa-slack', 'fa fa-sliders', 'fa fa-slideshare', 'fa fa-smile-o', 'fa fa-snapchat', 'fa fa-snapchat-ghost', 'fa fa-snapchat-square', 'fa fa-snowflake-o', 'fa fa-sort', 'fa fa-sort-alpha-asc', 'fa fa-sort-alpha-desc', 'fa fa-sort-amount-asc', 'fa fa-sort-amount-desc', 'fa fa-sort-asc', 'fa fa-sort-desc', 'fa fa-sort-numeric-asc', 'fa fa-sort-numeric-desc', 'fa fa-soundcloud', 'fa fa-space-shuttle', 'fa fa-spinner', 'fa fa-spoon', 'fa fa-spotify', 'fa fa-square', 'fa fa-square-o', 'fa fa-stack-exchange', 'fa fa-stack-overflow', 'fa fa-star', 'fa fa-star-half', 'fa fa-star-half-o', 'fa fa-star-o', 'fa fa-steam', 'fa fa-steam-square', 'fa fa-step-backward', 'fa fa-step-forward', 'fa fa-stethoscope', 'fa fa-sticky-note', 'fa fa-sticky-note-o', 'fa fa-stop', 'fa fa-stop-circle', 'fa fa-stop-circle-o', 'fa fa-street-view', 'fa fa-strikethrough', 'fa fa-stumbleupon', 'fa fa-stumbleupon-circle', 'fa fa-subscript', 'fa fa-subway', 'fa fa-suitcase', 'fa fa-sun-o', 'fa fa-superpowers', 'fa fa-superscript', 'fa fa-table', 'fa fa-tablet', 'fa fa-tachometer', 'fa fa-tag', 'fa fa-tags', 'fa fa-tasks', 'fa fa-taxi', 'fa fa-telegram', 'fa fa-television', 'fa fa-tencent-weibo', 'fa fa-terminal', 'fa fa-text-height', 'fa fa-text-width', 'fa fa-th', 'fa fa-th-large', 'fa fa-th-list', 'fa fa-themeisle', 'fa fa-thermometer-empty', 'fa fa-thermometer-full', 'fa fa-thermometer-half', 'fa fa-thermometer-quarter', 'fa fa-thermometer-three-quarters', 'fa fa-thumb-tack', 'fa fa-thumbs-down', 'fa fa-thumbs-o-down', 'fa fa-thumbs-o-up', 'fa fa-thumbs-up', 'fa fa-ticket', 'fa fa-times', 'fa fa-times-circle', 'fa fa-times-circle-o', 'fa fa-tint', 'fa fa-toggle-off', 'fa fa-toggle-on', 'fa fa-trademark', 'fa fa-train', 'fa fa-transgender', 'fa fa-transgender-alt', 'fa fa-trash', 'fa fa-trash-o', 'fa fa-tree', 'fa fa-trello', 'fa fa-tripadvisor', 'fa fa-trophy', 'fa fa-truck', 'fa fa-try', 'fa fa-tty', 'fa fa-tumblr', 'fa fa-tumblr-square', 'fa fa-twitch', 'fa fa-twitter', 'fa fa-twitter-square', 'fa fa-umbrella', 'fa fa-underline', 'fa fa-undo', 'fa fa-universal-access', 'fa fa-university', 'fa fa-unlock', 'fa fa-unlock-alt', 'fa fa-upload', 'fa fa-usb', 'fa fa-usd', 'fa fa-user', 'fa fa-user-circle', 'fa fa-user-circle-o', 'fa fa-user-md', 'fa fa-user-o', 'fa fa-user-plus', 'fa fa-user-secret', 'fa fa-user-times', 'fa fa-users', 'fa fa-venus', 'fa fa-venus-double', 'fa fa-venus-mars', 'fa fa-viacoin', 'fa fa-viadeo', 'fa fa-viadeo-square', 'fa fa-video-camera', 'fa fa-vimeo', 'fa fa-vimeo-square', 'fa fa-vine', 'fa fa-vk', 'fa fa-volume-control-phone', 'fa fa-volume-down', 'fa fa-volume-off', 'fa fa-volume-up', 'fa fa-weibo', 'fa fa-weixin', 'fa fa-whatsapp', 'fa fa-wheelchair', 'fa fa-wheelchair-alt', 'fa fa-wifi', 'fa fa-wikipedia-w', 'fa fa-window-close', 'fa fa-window-close-o', 'fa fa-window-maximize', 'fa fa-window-minimize', 'fa fa-window-restore', 'fa fa-windows', 'fa fa-wordpress', 'fa fa-wpbeginner', 'fa fa-wpexplorer', 'fa fa-wpforms', 'fa fa-wrench', 'fa fa-xing', 'fa fa-xing-square', 'fa fa-y-combinator', 'fa fa-yahoo', 'fa fa-yelp', 'fa fa-yoast', 'fa fa-youtube', 'fa fa-youtube-play', 'fa fa-youtube-square',
    // Font Awesome 5 Pro Solid
    'fas fa-address-book', 'fas fa-address-card', 'fas fa-adjust', 'fas fa-alarm-clock', 'fas fa-align-center', 'fas fa-align-justify', 'fas fa-align-left', 'fas fa-align-right', 'fas fa-ambulance', 'fas fa-american-sign-language-interpreting', 'fas fa-anchor', 'fas fa-angle-double-down', 'fas fa-angle-double-left', 'fas fa-angle-double-right', 'fas fa-angle-double-up', 'fas fa-angle-down', 'fas fa-angle-left', 'fas fa-angle-right', 'fas fa-angle-up', 'fas fa-archive', 'fas fa-arrow-alt-circle-down', 'fas fa-arrow-alt-circle-left', 'fas fa-arrow-alt-circle-right', 'fas fa-arrow-alt-circle-up', 'fas fa-arrow-alt-down', 'fas fa-arrow-alt-from-bottom', 'fas fa-arrow-alt-from-left', 'fas fa-arrow-alt-from-right', 'fas fa-arrow-alt-from-top', 'fas fa-arrow-alt-left', 'fas fa-arrow-alt-right', 'fas fa-arrow-alt-square-down', 'fas fa-arrow-alt-square-left', 'fas fa-arrow-alt-square-right', 'fas fa-arrow-alt-square-up', 'fas fa-arrow-alt-to-bottom', 'fas fa-arrow-alt-to-left', 'fas fa-arrow-alt-to-right', 'fas fa-arrow-alt-to-top', 'fas fa-arrow-alt-up', 'fas fa-arrow-circle-down', 'fas fa-arrow-circle-left', 'fas fa-arrow-circle-right', 'fas fa-arrow-circle-up', 'fas fa-arrow-down', 'fas fa-arrow-from-bottom', 'fas fa-arrow-from-left', 'fas fa-arrow-from-right', 'fas fa-arrow-from-top', 'fas fa-arrow-left', 'fas fa-arrow-right', 'fas fa-arrow-square-down', 'fas fa-arrow-square-left', 'fas fa-arrow-square-right', 'fas fa-arrow-square-up', 'fas fa-arrow-to-bottom', 'fas fa-arrow-to-left', 'fas fa-arrow-to-right', 'fas fa-arrow-to-top', 'fas fa-arrow-up', 'fas fa-arrows', 'fas fa-arrows-alt', 'fas fa-arrows-alt-h', 'fas fa-arrows-alt-v', 'fas fa-arrows-h', 'fas fa-arrows-v', 'fas fa-assistive-listening-systems', 'fas fa-asterisk', 'fas fa-at', 'fas fa-audio-description', 'fas fa-backward', 'fas fa-badge', 'fas fa-badge-check', 'fas fa-balance-scale', 'fas fa-ban', 'fas fa-barcode', 'fas fa-bars', 'fas fa-bath', 'fas fa-battery-bolt', 'fas fa-battery-empty', 'fas fa-battery-full', 'fas fa-battery-half', 'fas fa-battery-quarter', 'fas fa-battery-slash', 'fas fa-battery-three-quarters', 'fas fa-bed', 'fas fa-beer', 'fas fa-bell', 'fas fa-bell-slash', 'fas fa-bicycle', 'fas fa-binoculars', 'fas fa-birthday-cake', 'fas fa-blind', 'fas fa-bold', 'fas fa-bolt', 'fas fa-bomb', 'fas fa-book', 'fas fa-bookmark', 'fas fa-braille', 'fas fa-briefcase', 'fas fa-browser', 'fas fa-bug', 'fas fa-building', 'fas fa-bullhorn', 'fas fa-bullseye', 'fas fa-bus', 'fas fa-calculator', 'fas fa-calendar', 'fas fa-calendar-alt', 'fas fa-calendar-check', 'fas fa-calendar-edit', 'fas fa-calendar-exclamation', 'fas fa-calendar-minus', 'fas fa-calendar-plus', 'fas fa-calendar-times', 'fas fa-camera', 'fas fa-camera-alt', 'fas fa-camera-retro', 'fas fa-car', 'fas fa-caret-circle-down', 'fas fa-caret-circle-left', 'fas fa-caret-circle-right', 'fas fa-caret-circle-up', 'fas fa-caret-down', 'fas fa-caret-left', 'fas fa-caret-right', 'fas fa-caret-square-down', 'fas fa-caret-square-left', 'fas fa-caret-square-right', 'fas fa-caret-square-up', 'fas fa-caret-up', 'fas fa-cart-arrow-down', 'fas fa-cart-plus', 'fas fa-certificate', 'fas fa-chart-area', 'fas fa-chart-bar', 'fas fa-chart-line', 'fas fa-chart-pie', 'fas fa-check', 'fas fa-check-circle', 'fas fa-check-square', 'fas fa-chevron-circle-down', 'fas fa-chevron-circle-left', 'fas fa-chevron-circle-right', 'fas fa-chevron-circle-up', 'fas fa-chevron-double-down', 'fas fa-chevron-double-left', 'fas fa-chevron-double-right', 'fas fa-chevron-double-up', 'fas fa-chevron-down', 'fas fa-chevron-left', 'fas fa-chevron-right', 'fas fa-chevron-square-down', 'fas fa-chevron-square-left', 'fas fa-chevron-square-right', 'fas fa-chevron-square-up', 'fas fa-chevron-up', 'fas fa-child', 'fas fa-circle', 'fas fa-circle-notch', 'fas fa-clipboard', 'fas fa-clock', 'fas fa-clone', 'fas fa-closed-captioning', 'fas fa-cloud', 'fas fa-cloud-download', 'fas fa-cloud-download-alt', 'fas fa-cloud-upload', 'fas fa-cloud-upload-alt', 'fas fa-club', 'fas fa-code', 'fas fa-code-branch', 'fas fa-code-commit', 'fas fa-code-merge', 'fas fa-coffee', 'fas fa-cog', 'fas fa-cogs', 'fas fa-columns', 'fas fa-comment', 'fas fa-comment-alt', 'fas fa-comments', 'fas fa-compass', 'fas fa-compress', 'fas fa-compress-alt', 'fas fa-compress-wide', 'fas fa-copy', 'fas fa-copyright', 'fas fa-credit-card', 'fas fa-credit-card-blank', 'fas fa-credit-card-front', 'fas fa-crop', 'fas fa-crosshairs', 'fas fa-cube', 'fas fa-cubes', 'fas fa-cut', 'fas fa-database', 'fas fa-deaf', 'fas fa-desktop', 'fas fa-desktop-alt', 'fas fa-diamond', 'fas fa-dollar-sign', 'fas fa-dot-circle', 'fas fa-download', 'fas fa-edit', 'fas fa-eject', 'fas fa-ellipsis-h', 'fas fa-ellipsis-h-alt', 'fas fa-ellipsis-v', 'fas fa-ellipsis-v-alt', 'fas fa-envelope', 'fas fa-envelope-open', 'fas fa-envelope-square', 'fas fa-eraser', 'fas fa-euro-sign', 'fas fa-exchange', 'fas fa-exchange-alt', 'fas fa-exclamation', 'fas fa-exclamation-circle', 'fas fa-exclamation-square', 'fas fa-exclamation-triangle', 'fas fa-expand', 'fas fa-expand-alt', 'fas fa-expand-arrows', 'fas fa-expand-arrows-alt', 'fas fa-expand-wide', 'fas fa-external-link', 'fas fa-external-link-alt', 'fas fa-external-link-square', 'fas fa-external-link-square-alt', 'fas fa-eye', 'fas fa-eye-dropper', 'fas fa-eye-slash', 'fas fa-fast-backward', 'fas fa-fast-forward', 'fas fa-fax', 'fas fa-female', 'fas fa-fighter-jet', 'fas fa-file', 'fas fa-file-alt', 'fas fa-file-archive', 'fas fa-file-audio', 'fas fa-file-check', 'fas fa-file-code', 'fas fa-file-edit', 'fas fa-file-excel', 'fas fa-file-exclamation', 'fas fa-file-image', 'fas fa-file-minus', 'fas fa-file-pdf', 'fas fa-file-plus', 'fas fa-file-powerpoint', 'fas fa-file-times', 'fas fa-file-video', 'fas fa-file-word', 'fas fa-film', 'fas fa-film-alt', 'fas fa-filter', 'fas fa-fire', 'fas fa-fire-extinguisher', 'fas fa-flag', 'fas fa-flag-checkered', 'fas fa-flask', 'fas fa-folder', 'fas fa-folder-open', 'fas fa-font', 'fas fa-forward', 'fas fa-frown', 'fas fa-futbol', 'fas fa-gamepad', 'fas fa-gavel', 'fas fa-gem', 'fas fa-genderless', 'fas fa-gift', 'fas fa-glass-martini', 'fas fa-globe', 'fas fa-graduation-cap', 'fas fa-h-square', 'fas fa-h1', 'fas fa-h2', 'fas fa-h3', 'fas fa-hand-lizard', 'fas fa-hand-paper', 'fas fa-hand-peace', 'fas fa-hand-point-down', 'fas fa-hand-point-left', 'fas fa-hand-point-right', 'fas fa-hand-point-up', 'fas fa-hand-pointer', 'fas fa-hand-rock', 'fas fa-hand-scissors', 'fas fa-hand-spock', 'fas fa-handshake', 'fas fa-hashtag', 'fas fa-hdd', 'fas fa-heading', 'fas fa-headphones', 'fas fa-heart', 'fas fa-heartbeat', 'fas fa-hexagon', 'fas fa-history', 'fas fa-home', 'fas fa-hospital', 'fas fa-hourglass', 'fas fa-hourglass-end', 'fas fa-hourglass-half', 'fas fa-hourglass-start', 'fas fa-i-cursor', 'fas fa-id-badge', 'fas fa-id-card', 'fas fa-image', 'fas fa-images', 'fas fa-inbox', 'fas fa-inbox-in', 'fas fa-inbox-out', 'fas fa-indent', 'fas fa-industry', 'fas fa-industry-alt', 'fas fa-info', 'fas fa-info-circle', 'fas fa-info-square', 'fas fa-italic', 'fas fa-jack-o-lantern', 'fas fa-key', 'fas fa-keyboard', 'fas fa-language', 'fas fa-laptop', 'fas fa-leaf', 'fas fa-lemon', 'fas fa-level-down', 'fas fa-level-down-alt', 'fas fa-level-up', 'fas fa-level-up-alt', 'fas fa-life-ring', 'fas fa-lightbulb', 'fas fa-link', 'fas fa-lira-sign', 'fas fa-list', 'fas fa-list-alt', 'fas fa-list-ol', 'fas fa-list-ul', 'fas fa-location-arrow', 'fas fa-lock', 'fas fa-lock-alt', 'fas fa-lock-open', 'fas fa-lock-open-alt', 'fas fa-long-arrow-alt-down', 'fas fa-long-arrow-alt-left', 'fas fa-long-arrow-alt-right', 'fas fa-long-arrow-alt-up', 'fas fa-long-arrow-down', 'fas fa-long-arrow-left', 'fas fa-long-arrow-right', 'fas fa-long-arrow-up', 'fas fa-low-vision', 'fas fa-magic', 'fas fa-magnet', 'fas fa-male', 'fas fa-map', 'fas fa-map-marker', 'fas fa-map-marker-alt', 'fas fa-map-pin', 'fas fa-map-signs', 'fas fa-mars', 'fas fa-mars-double', 'fas fa-mars-stroke', 'fas fa-mars-stroke-h', 'fas fa-mars-stroke-v', 'fas fa-medkit', 'fas fa-meh', 'fas fa-mercury', 'fas fa-microchip', 'fas fa-microphone', 'fas fa-microphone-alt', 'fas fa-microphone-slash', 'fas fa-minus', 'fas fa-minus-circle', 'fas fa-minus-hexagon', 'fas fa-minus-octagon', 'fas fa-minus-square', 'fas fa-mobile', 'fas fa-mobile-alt', 'fas fa-mobile-android', 'fas fa-mobile-android-alt', 'fas fa-money-bill', 'fas fa-money-bill-alt', 'fas fa-moon', 'fas fa-motorcycle', 'fas fa-mouse-pointer', 'fas fa-music', 'fas fa-neuter', 'fas fa-newspaper', 'fas fa-object-group', 'fas fa-object-ungroup', 'fas fa-octagon', 'fas fa-outdent', 'fas fa-paint-brush', 'fas fa-paper-plane', 'fas fa-paperclip', 'fas fa-paragraph', 'fas fa-paste', 'fas fa-pause', 'fas fa-pause-circle', 'fas fa-paw', 'fas fa-pen', 'fas fa-pen-alt', 'fas fa-pen-square', 'fas fa-pencil', 'fas fa-pencil-alt', 'fas fa-percent', 'fas fa-phone', 'fas fa-phone-slash', 'fas fa-phone-square', 'fas fa-phone-volume', 'fas fa-plane', 'fas fa-plane-alt', 'fas fa-play', 'fas fa-play-circle', 'fas fa-plug', 'fas fa-plus', 'fas fa-plus-circle', 'fas fa-plus-hexagon', 'fas fa-plus-octagon', 'fas fa-plus-square', 'fas fa-podcast', 'fas fa-poo', 'fas fa-portrait', 'fas fa-pound-sign', 'fas fa-power-off', 'fas fa-print', 'fas fa-puzzle-piece', 'fas fa-qrcode', 'fas fa-question', 'fas fa-question-circle', 'fas fa-question-square', 'fas fa-quote-left', 'fas fa-quote-right', 'fas fa-random', 'fas fa-rectangle-landscape', 'fas fa-rectangle-portrait', 'fas fa-rectangle-wide', 'fas fa-recycle', 'fas fa-redo', 'fas fa-redo-alt', 'fas fa-registered', 'fas fa-repeat', 'fas fa-repeat-1', 'fas fa-repeat-1-alt', 'fas fa-repeat-alt', 'fas fa-reply', 'fas fa-reply-all', 'fas fa-retweet', 'fas fa-retweet-alt', 'fas fa-road', 'fas fa-rocket', 'fas fa-rss', 'fas fa-rss-square', 'fas fa-ruble-sign', 'fas fa-rupee-sign', 'fas fa-save', 'fas fa-scrubber', 'fas fa-search', 'fas fa-search-minus', 'fas fa-search-plus', 'fas fa-server', 'fas fa-share', 'fas fa-share-all', 'fas fa-share-alt', 'fas fa-share-alt-square', 'fas fa-share-square', 'fas fa-shekel-sign', 'fas fa-shield', 'fas fa-shield-alt', 'fas fa-shield-check', 'fas fa-ship', 'fas fa-shopping-bag', 'fas fa-shopping-basket', 'fas fa-shopping-cart', 'fas fa-shower', 'fas fa-sign-in', 'fas fa-sign-in-alt', 'fas fa-sign-language', 'fas fa-sign-out', 'fas fa-sign-out-alt', 'fas fa-signal', 'fas fa-sitemap', 'fas fa-sliders-h', 'fas fa-sliders-h-square', 'fas fa-sliders-v', 'fas fa-sliders-v-square', 'fas fa-smile', 'fas fa-snowflake', 'fas fa-sort', 'fas fa-sort-alpha-down', 'fas fa-sort-alpha-up', 'fas fa-sort-amount-down', 'fas fa-sort-amount-up', 'fas fa-sort-down', 'fas fa-sort-numeric-down', 'fas fa-sort-numeric-up', 'fas fa-sort-up', 'fas fa-space-shuttle', 'fas fa-spade', 'fas fa-spinner', 'fas fa-spinner-third', 'fas fa-square', 'fas fa-star', 'fas fa-star-exclamation', 'fas fa-star-half', 'fas fa-step-backward', 'fas fa-step-forward', 'fas fa-stethoscope', 'fas fa-sticky-note', 'fas fa-stop', 'fas fa-stop-circle', 'fas fa-stopwatch', 'fas fa-street-view', 'fas fa-strikethrough', 'fas fa-subscript', 'fas fa-subway', 'fas fa-suitcase', 'fas fa-sun', 'fas fa-superscript', 'fas fa-sync', 'fas fa-sync-alt', 'fas fa-table', 'fas fa-tablet', 'fas fa-tablet-alt', 'fas fa-tablet-android', 'fas fa-tablet-android-alt', 'fas fa-tachometer', 'fas fa-tachometer-alt', 'fas fa-tag', 'fas fa-tags', 'fas fa-tasks', 'fas fa-taxi', 'fas fa-terminal', 'fas fa-text-height', 'fas fa-text-width', 'fas fa-th', 'fas fa-th-large', 'fas fa-th-list', 'fas fa-thermometer-empty', 'fas fa-thermometer-full', 'fas fa-thermometer-half', 'fas fa-thermometer-quarter', 'fas fa-thermometer-three-quarters', 'fas fa-thumbs-down', 'fas fa-thumbs-up', 'fas fa-thumbtack', 'fas fa-ticket', 'fas fa-ticket-alt', 'fas fa-times', 'fas fa-times-circle', 'fas fa-times-hexagon', 'fas fa-times-octagon', 'fas fa-times-square', 'fas fa-tint', 'fas fa-toggle-off', 'fas fa-toggle-on', 'fas fa-trademark', 'fas fa-train', 'fas fa-transgender', 'fas fa-transgender-alt', 'fas fa-trash', 'fas fa-trash-alt', 'fas fa-tree', 'fas fa-tree-alt', 'fas fa-triangle', 'fas fa-trophy', 'fas fa-trophy-alt', 'fas fa-truck', 'fas fa-tty', 'fas fa-tv', 'fas fa-tv-retro', 'fas fa-umbrella', 'fas fa-underline', 'fas fa-undo', 'fas fa-undo-alt', 'fas fa-universal-access', 'fas fa-university', 'fas fa-unlink', 'fas fa-unlock', 'fas fa-unlock-alt', 'fas fa-upload', 'fas fa-usd-circle', 'fas fa-usd-square', 'fas fa-user', 'fas fa-user-alt', 'fas fa-user-circle', 'fas fa-user-md', 'fas fa-user-plus', 'fas fa-user-secret', 'fas fa-user-times', 'fas fa-users', 'fas fa-utensil-fork', 'fas fa-utensil-knife', 'fas fa-utensil-spoon', 'fas fa-utensils', 'fas fa-utensils-alt', 'fas fa-venus', 'fas fa-venus-double', 'fas fa-venus-mars', 'fas fa-video', 'fas fa-volume-down', 'fas fa-volume-mute', 'fas fa-volume-off', 'fas fa-volume-up', 'fas fa-watch', 'fas fa-wheelchair', 'fas fa-wifi', 'fas fa-window', 'fas fa-window-alt', 'fas fa-window-close', 'fas fa-window-maximize', 'fas fa-window-minimize', 'fas fa-window-restore', 'fas fa-won-sign', 'fas fa-wrench', 'fas fa-yen-sign',
    // Font Awesome 5 Pro Light
    'fal fa-address-book', 'fal fa-address-card', 'fal fa-adjust', 'fal fa-alarm-clock', 'fal fa-align-center', 'fal fa-align-justify', 'fal fa-align-left', 'fal fa-align-right', 'fal fa-ambulance', 'fal fa-american-sign-language-interpreting', 'fal fa-anchor', 'fal fa-angle-double-down', 'fal fa-angle-double-left', 'fal fa-angle-double-right', 'fal fa-angle-double-up', 'fal fa-angle-down', 'fal fa-angle-left', 'fal fa-angle-right', 'fal fa-angle-up', 'fal fa-archive', 'fal fa-arrow-alt-circle-down', 'fal fa-arrow-alt-circle-left', 'fal fa-arrow-alt-circle-right', 'fal fa-arrow-alt-circle-up', 'fal fa-arrow-alt-down', 'fal fa-arrow-alt-from-bottom', 'fal fa-arrow-alt-from-left', 'fal fa-arrow-alt-from-right', 'fal fa-arrow-alt-from-top', 'fal fa-arrow-alt-left', 'fal fa-arrow-alt-right', 'fal fa-arrow-alt-square-down', 'fal fa-arrow-alt-square-left', 'fal fa-arrow-alt-square-right', 'fal fa-arrow-alt-square-up', 'fal fa-arrow-alt-to-bottom', 'fal fa-arrow-alt-to-left', 'fal fa-arrow-alt-to-right', 'fal fa-arrow-alt-to-top', 'fal fa-arrow-alt-up', 'fal fa-arrow-circle-down', 'fal fa-arrow-circle-left', 'fal fa-arrow-circle-right', 'fal fa-arrow-circle-up', 'fal fa-arrow-down', 'fal fa-arrow-from-bottom', 'fal fa-arrow-from-left', 'fal fa-arrow-from-right', 'fal fa-arrow-from-top', 'fal fa-arrow-left', 'fal fa-arrow-right', 'fal fa-arrow-square-down', 'fal fa-arrow-square-left', 'fal fa-arrow-square-right', 'fal fa-arrow-square-up', 'fal fa-arrow-to-bottom', 'fal fa-arrow-to-left', 'fal fa-arrow-to-right', 'fal fa-arrow-to-top', 'fal fa-arrow-up', 'fal fa-arrows', 'fal fa-arrows-alt', 'fal fa-arrows-alt-h', 'fal fa-arrows-alt-v', 'fal fa-arrows-h', 'fal fa-arrows-v', 'fal fa-assistive-listening-systems', 'fal fa-asterisk', 'fal fa-at', 'fal fa-audio-description', 'fal fa-backward', 'fal fa-badge', 'fal fa-badge-check', 'fal fa-balance-scale', 'fal fa-ban', 'fal fa-barcode', 'fal fa-bars', 'fal fa-bath', 'fal fa-battery-bolt', 'fal fa-battery-empty', 'fal fa-battery-full', 'fal fa-battery-half', 'fal fa-battery-quarter', 'fal fa-battery-slash', 'fal fa-battery-three-quarters', 'fal fa-bed', 'fal fa-beer', 'fal fa-bell', 'fal fa-bell-slash', 'fal fa-bicycle', 'fal fa-binoculars', 'fal fa-birthday-cake', 'fal fa-blind', 'fal fa-bold', 'fal fa-bolt', 'fal fa-bomb', 'fal fa-book', 'fal fa-bookmark', 'fal fa-braille', 'fal fa-briefcase', 'fal fa-browser', 'fal fa-bug', 'fal fa-building', 'fal fa-bullhorn', 'fal fa-bullseye', 'fal fa-bus', 'fal fa-calculator', 'fal fa-calendar', 'fal fa-calendar-alt', 'fal fa-calendar-check', 'fal fa-calendar-edit', 'fal fa-calendar-exclamation', 'fal fa-calendar-minus', 'fal fa-calendar-plus', 'fal fa-calendar-times', 'fal fa-camera', 'fal fa-camera-alt', 'fal fa-camera-retro', 'fal fa-car', 'fal fa-caret-circle-down', 'fal fa-caret-circle-left', 'fal fa-caret-circle-right', 'fal fa-caret-circle-up', 'fal fa-caret-down', 'fal fa-caret-left', 'fal fa-caret-right', 'fal fa-caret-square-down', 'fal fa-caret-square-left', 'fal fa-caret-square-right', 'fal fa-caret-square-up', 'fal fa-caret-up', 'fal fa-cart-arrow-down', 'fal fa-cart-plus', 'fal fa-certificate', 'fal fa-chart-area', 'fal fa-chart-bar', 'fal fa-chart-line', 'fal fa-chart-pie', 'fal fa-check', 'fal fa-check-circle', 'fal fa-check-square', 'fal fa-chevron-circle-down', 'fal fa-chevron-circle-left', 'fal fa-chevron-circle-right', 'fal fa-chevron-circle-up', 'fal fa-chevron-double-down', 'fal fa-chevron-double-left', 'fal fa-chevron-double-right', 'fal fa-chevron-double-up', 'fal fa-chevron-down', 'fal fa-chevron-left', 'fal fa-chevron-right', 'fal fa-chevron-square-down', 'fal fa-chevron-square-left', 'fal fa-chevron-square-right', 'fal fa-chevron-square-up', 'fal fa-chevron-up', 'fal fa-child', 'fal fa-circle', 'fal fa-circle-notch', 'fal fa-clipboard', 'fal fa-clock', 'fal fa-clone', 'fal fa-closed-captioning', 'fal fa-cloud', 'fal fa-cloud-download', 'fal fa-cloud-download-alt', 'fal fa-cloud-upload', 'fal fa-cloud-upload-alt', 'fal fa-club', 'fal fa-code', 'fal fa-code-branch', 'fal fa-code-commit', 'fal fa-code-merge', 'fal fa-coffee', 'fal fa-cog', 'fal fa-cogs', 'fal fa-columns', 'fal fa-comment', 'fal fa-comment-alt', 'fal fa-comments', 'fal fa-compass', 'fal fa-compress', 'fal fa-compress-alt', 'fal fa-compress-wide', 'fal fa-copy', 'fal fa-copyright', 'fal fa-credit-card', 'fal fa-credit-card-blank', 'fal fa-credit-card-front', 'fal fa-crop', 'fal fa-crosshairs', 'fal fa-cube', 'fal fa-cubes', 'fal fa-cut', 'fal fa-database', 'fal fa-deaf', 'fal fa-desktop', 'fal fa-desktop-alt', 'fal fa-diamond', 'fal fa-dollar-sign', 'fal fa-dot-circle', 'fal fa-download', 'fal fa-edit', 'fal fa-eject', 'fal fa-ellipsis-h', 'fal fa-ellipsis-h-alt', 'fal fa-ellipsis-v', 'fal fa-ellipsis-v-alt', 'fal fa-envelope', 'fal fa-envelope-open', 'fal fa-envelope-square', 'fal fa-eraser', 'fal fa-euro-sign', 'fal fa-exchange', 'fal fa-exchange-alt', 'fal fa-exclamation', 'fal fa-exclamation-circle', 'fal fa-exclamation-square', 'fal fa-exclamation-triangle', 'fal fa-expand', 'fal fa-expand-alt', 'fal fa-expand-arrows', 'fal fa-expand-arrows-alt', 'fal fa-expand-wide', 'fal fa-external-link', 'fal fa-external-link-alt', 'fal fa-external-link-square', 'fal fa-external-link-square-alt', 'fal fa-eye', 'fal fa-eye-dropper', 'fal fa-eye-slash', 'fal fa-fast-backward', 'fal fa-fast-forward', 'fal fa-fax', 'fal fa-female', 'fal fa-fighter-jet', 'fal fa-file', 'fal fa-file-alt', 'fal fa-file-archive', 'fal fa-file-audio', 'fal fa-file-check', 'fal fa-file-code', 'fal fa-file-edit', 'fal fa-file-excel', 'fal fa-file-exclamation', 'fal fa-file-image', 'fal fa-file-minus', 'fal fa-file-pdf', 'fal fa-file-plus', 'fal fa-file-powerpoint', 'fal fa-file-times', 'fal fa-file-video', 'fal fa-file-word', 'fal fa-film', 'fal fa-film-alt', 'fal fa-filter', 'fal fa-fire', 'fal fa-fire-extinguisher', 'fal fa-flag', 'fal fa-flag-checkered', 'fal fa-flask', 'fal fa-folder', 'fal fa-folder-open', 'fal fa-font', 'fal fa-forward', 'fal fa-frown', 'fal fa-futbol', 'fal fa-gamepad', 'fal fa-gavel', 'fal fa-gem', 'fal fa-genderless', 'fal fa-gift', 'fal fa-glass-martini', 'fal fa-globe', 'fal fa-graduation-cap', 'fal fa-h-square', 'fal fa-h1', 'fal fa-h2', 'fal fa-h3', 'fal fa-hand-lizard', 'fal fa-hand-paper', 'fal fa-hand-peace', 'fal fa-hand-point-down', 'fal fa-hand-point-left', 'fal fa-hand-point-right', 'fal fa-hand-point-up', 'fal fa-hand-pointer', 'fal fa-hand-rock', 'fal fa-hand-scissors', 'fal fa-hand-spock', 'fal fa-handshake', 'fal fa-hashtag', 'fal fa-hdd', 'fal fa-heading', 'fal fa-headphones', 'fal fa-heart', 'fal fa-heartbeat', 'fal fa-hexagon', 'fal fa-history', 'fal fa-home', 'fal fa-hospital', 'fal fa-hourglass', 'fal fa-hourglass-end', 'fal fa-hourglass-half', 'fal fa-hourglass-start', 'fal fa-i-cursor', 'fal fa-id-badge', 'fal fa-id-card', 'fal fa-image', 'fal fa-images', 'fal fa-inbox', 'fal fa-inbox-in', 'fal fa-inbox-out', 'fal fa-indent', 'fal fa-industry', 'fal fa-industry-alt', 'fal fa-info', 'fal fa-info-circle', 'fal fa-info-square', 'fal fa-italic', 'fal fa-jack-o-lantern', 'fal fa-key', 'fal fa-keyboard', 'fal fa-language', 'fal fa-laptop', 'fal fa-leaf', 'fal fa-lemon', 'fal fa-level-down', 'fal fa-level-down-alt', 'fal fa-level-up', 'fal fa-level-up-alt', 'fal fa-life-ring', 'fal fa-lightbulb', 'fal fa-link', 'fal fa-lira-sign', 'fal fa-list', 'fal fa-list-alt', 'fal fa-list-ol', 'fal fa-list-ul', 'fal fa-location-arrow', 'fal fa-lock', 'fal fa-lock-alt', 'fal fa-lock-open', 'fal fa-lock-open-alt', 'fal fa-long-arrow-alt-down', 'fal fa-long-arrow-alt-left', 'fal fa-long-arrow-alt-right', 'fal fa-long-arrow-alt-up', 'fal fa-long-arrow-down', 'fal fa-long-arrow-left', 'fal fa-long-arrow-right', 'fal fa-long-arrow-up', 'fal fa-low-vision', 'fal fa-magic', 'fal fa-magnet', 'fal fa-male', 'fal fa-map', 'fal fa-map-marker', 'fal fa-map-marker-alt', 'fal fa-map-pin', 'fal fa-map-signs', 'fal fa-mars', 'fal fa-mars-double', 'fal fa-mars-stroke', 'fal fa-mars-stroke-h', 'fal fa-mars-stroke-v', 'fal fa-medkit', 'fal fa-meh', 'fal fa-mercury', 'fal fa-microchip', 'fal fa-microphone', 'fal fa-microphone-alt', 'fal fa-microphone-slash', 'fal fa-minus', 'fal fa-minus-circle', 'fal fa-minus-hexagon', 'fal fa-minus-octagon', 'fal fa-minus-square', 'fal fa-mobile', 'fal fa-mobile-alt', 'fal fa-mobile-android', 'fal fa-mobile-android-alt', 'fal fa-money-bill', 'fal fa-money-bill-alt', 'fal fa-moon', 'fal fa-motorcycle', 'fal fa-mouse-pointer', 'fal fa-music', 'fal fa-neuter', 'fal fa-newspaper', 'fal fa-object-group', 'fal fa-object-ungroup', 'fal fa-octagon', 'fal fa-outdent', 'fal fa-paint-brush', 'fal fa-paper-plane', 'fal fa-paperclip', 'fal fa-paragraph', 'fal fa-paste', 'fal fa-pause', 'fal fa-pause-circle', 'fal fa-paw', 'fal fa-pen', 'fal fa-pen-alt', 'fal fa-pen-square', 'fal fa-pencil', 'fal fa-pencil-alt', 'fal fa-percent', 'fal fa-phone', 'fal fa-phone-slash', 'fal fa-phone-square', 'fal fa-phone-volume', 'fal fa-plane', 'fal fa-plane-alt', 'fal fa-play', 'fal fa-play-circle', 'fal fa-plug', 'fal fa-plus', 'fal fa-plus-circle', 'fal fa-plus-hexagon', 'fal fa-plus-octagon', 'fal fa-plus-square', 'fal fa-podcast', 'fal fa-poo', 'fal fa-portrait', 'fal fa-pound-sign', 'fal fa-power-off', 'fal fa-print', 'fal fa-puzzle-piece', 'fal fa-qrcode', 'fal fa-question', 'fal fa-question-circle', 'fal fa-question-square', 'fal fa-quote-left', 'fal fa-quote-right', 'fal fa-random', 'fal fa-rectangle-landscape', 'fal fa-rectangle-portrait', 'fal fa-rectangle-wide', 'fal fa-recycle', 'fal fa-redo', 'fal fa-redo-alt', 'fal fa-registered', 'fal fa-repeat', 'fal fa-repeat-1', 'fal fa-repeat-1-alt', 'fal fa-repeat-alt', 'fal fa-reply', 'fal fa-reply-all', 'fal fa-retweet', 'fal fa-retweet-alt', 'fal fa-road', 'fal fa-rocket', 'fal fa-rss', 'fal fa-rss-square', 'fal fa-ruble-sign', 'fal fa-rupee-sign', 'fal fa-save', 'fal fa-scrubber', 'fal fa-search', 'fal fa-search-minus', 'fal fa-search-plus', 'fal fa-server', 'fal fa-share', 'fal fa-share-all', 'fal fa-share-alt', 'fal fa-share-alt-square', 'fal fa-share-square', 'fal fa-shekel-sign', 'fal fa-shield', 'fal fa-shield-alt', 'fal fa-shield-check', 'fal fa-ship', 'fal fa-shopping-bag', 'fal fa-shopping-basket', 'fal fa-shopping-cart', 'fal fa-shower', 'fal fa-sign-in', 'fal fa-sign-in-alt', 'fal fa-sign-language', 'fal fa-sign-out', 'fal fa-sign-out-alt', 'fal fa-signal', 'fal fa-sitemap', 'fal fa-sliders-h', 'fal fa-sliders-h-square', 'fal fa-sliders-v', 'fal fa-sliders-v-square', 'fal fa-smile', 'fal fa-snowflake', 'fal fa-sort', 'fal fa-sort-alpha-down', 'fal fa-sort-alpha-up', 'fal fa-sort-amount-down', 'fal fa-sort-amount-up', 'fal fa-sort-down', 'fal fa-sort-numeric-down', 'fal fa-sort-numeric-up', 'fal fa-sort-up', 'fal fa-space-shuttle', 'fal fa-spade', 'fal fa-spinner', 'fal fa-spinner-third', 'fal fa-square', 'fal fa-star', 'fal fa-star-exclamation', 'fal fa-star-half', 'fal fa-step-backward', 'fal fa-step-forward', 'fal fa-stethoscope', 'fal fa-sticky-note', 'fal fa-stop', 'fal fa-stop-circle', 'fal fa-stopwatch', 'fal fa-street-view', 'fal fa-strikethrough', 'fal fa-subscript', 'fal fa-subway', 'fal fa-suitcase', 'fal fa-sun', 'fal fa-superscript', 'fal fa-sync', 'fal fa-sync-alt', 'fal fa-table', 'fal fa-tablet', 'fal fa-tablet-alt', 'fal fa-tablet-android', 'fal fa-tablet-android-alt', 'fal fa-tachometer', 'fal fa-tachometer-alt', 'fal fa-tag', 'fal fa-tags', 'fal fa-tasks', 'fal fa-taxi', 'fal fa-terminal', 'fal fa-text-height', 'fal fa-text-width', 'fal fa-th', 'fal fa-th-large', 'fal fa-th-list', 'fal fa-thermometer-empty', 'fal fa-thermometer-full', 'fal fa-thermometer-half', 'fal fa-thermometer-quarter', 'fal fa-thermometer-three-quarters', 'fal fa-thumbs-down', 'fal fa-thumbs-up', 'fal fa-thumbtack', 'fal fa-ticket', 'fal fa-ticket-alt', 'fal fa-times', 'fal fa-times-circle', 'fal fa-times-hexagon', 'fal fa-times-octagon', 'fal fa-times-square', 'fal fa-tint', 'fal fa-toggle-off', 'fal fa-toggle-on', 'fal fa-trademark', 'fal fa-train', 'fal fa-transgender', 'fal fa-transgender-alt', 'fal fa-trash', 'fal fa-trash-alt', 'fal fa-tree', 'fal fa-tree-alt', 'fal fa-triangle', 'fal fa-trophy', 'fal fa-trophy-alt', 'fal fa-truck', 'fal fa-tty', 'fal fa-tv', 'fal fa-tv-retro', 'fal fa-umbrella', 'fal fa-underline', 'fal fa-undo', 'fal fa-undo-alt', 'fal fa-universal-access', 'fal fa-university', 'fal fa-unlink', 'fal fa-unlock', 'fal fa-unlock-alt', 'fal fa-upload', 'fal fa-usd-circle', 'fal fa-usd-square', 'fal fa-user', 'fal fa-user-alt', 'fal fa-user-circle', 'fal fa-user-md', 'fal fa-user-plus', 'fal fa-user-secret', 'fal fa-user-times', 'fal fa-users', 'fal fa-utensil-fork', 'fal fa-utensil-knife', 'fal fa-utensil-spoon', 'fal fa-utensils', 'fal fa-utensils-alt', 'fal fa-venus', 'fal fa-venus-double', 'fal fa-venus-mars', 'fal fa-video', 'fal fa-volume-down', 'fal fa-volume-mute', 'fal fa-volume-off', 'fal fa-volume-up', 'fal fa-watch', 'fal fa-wheelchair', 'fal fa-wifi', 'fal fa-window', 'fal fa-window-alt', 'fal fa-window-close', 'fal fa-window-maximize', 'fal fa-window-minimize', 'fal fa-window-restore', 'fal fa-won-sign', 'fal fa-wrench', 'fal fa-yen-sign',
    // Font Awesome 5 Pro Regular
    'far fa-address-book', 'far fa-address-card', 'far fa-adjust', 'far fa-alarm-clock', 'far fa-align-center', 'far fa-align-justify', 'far fa-align-left', 'far fa-align-right', 'far fa-ambulance', 'far fa-american-sign-language-interpreting', 'far fa-anchor', 'far fa-angle-double-down', 'far fa-angle-double-left', 'far fa-angle-double-right', 'far fa-angle-double-up', 'far fa-angle-down', 'far fa-angle-left', 'far fa-angle-right', 'far fa-angle-up', 'far fa-archive', 'far fa-arrow-alt-circle-down', 'far fa-arrow-alt-circle-left', 'far fa-arrow-alt-circle-right', 'far fa-arrow-alt-circle-up', 'far fa-arrow-alt-down', 'far fa-arrow-alt-from-bottom', 'far fa-arrow-alt-from-left', 'far fa-arrow-alt-from-right', 'far fa-arrow-alt-from-top', 'far fa-arrow-alt-left', 'far fa-arrow-alt-right', 'far fa-arrow-alt-square-down', 'far fa-arrow-alt-square-left', 'far fa-arrow-alt-square-right', 'far fa-arrow-alt-square-up', 'far fa-arrow-alt-to-bottom', 'far fa-arrow-alt-to-left', 'far fa-arrow-alt-to-right', 'far fa-arrow-alt-to-top', 'far fa-arrow-alt-up', 'far fa-arrow-circle-down', 'far fa-arrow-circle-left', 'far fa-arrow-circle-right', 'far fa-arrow-circle-up', 'far fa-arrow-down', 'far fa-arrow-from-bottom', 'far fa-arrow-from-left', 'far fa-arrow-from-right', 'far fa-arrow-from-top', 'far fa-arrow-left', 'far fa-arrow-right', 'far fa-arrow-square-down', 'far fa-arrow-square-left', 'far fa-arrow-square-right', 'far fa-arrow-square-up', 'far fa-arrow-to-bottom', 'far fa-arrow-to-left', 'far fa-arrow-to-right', 'far fa-arrow-to-top', 'far fa-arrow-up', 'far fa-arrows', 'far fa-arrows-alt', 'far fa-arrows-alt-h', 'far fa-arrows-alt-v', 'far fa-arrows-h', 'far fa-arrows-v', 'far fa-assistive-listening-systems', 'far fa-asterisk', 'far fa-at', 'far fa-audio-description', 'far fa-backward', 'far fa-badge', 'far fa-badge-check', 'far fa-balance-scale', 'far fa-ban', 'far fa-barcode', 'far fa-bars', 'far fa-bath', 'far fa-battery-bolt', 'far fa-battery-empty', 'far fa-battery-full', 'far fa-battery-half', 'far fa-battery-quarter', 'far fa-battery-slash', 'far fa-battery-three-quarters', 'far fa-bed', 'far fa-beer', 'far fa-bell', 'far fa-bell-slash', 'far fa-bicycle', 'far fa-binoculars', 'far fa-birthday-cake', 'far fa-blind', 'far fa-bold', 'far fa-bolt', 'far fa-bomb', 'far fa-book', 'far fa-bookmark', 'far fa-braille', 'far fa-briefcase', 'far fa-browser', 'far fa-bug', 'far fa-building', 'far fa-bullhorn', 'far fa-bullseye', 'far fa-bus', 'far fa-calculator', 'far fa-calendar', 'far fa-calendar-alt', 'far fa-calendar-check', 'far fa-calendar-edit', 'far fa-calendar-exclamation', 'far fa-calendar-minus', 'far fa-calendar-plus', 'far fa-calendar-times', 'far fa-camera', 'far fa-camera-alt', 'far fa-camera-retro', 'far fa-car', 'far fa-caret-circle-down', 'far fa-caret-circle-left', 'far fa-caret-circle-right', 'far fa-caret-circle-up', 'far fa-caret-down', 'far fa-caret-left', 'far fa-caret-right', 'far fa-caret-square-down', 'far fa-caret-square-left', 'far fa-caret-square-right', 'far fa-caret-square-up', 'far fa-caret-up', 'far fa-cart-arrow-down', 'far fa-cart-plus', 'far fa-certificate', 'far fa-chart-area', 'far fa-chart-bar', 'far fa-chart-line', 'far fa-chart-pie', 'far fa-check', 'far fa-check-circle', 'far fa-check-square', 'far fa-chevron-circle-down', 'far fa-chevron-circle-left', 'far fa-chevron-circle-right', 'far fa-chevron-circle-up', 'far fa-chevron-double-down', 'far fa-chevron-double-left', 'far fa-chevron-double-right', 'far fa-chevron-double-up', 'far fa-chevron-down', 'far fa-chevron-left', 'far fa-chevron-right', 'far fa-chevron-square-down', 'far fa-chevron-square-left', 'far fa-chevron-square-right', 'far fa-chevron-square-up', 'far fa-chevron-up', 'far fa-child', 'far fa-circle', 'far fa-circle-notch', 'far fa-clipboard', 'far fa-clock', 'far fa-clone', 'far fa-closed-captioning', 'far fa-cloud', 'far fa-cloud-download', 'far fa-cloud-download-alt', 'far fa-cloud-upload', 'far fa-cloud-upload-alt', 'far fa-club', 'far fa-code', 'far fa-code-branch', 'far fa-code-commit', 'far fa-code-merge', 'far fa-coffee', 'far fa-cog', 'far fa-cogs', 'far fa-columns', 'far fa-comment', 'far fa-comment-alt', 'far fa-comments', 'far fa-compass', 'far fa-compress', 'far fa-compress-alt', 'far fa-compress-wide', 'far fa-copy', 'far fa-copyright', 'far fa-credit-card', 'far fa-credit-card-blank', 'far fa-credit-card-front', 'far fa-crop', 'far fa-crosshairs', 'far fa-cube', 'far fa-cubes', 'far fa-cut', 'far fa-database', 'far fa-deaf', 'far fa-desktop', 'far fa-desktop-alt', 'far fa-diamond', 'far fa-dollar-sign', 'far fa-dot-circle', 'far fa-download', 'far fa-edit', 'far fa-eject', 'far fa-ellipsis-h', 'far fa-ellipsis-h-alt', 'far fa-ellipsis-v', 'far fa-ellipsis-v-alt', 'far fa-envelope', 'far fa-envelope-open', 'far fa-envelope-square', 'far fa-eraser', 'far fa-euro-sign', 'far fa-exchange', 'far fa-exchange-alt', 'far fa-exclamation', 'far fa-exclamation-circle', 'far fa-exclamation-square', 'far fa-exclamation-triangle', 'far fa-expand', 'far fa-expand-alt', 'far fa-expand-arrows', 'far fa-expand-arrows-alt', 'far fa-expand-wide', 'far fa-external-link', 'far fa-external-link-alt', 'far fa-external-link-square', 'far fa-external-link-square-alt', 'far fa-eye', 'far fa-eye-dropper', 'far fa-eye-slash', 'far fa-fast-backward', 'far fa-fast-forward', 'far fa-fax', 'far fa-female', 'far fa-fighter-jet', 'far fa-file', 'far fa-file-alt', 'far fa-file-archive', 'far fa-file-audio', 'far fa-file-check', 'far fa-file-code', 'far fa-file-edit', 'far fa-file-excel', 'far fa-file-exclamation', 'far fa-file-image', 'far fa-file-minus', 'far fa-file-pdf', 'far fa-file-plus', 'far fa-file-powerpoint', 'far fa-file-times', 'far fa-file-video', 'far fa-file-word', 'far fa-film', 'far fa-film-alt', 'far fa-filter', 'far fa-fire', 'far fa-fire-extinguisher', 'far fa-flag', 'far fa-flag-checkered', 'far fa-flask', 'far fa-folder', 'far fa-folder-open', 'far fa-font', 'far fa-forward', 'far fa-frown', 'far fa-futbol', 'far fa-gamepad', 'far fa-gavel', 'far fa-gem', 'far fa-genderless', 'far fa-gift', 'far fa-glass-martini', 'far fa-globe', 'far fa-graduation-cap', 'far fa-h-square', 'far fa-h1', 'far fa-h2', 'far fa-h3', 'far fa-hand-lizard', 'far fa-hand-paper', 'far fa-hand-peace', 'far fa-hand-point-down', 'far fa-hand-point-left', 'far fa-hand-point-right', 'far fa-hand-point-up', 'far fa-hand-pointer', 'far fa-hand-rock', 'far fa-hand-scissors', 'far fa-hand-spock', 'far fa-handshake', 'far fa-hashtag', 'far fa-hdd', 'far fa-heading', 'far fa-headphones', 'far fa-heart', 'far fa-heartbeat', 'far fa-hexagon', 'far fa-history', 'far fa-home', 'far fa-hospital', 'far fa-hourglass', 'far fa-hourglass-end', 'far fa-hourglass-half', 'far fa-hourglass-start', 'far fa-i-cursor', 'far fa-id-badge', 'far fa-id-card', 'far fa-image', 'far fa-images', 'far fa-inbox', 'far fa-inbox-in', 'far fa-inbox-out', 'far fa-indent', 'far fa-industry', 'far fa-industry-alt', 'far fa-info', 'far fa-info-circle', 'far fa-info-square', 'far fa-italic', 'far fa-jack-o-lantern', 'far fa-key', 'far fa-keyboard', 'far fa-language', 'far fa-laptop', 'far fa-leaf', 'far fa-lemon', 'far fa-level-down', 'far fa-level-down-alt', 'far fa-level-up', 'far fa-level-up-alt', 'far fa-life-ring', 'far fa-lightbulb', 'far fa-link', 'far fa-lira-sign', 'far fa-list', 'far fa-list-alt', 'far fa-list-ol', 'far fa-list-ul', 'far fa-location-arrow', 'far fa-lock', 'far fa-lock-alt', 'far fa-lock-open', 'far fa-lock-open-alt', 'far fa-long-arrow-alt-down', 'far fa-long-arrow-alt-left', 'far fa-long-arrow-alt-right', 'far fa-long-arrow-alt-up', 'far fa-long-arrow-down', 'far fa-long-arrow-left', 'far fa-long-arrow-right', 'far fa-long-arrow-up', 'far fa-low-vision', 'far fa-magic', 'far fa-magnet', 'far fa-male', 'far fa-map', 'far fa-map-marker', 'far fa-map-marker-alt', 'far fa-map-pin', 'far fa-map-signs', 'far fa-mars', 'far fa-mars-double', 'far fa-mars-stroke', 'far fa-mars-stroke-h', 'far fa-mars-stroke-v', 'far fa-medkit', 'far fa-meh', 'far fa-mercury', 'far fa-microchip', 'far fa-microphone', 'far fa-microphone-alt', 'far fa-microphone-slash', 'far fa-minus', 'far fa-minus-circle', 'far fa-minus-hexagon', 'far fa-minus-octagon', 'far fa-minus-square', 'far fa-mobile', 'far fa-mobile-alt', 'far fa-mobile-android', 'far fa-mobile-android-alt', 'far fa-money-bill', 'far fa-money-bill-alt', 'far fa-moon', 'far fa-motorcycle', 'far fa-mouse-pointer', 'far fa-music', 'far fa-neuter', 'far fa-newspaper', 'far fa-object-group', 'far fa-object-ungroup', 'far fa-octagon', 'far fa-outdent', 'far fa-paint-brush', 'far fa-paper-plane', 'far fa-paperclip', 'far fa-paragraph', 'far fa-paste', 'far fa-pause', 'far fa-pause-circle', 'far fa-paw', 'far fa-pen', 'far fa-pen-alt', 'far fa-pen-square', 'far fa-pencil', 'far fa-pencil-alt', 'far fa-percent', 'far fa-phone', 'far fa-phone-slash', 'far fa-phone-square', 'far fa-phone-volume', 'far fa-plane', 'far fa-plane-alt', 'far fa-play', 'far fa-play-circle', 'far fa-plug', 'far fa-plus', 'far fa-plus-circle', 'far fa-plus-hexagon', 'far fa-plus-octagon', 'far fa-plus-square', 'far fa-podcast', 'far fa-poo', 'far fa-portrait', 'far fa-pound-sign', 'far fa-power-off', 'far fa-print', 'far fa-puzzle-piece', 'far fa-qrcode', 'far fa-question', 'far fa-question-circle', 'far fa-question-square', 'far fa-quote-left', 'far fa-quote-right', 'far fa-random', 'far fa-rectangle-landscape', 'far fa-rectangle-portrait', 'far fa-rectangle-wide', 'far fa-recycle', 'far fa-redo', 'far fa-redo-alt', 'far fa-registered', 'far fa-repeat', 'far fa-repeat-1', 'far fa-repeat-1-alt', 'far fa-repeat-alt', 'far fa-reply', 'far fa-reply-all', 'far fa-retweet', 'far fa-retweet-alt', 'far fa-road', 'far fa-rocket', 'far fa-rss', 'far fa-rss-square', 'far fa-ruble-sign', 'far fa-rupee-sign', 'far fa-save', 'far fa-scrubber', 'far fa-search', 'far fa-search-minus', 'far fa-search-plus', 'far fa-server', 'far fa-share', 'far fa-share-all', 'far fa-share-alt', 'far fa-share-alt-square', 'far fa-share-square', 'far fa-shekel-sign', 'far fa-shield', 'far fa-shield-alt', 'far fa-shield-check', 'far fa-ship', 'far fa-shopping-bag', 'far fa-shopping-basket', 'far fa-shopping-cart', 'far fa-shower', 'far fa-sign-in', 'far fa-sign-in-alt', 'far fa-sign-language', 'far fa-sign-out', 'far fa-sign-out-alt', 'far fa-signal', 'far fa-sitemap', 'far fa-sliders-h', 'far fa-sliders-h-square', 'far fa-sliders-v', 'far fa-sliders-v-square', 'far fa-smile', 'far fa-snowflake', 'far fa-sort', 'far fa-sort-alpha-down', 'far fa-sort-alpha-up', 'far fa-sort-amount-down', 'far fa-sort-amount-up', 'far fa-sort-down', 'far fa-sort-numeric-down', 'far fa-sort-numeric-up', 'far fa-sort-up', 'far fa-space-shuttle', 'far fa-spade', 'far fa-spinner', 'far fa-spinner-third', 'far fa-square', 'far fa-star', 'far fa-star-exclamation', 'far fa-star-half', 'far fa-step-backward', 'far fa-step-forward', 'far fa-stethoscope', 'far fa-sticky-note', 'far fa-stop', 'far fa-stop-circle', 'far fa-stopwatch', 'far fa-street-view', 'far fa-strikethrough', 'far fa-subscript', 'far fa-subway', 'far fa-suitcase', 'far fa-sun', 'far fa-superscript', 'far fa-sync', 'far fa-sync-alt', 'far fa-table', 'far fa-tablet', 'far fa-tablet-alt', 'far fa-tablet-android', 'far fa-tablet-android-alt', 'far fa-tachometer', 'far fa-tachometer-alt', 'far fa-tag', 'far fa-tags', 'far fa-tasks', 'far fa-taxi', 'far fa-terminal', 'far fa-text-height', 'far fa-text-width', 'far fa-th', 'far fa-th-large', 'far fa-th-list', 'far fa-thermometer-empty', 'far fa-thermometer-full', 'far fa-thermometer-half', 'far fa-thermometer-quarter', 'far fa-thermometer-three-quarters', 'far fa-thumbs-down', 'far fa-thumbs-up', 'far fa-thumbtack', 'far fa-ticket', 'far fa-ticket-alt', 'far fa-times', 'far fa-times-circle', 'far fa-times-hexagon', 'far fa-times-octagon', 'far fa-times-square', 'far fa-tint', 'far fa-toggle-off', 'far fa-toggle-on', 'far fa-trademark', 'far fa-train', 'far fa-transgender', 'far fa-transgender-alt', 'far fa-trash', 'far fa-trash-alt', 'far fa-tree', 'far fa-tree-alt', 'far fa-triangle', 'far fa-trophy', 'far fa-trophy-alt', 'far fa-truck', 'far fa-tty', 'far fa-tv', 'far fa-tv-retro', 'far fa-umbrella', 'far fa-underline', 'far fa-undo', 'far fa-undo-alt', 'far fa-universal-access', 'far fa-university', 'far fa-unlink', 'far fa-unlock', 'far fa-unlock-alt', 'far fa-upload', 'far fa-usd-circle', 'far fa-usd-square', 'far fa-user', 'far fa-user-alt', 'far fa-user-circle', 'far fa-user-md', 'far fa-user-plus', 'far fa-user-secret', 'far fa-user-times', 'far fa-users', 'far fa-utensil-fork', 'far fa-utensil-knife', 'far fa-utensil-spoon', 'far fa-utensils', 'far fa-utensils-alt', 'far fa-venus', 'far fa-venus-double', 'far fa-venus-mars', 'far fa-video', 'far fa-volume-down', 'far fa-volume-mute', 'far fa-volume-off', 'far fa-volume-up', 'far fa-watch', 'far fa-wheelchair', 'far fa-wifi', 'far fa-window', 'far fa-window-alt', 'far fa-window-close', 'far fa-window-maximize', 'far fa-window-minimize', 'far fa-window-restore', 'far fa-won-sign', 'far fa-wrench', 'far fa-yen-sign',
    // Font Awesome 5 Pro Brands
    'fab fa-500px', 'fab fa-accessible-icon', 'fab fa-accusoft', 'fab fa-adn', 'fab fa-adversal', 'fab fa-affiliatetheme', 'fab fa-algolia', 'fab fa-amazon', 'fab fa-amilia', 'fab fa-android', 'fab fa-angellist', 'fab fa-angrycreative', 'fab fa-angular', 'fab fa-app-store', 'fab fa-app-store-ios', 'fab fa-apper', 'fab fa-apple', 'fab fa-apple-pay', 'fab fa-asymmetrik', 'fab fa-audible', 'fab fa-autoprefixer', 'fab fa-avianex', 'fab fa-aviato', 'fab fa-aws', 'fab fa-bandcamp', 'fab fa-behance', 'fab fa-behance-square', 'fab fa-bimobject', 'fab fa-bitbucket', 'fab fa-bitcoin', 'fab fa-bity', 'fab fa-black-tie', 'fab fa-blackberry', 'fab fa-blogger', 'fab fa-blogger-b', 'fab fa-bluetooth', 'fab fa-bluetooth-b', 'fab fa-btc', 'fab fa-buromobelexperte', 'fab fa-buysellads', 'fab fa-cc-amex', 'fab fa-cc-apple-pay', 'fab fa-cc-diners-club', 'fab fa-cc-discover', 'fab fa-cc-jcb', 'fab fa-cc-mastercard', 'fab fa-cc-paypal', 'fab fa-cc-stripe', 'fab fa-cc-visa', 'fab fa-centercode', 'fab fa-chrome', 'fab fa-cloudscale', 'fab fa-cloudsmith', 'fab fa-cloudversify', 'fab fa-codepen', 'fab fa-codiepie', 'fab fa-connectdevelop', 'fab fa-contao', 'fab fa-cpanel', 'fab fa-creative-commons', 'fab fa-css3', 'fab fa-css3-alt', 'fab fa-cuttlefish', 'fab fa-d-and-d', 'fab fa-dashcube', 'fab fa-delicious', 'fab fa-deploydog', 'fab fa-deskpro', 'fab fa-deviantart', 'fab fa-digg', 'fab fa-digital-ocean', 'fab fa-discord', 'fab fa-discourse', 'fab fa-dochub', 'fab fa-docker', 'fab fa-draft2digital', 'fab fa-dribbble', 'fab fa-dribbble-square', 'fab fa-dropbox', 'fab fa-drupal', 'fab fa-dyalog', 'fab fa-earlybirds', 'fab fa-edge', 'fab fa-ember', 'fab fa-empire', 'fab fa-envira', 'fab fa-erlang', 'fab fa-etsy', 'fab fa-expeditedssl', 'fab fa-facebook', 'fab fa-facebook-f', 'fab fa-facebook-messenger', 'fab fa-facebook-square', 'fab fa-firefox', 'fab fa-first-order', 'fab fa-firstdraft', 'fab fa-flickr', 'fab fa-fly', 'fab fa-font-awesome', 'fab fa-font-awesome-alt', 'fab fa-font-awesome-flag', 'fab fa-fonticons', 'fab fa-fonticons-fi', 'fab fa-fort-awesome', 'fab fa-fort-awesome-alt', 'fab fa-forumbee', 'fab fa-foursquare', 'fab fa-free-code-camp', 'fab fa-freebsd', 'fab fa-get-pocket', 'fab fa-gg', 'fab fa-gg-circle', 'fab fa-git', 'fab fa-git-square', 'fab fa-github', 'fab fa-github-alt', 'fab fa-github-square', 'fab fa-gitkraken', 'fab fa-gitlab', 'fab fa-gitter', 'fab fa-glide', 'fab fa-glide-g', 'fab fa-gofore', 'fab fa-goodreads', 'fab fa-goodreads-g', 'fab fa-google', 'fab fa-google-drive', 'fab fa-google-play', 'fab fa-google-plus', 'fab fa-google-plus-g', 'fab fa-google-plus-square', 'fab fa-google-wallet', 'fab fa-gratipay', 'fab fa-grav', 'fab fa-gripfire', 'fab fa-grunt', 'fab fa-gulp', 'fab fa-hacker-news', 'fab fa-hacker-news-square', 'fab fa-hire-a-helper', 'fab fa-hooli', 'fab fa-hotjar', 'fab fa-houzz', 'fab fa-html5', 'fab fa-hubspot', 'fab fa-imdb', 'fab fa-instagram', 'fab fa-internet-explorer', 'fab fa-ioxhost', 'fab fa-itunes', 'fab fa-itunes-note', 'fab fa-jenkins', 'fab fa-joget', 'fab fa-joomla', 'fab fa-js', 'fab fa-js-square', 'fab fa-jsfiddle', 'fab fa-keycdn', 'fab fa-kickstarter', 'fab fa-kickstarter-k', 'fab fa-laravel', 'fab fa-lastfm', 'fab fa-lastfm-square', 'fab fa-leanpub', 'fab fa-less', 'fab fa-line', 'fab fa-linkedin', 'fab fa-linkedin-in', 'fab fa-linode', 'fab fa-linux', 'fab fa-lyft', 'fab fa-magento', 'fab fa-maxcdn', 'fab fa-medapps', 'fab fa-medium', 'fab fa-medium-m', 'fab fa-medrt', 'fab fa-meetup', 'fab fa-microsoft', 'fab fa-mix', 'fab fa-mixcloud', 'fab fa-mizuni', 'fab fa-modx', 'fab fa-monero', 'fab fa-napster', 'fab fa-nintendo-switch', 'fab fa-node', 'fab fa-node-js', 'fab fa-npm', 'fab fa-ns8', 'fab fa-nutritionix', 'fab fa-odnoklassniki', 'fab fa-odnoklassniki-square', 'fab fa-opencart', 'fab fa-openid', 'fab fa-opera', 'fab fa-optin-monster', 'fab fa-osi', 'fab fa-page4', 'fab fa-pagelines', 'fab fa-palfed', 'fab fa-patreon', 'fab fa-paypal', 'fab fa-periscope', 'fab fa-phabricator', 'fab fa-phoenix-framework', 'fab fa-pied-piper', 'fab fa-pied-piper-alt', 'fab fa-pied-piper-pp', 'fab fa-pinterest', 'fab fa-pinterest-p', 'fab fa-pinterest-square', 'fab fa-playstation', 'fab fa-product-hunt', 'fab fa-pushed', 'fab fa-python', 'fab fa-qq', 'fab fa-quora', 'fab fa-ravelry', 'fab fa-react', 'fab fa-rebel', 'fab fa-red-river', 'fab fa-reddit', 'fab fa-reddit-alien', 'fab fa-reddit-square', 'fab fa-rendact', 'fab fa-renren', 'fab fa-replyd', 'fab fa-resolving', 'fab fa-rocketchat', 'fab fa-rockrms', 'fab fa-safari', 'fab fa-sass', 'fab fa-schlix', 'fab fa-scribd', 'fab fa-searchengin', 'fab fa-sellcast', 'fab fa-sellsy', 'fab fa-servicestack', 'fab fa-shirtsinbulk', 'fab fa-simplybuilt', 'fab fa-sistrix', 'fab fa-skyatlas', 'fab fa-skype', 'fab fa-slack', 'fab fa-slack-hash', 'fab fa-slideshare', 'fab fa-snapchat', 'fab fa-snapchat-ghost', 'fab fa-snapchat-square', 'fab fa-soundcloud', 'fab fa-speakap', 'fab fa-spotify', 'fab fa-stack-exchange', 'fab fa-stack-overflow', 'fab fa-staylinked', 'fab fa-steam', 'fab fa-steam-square', 'fab fa-steam-symbol', 'fab fa-sticker-mule', 'fab fa-strava', 'fab fa-stripe', 'fab fa-stripe-s', 'fab fa-studiovinari', 'fab fa-stumbleupon', 'fab fa-stumbleupon-circle', 'fab fa-superpowers', 'fab fa-supple', 'fab fa-telegram', 'fab fa-telegram-plane', 'fab fa-tencent-weibo', 'fab fa-themeisle', 'fab fa-trello', 'fab fa-tripadvisor', 'fab fa-tumblr', 'fab fa-tumblr-square', 'fab fa-twitch', 'fab fa-twitter', 'fab fa-twitter-square', 'fab fa-typo3', 'fab fa-uber', 'fab fa-uikit', 'fab fa-uniregistry', 'fab fa-untappd', 'fab fa-usb', 'fab fa-ussunnah', 'fab fa-vaadin', 'fab fa-viacoin', 'fab fa-viadeo', 'fab fa-viadeo-square', 'fab fa-viber', 'fab fa-vimeo', 'fab fa-vimeo-square', 'fab fa-vimeo-v', 'fab fa-vine', 'fab fa-vk', 'fab fa-vnv', 'fab fa-vuejs', 'fab fa-weibo', 'fab fa-weixin', 'fab fa-whatsapp', 'fab fa-whatsapp-square', 'fab fa-whmcs', 'fab fa-wikipedia-w', 'fab fa-windows', 'fab fa-wordpress', 'fab fa-wordpress-simple', 'fab fa-wpbeginner', 'fab fa-wpexplorer', 'fab fa-wpforms', 'fab fa-xbox', 'fab fa-xing', 'fab fa-xing-square', 'fab fa-y-combinator', 'fab fa-yahoo', 'fab fa-yandex', 'fab fa-yandex-international', 'fab fa-yelp', 'fab fa-yoast', 'fab fa-youtube',
    // PE Line Icons
   'pe pe-7s-album', 'pe pe-7s-arc', 'pe pe-7s-back-2', 'pe pe-7s-bandaid', 'pe pe-7s-car', 'pe pe-7s-diamond', 'pe pe-7s-door-lock', 'pe pe-7s-eyedropper', 'pe pe-7s-female', 'pe pe-7s-gym', 'pe pe-7s-hammer', 'pe pe-7s-headphones', 'pe pe-7s-helm', 'pe pe-7s-hourglass', 'pe pe-7s-leaf', 'pe pe-7s-magic-wand', 'pe pe-7s-male', 'pe pe-7s-map-2', 'pe pe-7s-next-2', 'pe pe-7s-paint-bucket', 'pe pe-7s-pendrive', 'pe pe-7s-photo', 'pe pe-7s-piggy', 'pe pe-7s-plugin', 'pe pe-7s-refresh-2', 'pe pe-7s-rocket', 'pe pe-7s-settings', 'pe pe-7s-shield', 'pe pe-7s-smile', 'pe pe-7s-usb', 'pe pe-7s-vector', 'pe pe-7s-wine', 'pe pe-7s-cloud-upload', 'pe pe-7s-cash', 'pe pe-7s-close', 'pe pe-7s-bluetooth', 'pe pe-7s-cloud-download', 'pe pe-7s-way', 'pe pe-7s-close-circle', 'pe pe-7s-id', 'pe pe-7s-angle-up', 'pe pe-7s-wristwatch', 'pe pe-7s-angle-up-circle', 'pe pe-7s-world', 'pe pe-7s-angle-right', 'pe pe-7s-volume', 'pe pe-7s-angle-right-circle', 'pe pe-7s-users', 'pe pe-7s-angle-left', 'pe pe-7s-user-female', 'pe pe-7s-angle-left-circle', 'pe pe-7s-up-arrow', 'pe pe-7s-angle-down', 'pe pe-7s-switch', 'pe pe-7s-angle-down-circle', 'pe pe-7s-scissors', 'pe pe-7s-wallet', 'pe pe-7s-safe', 'pe pe-7s-volume2', 'pe pe-7s-volume1', 'pe pe-7s-voicemail', 'pe pe-7s-video', 'pe pe-7s-user', 'pe pe-7s-upload', 'pe pe-7s-unlock', 'pe pe-7s-umbrella', 'pe pe-7s-trash', 'pe pe-7s-tools', 'pe pe-7s-timer', 'pe pe-7s-ticket', 'pe pe-7s-target', 'pe pe-7s-sun', 'pe pe-7s-study', 'pe pe-7s-stopwatch', 'pe pe-7s-star', 'pe pe-7s-speaker', 'pe pe-7s-signal', 'pe pe-7s-shuffle', 'pe pe-7s-shopbag', 'pe pe-7s-share', 'pe pe-7s-server', 'pe pe-7s-search', 'pe pe-7s-film', 'pe pe-7s-science', 'pe pe-7s-disk', 'pe pe-7s-ribbon', 'pe pe-7s-repeat', 'pe pe-7s-refresh', 'pe pe-7s-add-user', 'pe pe-7s-refresh-cloud', 'pe pe-7s-paperclip', 'pe pe-7s-radio', 'pe pe-7s-note2', 'pe pe-7s-print', 'pe pe-7s-network', 'pe pe-7s-prev', 'pe pe-7s-mute', 'pe pe-7s-power', 'pe pe-7s-medal', 'pe pe-7s-portfolio', 'pe pe-7s-like2', 'pe pe-7s-plus', 'pe pe-7s-left-arrow', 'pe pe-7s-play', 'pe pe-7s-key', 'pe pe-7s-plane', 'pe pe-7s-joy', 'pe pe-7s-photo-gallery', 'pe pe-7s-pin', 'pe pe-7s-phone', 'pe pe-7s-plug', 'pe pe-7s-pen', 'pe pe-7s-right-arrow', 'pe pe-7s-paper-plane', 'pe pe-7s-delete-user', 'pe pe-7s-paint', 'pe pe-7s-bottom-arrow', 'pe pe-7s-notebook', 'pe pe-7s-note', 'pe pe-7s-next', 'pe pe-7s-news-paper', 'pe pe-7s-musiclist', 'pe pe-7s-music', 'pe pe-7s-mouse', 'pe pe-7s-more', 'pe pe-7s-moon', 'pe pe-7s-monitor', 'pe pe-7s-micro', 'pe pe-7s-menu', 'pe pe-7s-map', 'pe pe-7s-map-marker', 'pe pe-7s-mail', 'pe pe-7s-mail-open', 'pe pe-7s-mail-open-file', 'pe pe-7s-magnet', 'pe pe-7s-loop', 'pe pe-7s-look', 'pe pe-7s-lock', 'pe pe-7s-lintern', 'pe pe-7s-link', 'pe pe-7s-like', 'pe pe-7s-light', 'pe pe-7s-less', 'pe pe-7s-keypad', 'pe pe-7s-junk', 'pe pe-7s-info', 'pe pe-7s-home', 'pe pe-7s-help2', 'pe pe-7s-help1', 'pe pe-7s-graph3', 'pe pe-7s-graph2', 'pe pe-7s-graph1', 'pe pe-7s-graph', 'pe pe-7s-global', 'pe pe-7s-gleam', 'pe pe-7s-glasses', 'pe pe-7s-gift', 'pe pe-7s-folder', 'pe pe-7s-flag', 'pe pe-7s-filter', 'pe pe-7s-file', 'pe pe-7s-expand1', 'pe pe-7s-exapnd2', 'pe pe-7s-edit', 'pe pe-7s-drop', 'pe pe-7s-drawer', 'pe pe-7s-download', 'pe pe-7s-display2', 'pe pe-7s-display1', 'pe pe-7s-diskette', 'pe pe-7s-date', 'pe pe-7s-cup', 'pe pe-7s-culture', 'pe pe-7s-crop', 'pe pe-7s-credit', 'pe pe-7s-copy-file', 'pe pe-7s-config', 'pe pe-7s-compass', 'pe pe-7s-comment', 'pe pe-7s-coffee', 'pe pe-7s-cloud', 'pe pe-7s-clock', 'pe pe-7s-check', 'pe pe-7s-chat', 'pe pe-7s-cart', 'pe pe-7s-camera', 'pe pe-7s-call', 'pe pe-7s-calculator', 'pe pe-7s-browser', 'pe pe-7s-box2', 'pe pe-7s-box1', 'pe pe-7s-bookmarks', 'pe pe-7s-bicycle', 'pe pe-7s-bell', 'pe pe-7s-battery', 'pe pe-7s-ball', 'pe pe-7s-back', 'pe pe-7s-attention', 'pe pe-7s-anchor', 'pe pe-7s-albums', 'pe pe-7s-alarm', 'pe pe-7s-airplay',
    ].concat(icons),
    icon_sets: {
      'glyphicon' : 'Glyphicon Halflings',
      'et' : 'ET Line Icons',
      'mat' : 'Google Material Design',
      'fa ' : 'Font Awesome 4',
      'fas' : 'Font Awesome 5 Pro Solid',
      'fal' : 'Font Awesome 5 Pro Light',
      'far' : 'Font Awesome 5 Pro Regular',
      'fab' : 'Font Awesome 5 Pro Brands',
      'pe' : 'Pixeden Line Icons'
     },
    get_value: function() {
      return $(this.dom_element).find('input[name="' + this.param_name + '"]').val();
    },
    render: function(value) {
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><input class="form-control" name="' + this.param_name +
        '" type="text" value="' + value + '"></div><p class="help-block">' + this.description +
        '</p></div>');
    },
    opened: function() {
      glazed_add_css('vendor/font-awesome/css/font-awesome.css', function() {});
      glazed_add_css('vendor/font-awesome-5-pro/css/fontawesome-all.min.css', function() {});
      glazed_add_css('vendor/et-line-font/et-line-font.css', function() {});
      glazed_add_css('vendor/material-icons/material-icons.css', function() {});
      glazed_add_css('vendor/pe-icon-7-stroke/css/pe-icon-7-stroke.css', function() {});
      var icons = $('<div class="icons"></div>').appendTo(this.dom_element);
      var $iconFilters = $('<div class="az-icon-filters clearfix"><input type="search" class="cb-search-icon pull-left" placeholder="' + Drupal.t('Search icon') + '"/></div>');
      $iconFilters.insertBefore(icons);

      var $iconsWrapper = $('<div class="cb-icons-wrapper"/>').appendTo(icons);
      var icon = '';
      for (var i = 0; i < this.icons.length; i++) {
        if (this.icons[i][0] == 'm') {
          icon = '<span class="' + this.icons[i] + ' ui-selectee">' + this.icons[i].replace('material-icons mat-', '') + '</span>';
        }
        else {
          icon = '<span class="' + this.icons[i] + ' ui-selectee"></span>';
        }
        $iconsWrapper.append(icon);
      }

      var $icons = $iconsWrapper.find('span');
      $iconFilters.find('input').on('input', _.debounce(function() {
        var searchKey = $(this).val();
        if (searchKey == '') {
          $icons.removeClass('az-search-hide');
        }
        else {
          $icons
            .removeClass('az-search-hide')
            .each(function() {
              var $icon = $(this);
              var classes = $icon.attr('class').replace('ui-selectee', '');
              $icon.toggleClass('az-search-hide', classes.indexOf(searchKey) == -1);
          })
        }
      }, 200));
      $iconFilters.append('<select class="az-icon-sets pull-right"><option value="">' + Drupal.t('All Icon Sets') + '</option></select>');
      _.each(this.icon_sets, function(icon_set, key) {
        $iconFilters.find('select').append('<option value ="' + key + '">' + icon_set + '</option>');
      });
      $iconFilters.find('select').on('change', function() {
        var searchKey = $(this).val();
        if (searchKey == '') {
          $icons.removeClass('az-filter-hide');
        }
        else {
          $icons
            .removeClass('az-filter-hide')
            .each(function() {
              var $icon = $(this);
              var classes = $icon.attr('class').replace('ui-selectee', '');
              $icon.toggleClass('az-filter-hide', classes.indexOf(searchKey) !== 0);
          })
        }
      });

      $iconsWrapper.find('.ui-selectee').click(function() {
        $iconsWrapper.find('.ui-selected').removeClass('ui-selected');
        $(this).toggleClass('ui-selected');
        var icon = $(this).attr('class').replace(/ ui-selected| ui-selectee| az-filter-hide| az-search-hide/gi, '');
        $(param.dom_element).find('input[name="' + param.param_name + '"]').val($.trim(icon));
      });

      var param = this;
      if (this.get_value() != '')
        $(icons).find('.' + $.trim(this.get_value()).replace(/ /g, '.')).addClass("ui-selected");
    },
  },

  {
    type: 'image',
    get_value: function() {
      return $(this.dom_element).find('input[name="' + this.param_name + '"]').val();
    },
    render: function(value) {
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><input class="form-control glazed-builder-image-input" name="' + this.param_name +
        '" type="text" value="' + value + '"></div><p class="help-block">' + this.description +
        '</p></div>');
    },
    opened: function() {
      image_select($(this.dom_element).find('input[name="' + this.param_name + '"]'));
    },
  },

  {
    type: 'images',
    get_value: function() {
      return $(this.dom_element).find('input[name="' + this.param_name + '"]').val();
    },
    render: function(value) {
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><input class="form-control glazed-builder-image-input" name="' + this.param_name +
        '" type="text" value="' + value + '"></div><p class="help-block">' + this.description +
        '</p></div>');
    },
    opened: function() {
      images_select($(this.dom_element).find('input[name="' + this.param_name + '"]'), ',');
    },
  },

  {
    type: 'integer_slider',
    create: function() {
      this.min = 0;
      this.max = 100;
      this.step = 1;
    },
    get_value: function() {
      var v = $(this.dom_element).find('input[name="' + this.param_name + '"]').val();
      return (v == '') ? NaN : parseFloat(v).toString();
    },
    render: function(value) {
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><input class="form-control" name="' + this.param_name +
        '" type="text" value="' + value + '"></div><div class="slider"></div><p class="help-block">' +
        this.description + '</p></div>');
    },
    opened: function() {
      nouislider($(this.dom_element).find('.slider'), this.min, this.max, this.get_value(), this.step, $(this.dom_element)
        .find('input[name="' + this.param_name + '"]'));
    },
  },

  {
    type: 'javascript',
    safe: false,
    get_value: function() {
      return $(this.dom_element).find('#' + this.id).val();
    },
    opened: function() {
      var param = this;
      glazed_add_js({
        path: 'vendor/ace/ace.js',
        callback: function() {
          var aceeditor = ace.edit(param.id);
          aceeditor.setTheme("ace/theme/chrome");
          aceeditor.getSession().setMode("ace/mode/javascript");
          aceeditor.setOptions({
            minLines: 10,
            maxLines: 30,
          });
          $(param.dom_element).find('#' + param.id).val(aceeditor.getSession().getValue());
          aceeditor.on(
            'change',
            function(e) {
              $(param.dom_element).find('#' + param.id).val(aceeditor.getSession().getValue());
              aceeditor.resize();
            }
          );
        }
      });
    },
    render: function(value) {
      this.id = _.uniqueId();
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading + '</label><div id="' +
        this.id + '"><textarea class="form-control" rows="10" cols="45" name="' + this.param_name +
        '" ">' + value + '</textarea></div><p class="help-block">' + this.description + '</p></div>'
      );
    },
  },

  {
    type: 'link',
    get_value: function() {
      return $(this.dom_element).find('input[name="' + this.param_name + '"]').val();
    },
    render: function(value) {
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><input class="form-control" name="' + this.param_name +
        '" type="text" value="' + value + '"></div><p class="help-block">' + this.description +
        '</p></div>');
    },
  },

  {
    type: 'links',
    get_value: function() {
      return $(this.dom_element).find('#' + this.id).val();
    },
    render: function(value) {
      this.id = _.uniqueId();
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><textarea id="' + this.id + '" class="form-control" rows="10" cols="45" name="' + this.param_name + '" ">' + value +
        '</textarea></div><p class="help-block">' + this.description + '</p></div>');
    },
  },

  {
    type: 'rawtext',
    safe: false,
    get_value: function() {
      return $(this.dom_element).find('#' + this.id).val();
    },
    render: function(value) {
      this.id = _.uniqueId();
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><textarea id="' + this.id + '" class="form-control" rows="10" cols="45" name="' + this.param_name + '" ">' + value +
        '</textarea></div><p class="help-block">' + this.description + '</p></div>');
    },
  },

  {
    type: 'saved_datetime',
    get_value: function() {
      return (new Date).toUTCString();
    },
  },

  {
    type: 'style',
    create: function() {
      this.important = false;
    },
    get_value: function() {
      var imp = '';
      if (this.important) {
        imp = ' !important';
      }
      var style = '';
      var margin_top = $(this.dom_element).find('[name="margin_top"]').val();
      if (margin_top != '') {
        if ($.isNumeric(margin_top))
          margin_top = margin_top + 'px';
        style += 'margin-top:' + margin_top + imp + ';';
      }
      var margin_bottom = $(this.dom_element).find('[name="margin_bottom"]').val();
      if (margin_bottom != '') {
        if ($.isNumeric(margin_bottom))
          margin_bottom = margin_bottom + 'px';
        style += 'margin-bottom:' + margin_bottom + imp + ';';
      }
      var margin_left = $(this.dom_element).find('[name="margin_left"]').val();
      if (margin_left != '') {
        if ($.isNumeric(margin_left))
          margin_left = margin_left + 'px';
        style += 'margin-left:' + margin_left + imp + ';';
      }
      var margin_right = $(this.dom_element).find('[name="margin_right"]').val();
      if (margin_right != '') {
        if ($.isNumeric(margin_right))
          margin_right = margin_right + 'px';
        style += 'margin-right:' + margin_right + imp + ';';
      }
      var border_top_width = $(this.dom_element).find('[name="border_top_width"]').val();
      if (border_top_width != '') {
        if ($.isNumeric(border_top_width))
          border_top_width = border_top_width + 'px';
        style += 'border-top-width:' + border_top_width + imp + ';';
      }
      var border_bottom_width = $(this.dom_element).find('[name="border_bottom_width"]').val();
      if (border_bottom_width != '') {
        if ($.isNumeric(border_bottom_width))
          border_bottom_width = border_bottom_width + 'px';
        style += 'border-bottom-width:' + border_bottom_width + imp + ';';
      }
      var border_left_width = $(this.dom_element).find('[name="border_left_width"]').val();
      if (border_left_width != '') {
        if ($.isNumeric(border_left_width))
          border_left_width = border_left_width + 'px';
        style += 'border-left-width:' + border_left_width + imp + ';';
      }
      var border_right_width = $(this.dom_element).find('[name="border_right_width"]').val();
      if (border_right_width != '') {
        if ($.isNumeric(border_right_width))
          border_right_width = border_right_width + 'px';
        style += 'border-right-width:' + border_right_width + imp + ';';
      }
      var padding_top = $(this.dom_element).find('[name="padding_top"]').val();
      if (padding_top != '') {
        if ($.isNumeric(padding_top))
          padding_top = padding_top + 'px';
        style += 'padding-top:' + padding_top + imp + ';';
      }
      var padding_bottom = $(this.dom_element).find('[name="padding_bottom"]').val();
      if (padding_bottom != '') {
        if ($.isNumeric(padding_bottom))
          padding_bottom = padding_bottom + 'px';
        style += 'padding-bottom:' + padding_bottom + imp + ';';
      }
      var padding_left = $(this.dom_element).find('[name="padding_left"]').val();
      if (padding_left != '') {
        if ($.isNumeric(padding_left))
          padding_left = padding_left + 'px';
        style += 'padding-left:' + padding_left + imp + ';';
      }
      var padding_right = $(this.dom_element).find('[name="padding_right"]').val();
      if (padding_right != '') {
        if ($.isNumeric(padding_right))
          padding_right = padding_right + 'px';
        style += 'padding-right:' + padding_right + imp + ';';
      }
      var color = $(this.dom_element).find('#' + this.color_id).val();
      if (color != '') {
        style += 'color:' + color + imp + ';';
      }
      var fontsize = $(this.dom_element).find('[name="fontsize"]').val();
      if (fontsize != 0) {
        if ($.isNumeric(fontsize))
          fontsize = Math.round(fontsize) + 'px';
        style += 'font-size:' + fontsize + imp + ';';
      }
      var border_color = $(this.dom_element).find('#' + this.border_color_id).val();
      if (border_color != '') {
        style += 'border-color:' + border_color + imp + ';';
      }
      var border_radius = $(this.dom_element).find('[name="border_radius"]').val();
      if (border_radius != 0) {
        if ($.isNumeric(border_radius))
          border_radius = Math.round(border_radius) + 'px';
        style += 'border-radius:' + border_radius + imp + ';';
      }
      var border_style = $(this.dom_element).find('select[name="border_style"] > option:selected').val();
      if (border_style != '') {
        style += 'border-style:' + border_style + imp + ';';
      }
      var bg_color = $(this.dom_element).find('#' + this.bg_color_id).val();
      if (bg_color) {
        style += 'background-color:' + bg_color + imp + ';';
      }
      var bg_image = $(this.dom_element).find('[name="bg_image"]').val();
      if (bg_image) {
        style += 'background-image: url(' + encodeURI(bg_image) + ');';
      }
      var background_style = $(this.dom_element).find('select[name="background_style"] > option:selected').val();
      if (background_style.match(/repeat/)) {
        style += 'background-repeat: ' + background_style + imp + ';';
      }
      else if (background_style.match(/cover|contain/)) {
        style += 'background-repeat: no-repeat;';
        style += 'background-size: ' + background_style + imp + ';';
      }
      var background_position = $(this.dom_element).find('select[name="background_position"] > option:selected').val();
      if (background_position != '') {
        style += 'background-position:' + background_position + imp + ';';
      }
      var opacity = $(this.dom_element).find('[name="opacity"]').val();
      if (opacity != 0) {
        style += 'opacity:' + opacity + imp + ';';
      }
      return style;
    },
    render: function(value) {
      value = value.replace(/!important/g, '');
      var output = '<div class="style">';
      var match = null;
      var v = '';
      output += '<div class="layout pane-1">';
      output += '<div class="margin"><label>' + Drupal.t('Margin') + '</label>';
      match = value.match(/margin-top[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="margin_top" type="text" placeholder="-" value="' + v + '">';
      match = value.match(/margin-bottom[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="margin_bottom" type="text" placeholder="-" value="' + v + '">';
      match = value.match(/margin-left[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="margin_left" type="text" placeholder="-" value="' + v + '">';
      match = value.match(/margin-right[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="margin_right" type="text" placeholder="-" value="' + v + '">';
      output += '<div class="border"><label>' + Drupal.t('Border') + '</label>';
      match = value.match(/border-top-width[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="border_top_width" type="text" placeholder="-" value="' + v + '">';
      match = value.match(/border-bottom-width[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="border_bottom_width" type="text" placeholder="-" value="' + v + '">';
      match = value.match(/border-left-width[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="border_left_width" type="text" placeholder="-" value="' + v + '">';
      match = value.match(/border-right-width[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="border_right_width" type="text" placeholder="-" value="' + v + '">';
      output += '<div class="padding"><label>' + Drupal.t('Padding') + '</label>';
      match = value.match(/padding-top[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="padding_top" type="text" placeholder="-" value="' + v + '">';
      match = value.match(/padding-bottom[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="padding_bottom" type="text" placeholder="-" value="' + v + '">';
      match = value.match(/padding-left[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="padding_left" type="text" placeholder="-" value="' + v + '">';
      match = value.match(/padding-right[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<input name="padding_right" type="text" placeholder="-" value="' + v + '">';
      output += '<div class="content">';
      output += '</div></div></div></div>';
      output += '</div>';
      output += '<div class="settings pane-2">';
      output += '<div class="font form-group"><label>' + Drupal.t('Font color') + '</label>';
      this.color_id = _.uniqueId();
      match = value.match(/(^| |;)color[: ]*\s?([^;]{4,}) *;/);
      if (match == null)
        v = '';
      else
        v = match[2];
      output += '<div><input id="' + this.color_id + '" name="color" type="text" value="' + v + '"></div></div>';
      output += '<div class="border form-group"><label>' + Drupal.t('Border color') + '</label>';
      this.border_color_id = _.uniqueId();
      match = value.match(/border-color[: ]*\s?([^;]{4,}) *;/);
      if (match == null)
        v = '';
      else
        v = match[1];
      output += '<div><input id="' + this.border_color_id + '" name="border_color" type="text" value="' + v +
        '"></div></div>';
      output += '<div class="background form-group"><label>' + Drupal.t('Background') + '</label>';
      this.bg_color_id = _.uniqueId();
      match = value.match(/background-color[: ]*\s?([^;]{4,}) *;/);
      if (match == null)
        v = '';
      else
        v = match[1];
      output += '<div><input id="' + this.bg_color_id + '" name="bg_color" type="text" value="' + v +
        '"></div>';
      this.bg_image_id = _.uniqueId();
      match = value.match(/background-image[: ]*url\(([^\)]+)\) *;/);
      if (match == null)
        v = '';
      else
        v = decodeURI(match[1]);
      output += '<input id="' + this.bg_image_id + '" name="bg_image" class="form-control glazed-builder-image-input" type="text" value="' + v + '"></div>';
      match = value.match(/background-repeat[: ]*([-\w]*) *;/);
      if (match == null) {
        v = '';
      }
      else {
        if (match[1] == 'repeat') {
          v = match[1];
        }
        else {
          if (match[1] == 'repeat-x') {
            v = 'repeat-x';
          }
          else {
            match = value.match(/background-size[: ]*([-\w]*) *;/);
            if (match == null) {
              v = 'no-repeat';
            }
            else {
              v = match[1];
            }
          }
        }
      }
      output += '<div class="form-group"><label>' + Drupal.t('Background style') + '</label><div class="form-controls"><select name="background_style" class="form-control">';
      var background_styles = {
        '': Drupal.t("Theme defaults"),
        'cover': Drupal.t("Cover"),
        'contain': Drupal.t("Contain"),
        'no-repeat': Drupal.t("No Repeat"),
        'repeat': Drupal.t("Repeat"),
      };
      for (var key in background_styles) {
        if (key == v)
          output += '<option selected value="' + key + '">' + background_styles[key] + '</option>';
        else
          output += '<option value="' + key + '">' + background_styles[key] + '</option>';
      }
      output += '</select>';
      output += '</div>';
      output += '</div>';
      match = value.match(/background-position[: ]*([\s\w]*) *;/);
      if (match == null)
        v = '';
      else
        v = match[1];
      output += '<div class="form-group"><label>' + Drupal.t('Background position') + '</label><div class="form-controls"><select name="background_position" class="form-control">';
      var background_position = {
        '': Drupal.t("Theme defaults"),
        'center center': Drupal.t("Center  Center"),
        'left top': Drupal.t("Left Top"),
        'left center': Drupal.t("Left Center"),
        'left bottom': Drupal.t("Left Bottom"),
        'right top': Drupal.t("Right Top"),
        'right center': Drupal.t("Right Center"),
        'right bottom': Drupal.t("Right Bottom"),
        'center bottom': Drupal.t("Center Bottom"),
        'center top': Drupal.t("Center Top"),
      };
      for (var key in background_position) {
        if (key == v)
          output += '<option selected value="' + key + '">' + background_position[key] + '</option>';
        else
          output += '<option value="' + key + '">' + background_position[key] + '</option>';
      }
      output += '</select>';
      output += '</div></div>';


      match = value.match(/border-style[: ]*(\w*) *;/);
      if (match == null)
        v = '';
      else
        v = match[1];
      output += '<div class="form-group"><label>' + Drupal.t('Border style') + '</label><div class="form-controls"><select name="border_style" class="form-control">';
      var border_styles = {
        '': Drupal.t("Theme defaults"),
        'solid': Drupal.t("Solid"),
        'dotted': Drupal.t("Dotted"),
        'dashed': Drupal.t("Dashed"),
        'none': Drupal.t("None"),
      };
      for (var key in border_styles) {
        if (key == v)
          output += '<option selected value="' + key + '">' + border_styles[key] + '</option>';
        else
          output += '<option value="' + key + '">' + border_styles[key] + '</option>';
      }
      output += '</select>';
      output += '</div></div>';
      match = value.match(/font-size[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<div class="form-group"><label>' + Drupal.t('Font size') + '</label><div class="form-controls"><input name="fontsize" class="form-control bootstrap-slider" type="text" value="' + v + '"></div></div>';
      match = value.match(/border-radius[: ]*([\-\d\.]*)(px|%|em) *;/);
      if (match == null)
        v = '';
      else
        v = match[1] + match[2];
      output += '<div class="form-group"><label>' + Drupal.t('Border radius') + '</label><div class="form-controls"><input name="border_radius" class="form-control bootstrap-slider" type="text" value="' + v + '"></div></div>';
      match = value.match(/opacity[: ]*([\d\.]*) *;/);
      if (match == null)
        v = '';
      else
        v = match[1];
      output += '<div class="form-group"><label>' + Drupal.t('Opacity') +'</label><div class="form-controls"><input name="opacity" class="form-control bootstrap-slider" type="text" value="' + v + '"></div>';
      output += '</div>';
      output += '</div>';
      output += '</div>';
      this.dom_element = $(output);
    },
    opened: function() {
      image_select($(this.dom_element).find('input[name="bg_image"]'));
      colorpicker('#' + this.color_id);
      colorpicker('#' + this.border_color_id);
      colorpicker('#' + this.bg_color_id);
      initBootstrapSlider($(this.dom_element).find('input[name="opacity"]'), 0, 1, $(this.dom_element).find(
        'input[name="opacity"]').val(), 0.01);

      initBootstrapSlider($(this.dom_element).find('input[name="fontsize"]'), 0, 100, $(this.dom_element).find(
        'input[name="fontsize"]').val(), 1, true);
      initBootstrapSlider($(this.dom_element).find('input[name="border_radius"]'), 0, 100, $(this.dom_element).find(
        'input[name="border_radius"]').val(), 1);
    },
  },

  {
    type: 'textarea',
    safe: false,
    get_value: function() {
      // Return data.
      return CKEDITOR.instances[this.id].getData();
    },
    render: function(value) {
      this.id = _.uniqueId();
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><textarea id="' + this.id + '" rows="10" cols="45" name="' + this.param_name + '" ">' +
        value + '</textarea></div><p class="help-block">' + this.description + '</p></div>');
    },
    opened: function() {
      var param = this;
      if ('glazed_ckeditor' in window) {
        window.glazed_ckeditor($(this.dom_element).find('#' + param.id));
      }
      else {
        function ckeditor_add_editor() {

          // Don't add spaces to empty blocks
          CKEDITOR.config.fillEmptyBlocks = false;
          // Disabling content filtering.
          CKEDITOR.config.allowedContent = true;
          // Prevent wrapping inline content in paragraphs
          CKEDITOR.config.autoParagraph = false;

          // Theme integration
          CKEDITOR.config.contentsCss = ['//cdn.jsdelivr.net/bootstrap/3.3.7/css/bootstrap.min.css'];
          if (typeof window.Drupal.settings.glazed.glazedPath.length != "undefined") {
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
          CKEDITOR.config.toolbar = [{
            name: 'basicstyles',
            items: ['Bold', 'Italic', 'Underline', 'Strike', 'Superscript', 'Subscript', 'RemoveFormat']
          }, {
            name: 'paragraph',
            items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', 'BulletedList',
              'NumberedList', 'Outdent', 'Indent', 'Blockquote', 'CreateDiv'
            ]
          }, {
            name: 'clipboard',
            items: ['Undo', 'Redo', 'PasteText', 'PasteFromWord']
          }, {
            name: 'links',
            items: ['Link', 'Unlink']
          }, {
            name: 'insert',
            items: ['Image', 'HorizontalRule', 'SpecialChar', 'Table', 'Templates']
          }, {
            name: 'colors',
            items: ['TextColor']
          }, {
            name: 'document',
            items: ['Source']
          }, {
            name: 'tools',
            items: ['ShowBlocks', 'Maximize']
          }, {
            name: 'styles',
            items: ['Format', 'Styles', 'FontSize']
          }, {
            name: 'editing',
            items: ['Scayt']
          }, ];

          CKEDITOR.config.fontSize_sizes = '8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;36/36px;48/48px;60/60px;72/72px;90/90px;117/117px;144/144px';

          // Don't move about our Glazed Builder stylesheet link tags
          CKEDITOR.config.protectedSource.push(/<link.*?>/gi);

          CKEDITOR.replace(param.id);
        }
        if ('CKEDITOR' in window) {
          ckeditor_add_editor();
        }
        else {
          glazed_add_js({
            path: 'vendor/ckeditor/ckeditor.js',
            callback: function() {
              if (_.isObject(CKEDITOR)) {
                ckeditor_add_editor();
              }
            }
          });
        }
      }
    },
    closed: function() {
      // Destroy ckeditor.
      CKEDITOR.instances[this.id].destroy();
    }
  },

  {
    type: 'textfield',
    get_value: function() {
      return $(this.dom_element).find('input[name="' + this.param_name + '"]').val();
    },
    render: function(value) {
      var required = this.required ? 'required' : '';
      this.dom_element = $('<div class="form-group form-group--' + this.param_name + '"><label>' + this.heading +
        '</label><div><input class="form-control" name="' + this.param_name +
        '" type="text" value="' + value + '" ' + required + '></div><p class="help-block">' + this.description +
        '</p></div>');
    }
  },

];

if ('glazed_param_types' in window) {
  window.glazed_param_types = window.glazed_param_types.concat(glazed_param_types);
}
else {
  window.glazed_param_types = glazed_param_types;
}

})(window.jQuery);
