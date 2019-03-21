(function($) {
  var p = '';
  var fp = '';
  if ('glazed_prefix' in window) {
    p = window.glazed_prefix;
    fp = window.glazed_prefix.replace('-', '_');
  }

  function t(text) {
    if ('glazed_t' in window) {
      return window.glazed_t(text);
    } else {
      return text;
    }
  }

  var target_options = {
    '_self': Drupal.t('Same window'),
    '_blank': Drupal.t('New window'),
  };

  var colors = [];
  colors['brand'] = Drupal.t('Brand color');
  colors[''] = Drupal.t('Custom');
  colors['inherit'] = Drupal.t('Inherit');
  // Helped function for add button styles.
  function getButtonsStyle() {
    var keys = [p + 'btn-default', p + 'btn-primary', p + 'btn-success', p + 'btn-info', p + 'btn-warning', p + 'btn-danger', p + 'btn-link'];
    var value = [p + 'btn-default', p + 'btn-primary', p + 'btn-success', p + 'btn-info', p + 'btn-warning', p + 'btn-danger', p + 'btn-link'];
    for (var name in window.button_styles) {
      value.push(p + name);
      keys.push(window.button_styles[p + name]);
    }
    return _.object(keys, value);
  }
  var glazed_elements = [

  {
    base: 'az_alert',
    name: Drupal.t('Alert'),
    icon: 'et et-icon-caution',
    // description: Drupal.t('Alert box'),
    params: [{
      type: 'textfield',
      heading: Drupal.t('Message'),
      param_name: 'message',
      value: Drupal.t(
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      ),
    },
  {
      type: 'dropdown',
      heading: Drupal.t('Type'),
      param_name: 'type',
      description: Drupal.t('Select message type.'),
      value: _.object([p + 'alert-success','alert-info','alert-warning','alert-danger'], [Drupal.t(
        'Success'), Drupal.t('Info'), Drupal.t('Warning'), Drupal.t('Danger')]),
    },],
    show_settings_on_create: true,
    render: function($) {
      this.dom_element = $('<div class="az-element az-alert alert ' + this.attrs['type'] + ' ' + this.get_el_classes() + '" style="' + this.attrs['style'] + '">' + this.attrs['message'] + '</div>');
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_blockquote',
    name: Drupal.t('Blockquote'),
    icon: 'et et-icon-quote',
    // description: Drupal.t('Blockquote box'),
    params: [{
      type: 'textarea',
      heading: Drupal.t('Text'),
      param_name: 'content',
      value: Drupal.t(
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      ),
    }, {
      type: 'textfield',
      heading: Drupal.t('Cite'),
      param_name: 'cite',
    }, {
      type: 'checkbox',
      heading: Drupal.t('Reverse?'),
      param_name: 'reverse',
      value: {
        'blockquote-reverse': Drupal.t("Yes"),
      },
    }, ],
    show_settings_on_create: true,
    // controls_base_position: 'top-left',
    is_container: true,
    has_content: true,
    render: function($) {
      var reverse = this.attrs['reverse'];
      if (reverse != '')
        reverse = p + reverse;
      this.dom_element = $('<blockquote class="az-element az-blockquote ' + this.get_el_classes() + ' ' +
        reverse + '" style="' + this.attrs['style'] + '">' + this.attrs['content'] + '</blockquote>');
      this.dom_content_element = this.dom_element;

      // Condition to check existing item.
      var str = '<footer><cite>' + this.attrs['cite'] + '</cite></footer>';
      var innerHtml = $(this.dom_element).html().indexOf(str);
      if (this.attrs['cite'] != '' && innerHtml < 0)
        $(this.dom_element).append(str);
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_button',
    name: Drupal.t('Button'),
    icon: 'pe pe-7s-mouse',
    // description: Drupal.t('Button'),
    params: [{
      type: 'textfield',
      heading: Drupal.t('Title'),
      param_name: 'title',
      description: Drupal.t('Text on the button'),
    }, {
      type: 'link',
      heading: Drupal.t('Link'),
      param_name: 'link',
      description: Drupal.t('Button link (url).'),
    }, {
      type: 'dropdown',
      heading: Drupal.t('Link target'),
      param_name: 'link_target',
      description: Drupal.t('Select where to open link.'),
      value: target_options,
      dependency: {
        'element': 'link',
        'not_empty': {}
      },
    }, {
      type: 'dropdown',
      heading: Drupal.t('Type'),
      param_name: 'type',
      value: getButtonsStyle()
    }, {
      type: 'checkbox',
      heading: Drupal.t('Block button'),
      param_name: 'block',
      value: {
        'btn-block': Drupal.t("Yes"),
      },
    }, {
      type: 'dropdown',
      heading: Drupal.t('Size'),
      param_name: 'size',
      value: _.object(['','btn-lg','btn-sm','btn-xs'], [Drupal.t('Normal'), Drupal.t('Large'), Drupal.t('Small'), Drupal.t(
        'Extra small')]),
    }, ],
    show_settings_on_create: true,
    style_selector: '> .btn',
    render: function($) {
      if (this.attrs['link'] == '') {
        this.dom_element = $('<div class="az-element az-button ' + this.get_el_classes() +
          '"><button type="button" class="btn ' + this.attrs['type'] + ' ' + this.attrs['size'] + ' ' + this.attrs['block'] +
          '" style="' + this.attrs['style'] + '">' + this.attrs['title'] + '</button></div>');
      }
      else {
        this.dom_element = $('<div class="az-element az-button ' + this.get_el_classes() + '"><a href="' +
          this.attrs['link'] + '" type="button" class="btn ' + this.attrs['type'] + ' ' + this.attrs['size'] + ' ' + this.attrs['block'] +
          '" style="' + this.attrs['style'] + '" target="' + this.attrs['link_target'] + '">' +
          this.attrs['title'] + '</a></div>');
      }
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_circle_counter',
    name: Drupal.t('Circle counter'),
    icon: 'et et-icon-speedometer',
    // description: Drupal.t('Infographic Counter'),
    params: [{
      type: 'colorpicker',
      heading: Drupal.t('Foreground color'),
      param_name: 'fgcolor',
      value: '#333333',
    }, {
      type: 'colorpicker',
      heading: Drupal.t('Background color'),
      param_name: 'bgcolor',
      value: '#999999',
    }, {
      type: 'colorpicker',
      heading: Drupal.t('Fill'),
      param_name: 'fill',
    }, {
      type: 'checkbox',
      heading: Drupal.t('Half Circle'),
      param_name: 'type',
      value: {
        'half': Drupal.t("Yes"),
      },
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Dimension'),
      param_name: 'dimension',
      max: '500',
      value: '250',
    }, {
      type: 'textfield',
      heading: Drupal.t('Text'),
      param_name: 'text',
      tab: Drupal.t('Circle content'),
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Font size'),
      param_name: 'fontsize',
      max: '100',
      value: '16',
      formatter: true,
      tab: Drupal.t('Circle content'),
    }, {
      type: 'textfield',
      heading: Drupal.t('Info'),
      param_name: 'info',
      tab: Drupal.t('Circle content'),
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Width'),
      param_name: 'width',
      max: '100',
      value: '5',
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Percent'),
      param_name: 'percent',
      max: '100',
      value: '50',
    }, {
      type: 'dropdown',
      heading: Drupal.t('Border style'),
      param_name: 'border',
      value: {
        'default': Drupal.t('Default'),
        'inline': Drupal.t('Inline'),
        'outline': Drupal.t('Outline'),
      },
    }, {
      type: 'icon',
      heading: Drupal.t('Icon'),
      param_name: 'icon',
      tab: Drupal.t('Icon'),
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Icon size'),
      param_name: 'icon_size',
      max: '100',
      description: Drupal.t('Will set the font size of the icon.'),
      value: '16',
      tab: Drupal.t('Icon'),
    }, {
      type: 'colorpicker',
      heading: Drupal.t('Icon color'),
      param_name: 'icon_color',
      description: Drupal.t('Will set the font color of the icon.'),
      tab: Drupal.t('Icon'),
    }, ],
    show_settings_on_create: true,
    frontend_render: true,
    showed: function($) {
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
    render: function($) {
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
  },

  {
    base: 'az_countdown',
    name: Drupal.t('Countdown Timer'),
    icon: 'et et-icon-clock',
    // description: Drupal.t('Count to date/time'),
    params: [{
      type: 'dropdown',
      heading: Drupal.t('Countdown style'),
      param_name: 'countdown_style',
      description: Drupal.t('Select the style for the countdown element.'),
      value: {
        'plain': Drupal.t('Plain'),
        'style1': Drupal.t('Grid'),
        'style6': Drupal.t('3D Flip'),
        'style9': Drupal.t('Disc'),
        'style10': Drupal.t('Airport Style'),
        'style12': Drupal.t('Transparent'),
      },
    }, {
      type: 'dropdown',
      heading: Drupal.t('Date / Time Limitations'),
      param_name: 'counter_scope',
      description: Drupal.t('Select the countdown scope in terms of date and time.'),
      value: {
        'date': Drupal.t('Specify Date Only'),
        'date_time': Drupal.t('Specify Date and Time'),
        'repeating': Drupal.t('Specifiy Time Only (repeating on every day)'),
        'resetting': Drupal.t('Resetting Counter (set interval up to 24 hours)'),
      },
    }, {
      type: 'datetime',
      heading: Drupal.t('Date'),
      param_name: 'date',
      datepicker: true,
      description: Drupal.t('Select the date to which you want to count down to.'),
      formatDate: 'd.m.Y',
      dependency: {
        'element': 'counter_scope',
        'value': ['date']
      },
    }, {
      type: 'datetime',
      heading: Drupal.t('Date / Time'),
      param_name: 'date_time',
      timepicker: true,
      datepicker: true,
      description: Drupal.t('Select the date and time to which you want to count down to.'),
      formatDate: 'd.m.Y',
      formatTime: 'H',
      dependency: {
        'element': 'counter_scope',
        'value': ['date_time']
      },
    }, {
      type: 'datetime',
      heading: Drupal.t('Time'),
      param_name: 'time',
      timepicker: true,
      description: Drupal.t('Select the time on the day above to which you want to count down to.'),
      formatTime: 'H',
      dependency: {
        'element': 'counter_scope',
        'value': ['repeating']
      },
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Reset in Hours'),
      param_name: 'reset_hours',
      max: 24,
      description: Drupal.t('Define the number of hours until countdown reset.'),
      dependency: {
        'element': 'counter_scope',
        'value': ['resetting']
      },
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Reset in Minutes'),
      param_name: 'reset_minutes',
      max: 60,
      description: Drupal.t('Define the number of minutes until countdown reset.'),
      dependency: {
        'element': 'counter_scope',
        'value': ['resetting']
      },
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Reset in Seconds'),
      param_name: 'reset_seconds',
      max: 60,
      description: Drupal.t('Define the number of seconds until countdown reset.'),
      dependency: {
        'element': 'counter_scope',
        'value': ['resetting']
      },
    }, {
      type: 'link',
      heading: Drupal.t('Page Referrer'),
      param_name: 'referrer',
      description: Drupal.t('Provide an optional link to another site/page to be opened after countdown expires.'),
      dependency: {
        'element': 'counter_scope',
        'value': ['repeating', 'resetting']
      },
    }, {
      type: 'checkbox',
      heading: Drupal.t('Automatic Restart'),
      param_name: 'restart',
      description: Drupal.t('Switch the toggle if you want to restart the countdown after each expiration.'),
      value: {
        'yes': Drupal.t("Yes"),
      },
      dependency: {
        'element': 'counter_scope',
        'value': ['resetting']
      },
    }, {
      type: 'saved_datetime',
      param_name: 'saved',
    }, {
      type: 'checkbox',
      heading: Drupal.t('Display Options'),
      param_name: 'display',
      value: {
        'days': Drupal.t("Show Remaining Days"),
        'hours': Drupal.t("Show Remaining Hours"),
        'minutes': Drupal.t("Show Remaining Minutes"),
        'seconds': Drupal.t("Show Remaining Seconds"),
      },
    }, ],
    show_settings_on_create: true,
    frontend_render: true,
    showed: function($) {
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
    render: function($) {
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
  },

  {
    base: 'az_counter',
    name: Drupal.t('Number Counter'),
    icon: 'et et-icon-hourglass',
    // description: Drupal.t('Count up or down'),
    params: [{
      type: 'textfield',
      heading: Drupal.t('Start'),
      param_name: 'start',
      description: Drupal.t('Enter the number to start counting from.'),
      value: '0',
    }, {
      type: 'textfield',
      heading: Drupal.t('End'),
      param_name: 'end',
      description: Drupal.t('Enter the number to count up to.'),
      value: '100',
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Font Size'),
      param_name: 'fontsize',
      max: '200',
      description: Drupal.t('Select the font size for the counter number.'),
      value: '30',
      formatter: true,
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Speed'),
      param_name: 'speed',
      max: '10000',
      description: Drupal.t('Select the speed in ms for the counter to finish.'),
      value: '2000',
    }, {
      type: 'dropdown',
      heading: Drupal.t('Thousand Seperator'),
      param_name: 'seperator',
      description: Drupal.t('Select a character to seperate thousands in the end number.'),
      value: {
        '': Drupal.t('None'),
        ',': Drupal.t('Comma'),
        '.': Drupal.t('Dot'),
        ' ': Drupal.t('Space'),
      },
    }, {
      type: 'textfield',
      heading: Drupal.t('Prefix'),
      param_name: 'prefix',
      description: Drupal.t('Enter any character to be shown before the number (i.e. $).'),
    }, {
      type: 'textfield',
      heading: Drupal.t('Postfix'),
      param_name: 'postfix',
      description: Drupal.t('Enter any character to be shown after the number (i.e. %).'),
    }, ],
    show_settings_on_create: true,
    showed: function($) {
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
    render: function($) {
      this.dom_element = $('<div class="az-element az-counter"><div id="' + this.id + '" class="' + this.get_el_classes() + '" style="' + this.attrs['style'] + '">' + this.attrs['start'] + '</div></div>');
      $(this.dom_element).find('#' + this.id).css('font-size', this.attrs['fontsize'] + 'px');
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_html',
    name: Drupal.t('HTML'),
    icon: 'et et-icon-search',
    // description: Drupal.t('HTML Editor'),
    params: [{
      type: 'html',
      heading: Drupal.t('Raw html'),
      param_name: 'content',
      description: Drupal.t('Enter your HTML content.'),
      value: Drupal.t('<p>Click the edit button to change this HTML</p>'),
    },],
    show_settings_on_create: true,
    is_container: true,
    has_content: true,
    render: function($) {
      this.dom_element = $('<div class="az-element az-html ' + this.get_el_classes() + '" style="' + this.attrs[
          'style'] + '">' + this.attrs['content'] + '</div>');
      this.dom_content_element = this.dom_element;
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_icon',
    name: Drupal.t('Icon'),
    icon: 'et et-icon-strategy',
    // description: Drupal.t('Vector icon'),
    params: [{
      type: 'icon',
      heading: Drupal.t('Icon'),
      param_name: 'icon',
    }, {
      type: 'dropdown',
      heading: Drupal.t('Icon Size'),
      param_name: 'size',
      value: _.object(['fa-lg', '', 'fa-2x', 'fa-3x', 'fa-4x', 'fa-5x'], [Drupal.t('Large'), Drupal.t('Normal'), Drupal.t('2x'), Drupal.t(
        '3x'), Drupal.t('4x'), Drupal.t('5x')]),
    }, {
      type: 'dropdown',
      heading: Drupal.t('Style'),
      param_name: 'st_style',
      value: {
        '': Drupal.t('None'),
        'stbe-util-icon-rounded': Drupal.t('Rounded'),
        'stbe-util-icon-circle': Drupal.t('Circle'),
        'stbe-util-icon-square': Drupal.t('Square'),
      },
      tab: Drupal.t('Icon Utilities')
    }, {
      type: 'dropdown',
      heading: Drupal.t('Icon Animation'),
      param_name: 'animation',
      value: _.object(['', 'fa-spin', 'fa-pulse'], [Drupal.t('No'), Drupal.t('Spin'), Drupal.t('Pulse')]),
      tab: Drupal.t('Icon Utilities')
    }, {
      type: 'dropdown',
      heading: Drupal.t('Icon Orientation'),
      param_name: 'orientation',
      value: _.object(['', 'fa-rotate-90', 'fa-rotate-180', 'fa-rotate-270', 'fa-flip-horizontal',
        'fa-flip-vertical'
      ], [Drupal.t('Normal'), Drupal.t('Rotate 90'), Drupal.t('Rotate 180'), Drupal.t('Rotate 270'), Drupal.t('Flip Horizontal'), Drupal.t(
        'Flip Vertical')]),
      tab: Drupal.t('Icon Utilities')
    }, {
      type: 'link',
      heading: Drupal.t('Link'),
      param_name: 'link',
      description: Drupal.t('Icon link (url).'),
    }, {
      type: 'dropdown',
      heading: Drupal.t('Link target'),
      param_name: 'link_target',
      description: Drupal.t('Select where to open link.'),
      value: target_options,
      dependency: {
        'element': 'link',
        'not_empty': {}
      },
    },],
    show_settings_on_create: true,
    style_selector: '> i',
    render: function($) {
      var ligature = '';
      var icon_set = this.attrs['icon'].substring(0,3);
      switch (icon_set) {
        case 'et ':
          // ET Icons
          this.add_css('vendor/et-line-font/et-line-font.css', 'ETLineFont' in $.fn, function() {});
          this.add_css('css/icon-helpers.css', 'IconHelpers' in $.fn, function() {});
          break;
        case 'mat':
          // Google Material Icons
          this.add_css('vendor/material-icons/material-icons.css', 'materialIcons' in $.fn, function() {});
          ligature = this.attrs['icon'].replace('material-icons mat-', '');
          break;
        case 'fa ':
          // Font Awesome Icons
          this.add_css('vendor/font-awesome/css/font-awesome.min.css', 'fontAwesome' in $.fn, function() {});
          break;
        case 'fas':
        case 'far':
        case 'fal':
        case 'fab':
          // Font Awesome 5 Pro Icons
          this.add_css('vendor/font-awesome-5-pro/css/fontawesome-all.min.css', 'fontAwesome5Pro' in $.fn, function() {});
          break;
        case 'gly':
          // Glyphicons
          this.add_css('css/icon-helpers.css', 'IconHelpers' in $.fn, function() {});
          break;
        case 'pe ':
          // Pixeden Icons
          this.add_css('vendor/pe-icon-7-stroke/css/pe-icon-7-stroke.css', 'PELineFont' in $.fn, function() {});
          this.add_css('css/icon-helpers.css', 'IconHelpers' in $.fn, function() {});
          break;
        default:
          break;
      }

      var icon_style = '';
      // Foreground color
      if (this.attrs['st_theme_color'] == '') {
        icon_style = icon_style + 'color: ' + this.attrs['st_color'] + ';';
      }
      else {
        if ('sooperthemes_theme_palette' in window && window.sooperthemes_theme_palette != null && this.attrs[
            'st_theme_color'] in window.sooperthemes_theme_palette)
          icon_style = icon_style + 'color: ' + window.sooperthemes_theme_palette[this.attrs['st_theme_color']] +
            ';';
        else
          icon_style = icon_style + 'color: ' + this.attrs['st_theme_color'] + ';';
      }
      // Background color
      if (this.attrs['st_theme_bgcolor'] == '') {
        icon_style = icon_style + 'background-color: ' + this.attrs['st_bgcolor'] + ';';
      }
      else {
        if ('sooperthemes_theme_palette' in window && window.sooperthemes_theme_palette != null && this.attrs[
            'st_theme_bgcolor'] in window.sooperthemes_theme_palette)
          icon_style = icon_style + 'background-color: ' + window.sooperthemes_theme_palette[this.attrs[
              'st_theme_bgcolor']] + ';';
        else
          icon_style = icon_style + 'background-color: ' + this.attrs['st_theme_bgcolor'] + ';';
      }
      var icon_html = '<div class="az-element az-icon ' + this.get_el_classes() + '"><i class="' + this.attrs[
          'icon'] + ' ' + this.attrs['size'] + ' ' + this.attrs['st_style'] + ' ' + this.attrs['fw'] + ' ' +
        this.attrs['pull'] + ' ' + this.attrs['animation'] + ' ' + this.attrs['orientation'] + '" style="' +
        this.attrs['style'] + icon_style + '">' + ligature + '</i></div>';
      if (this.attrs['link'] == '') {
        this.dom_element = $(icon_html);
      }
      else {
        this.dom_element = $('<a href="' + this.attrs['link'] + '" class="az-element az-icon ' + this.get_el_classes() +
        '" target="' + this.attrs['link_target'] + '">' + icon_html + '</a>');
      }
      $(this.dom_element).css('font-size', this.attrs['size'] + 'px');
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_image',
    name: Drupal.t('Image'),
    icon: 'et et-icon-picture',
    // description: Drupal.t('Single image'),
    params: [{
      type: 'image',
      heading: Drupal.t('Image'),
      param_name: 'image',
      description: Drupal.t('Select image from media library.'),
    }, {
      type: 'textfield',
      heading: Drupal.t('Image width'),
      param_name: 'width',
      description: Drupal.t('For example 100px, or 50%.'),
      can_be_empty: true,
      value: '100%',
    }, {
      type: 'textfield',
      heading: Drupal.t('Image height'),
      description: Drupal.t('For example 100px, or 50%.'),
      can_be_empty: true,
      param_name: 'height',
    }, {
      type: 'link',
      heading: Drupal.t('Image link'),
      param_name: 'link',
      description: Drupal.t('Enter URL if you want this image to have a link.'),
    }, {
      type: 'dropdown',
      heading: Drupal.t('Image link target'),
      param_name: 'link_target',
      description: Drupal.t('Select where to open link.'),
      value: target_options,
      dependency: {
        'element': 'link',
        'not_empty': {}
      },
    }, {
      type: 'textfield',
      heading: Drupal.t('Alt attribute'),
      param_name: 'alt',
      description: Drupal.t('Image description'),
      can_be_empty: true,
      value: '',
      tab: Drupal.t('SEO'),
    }, {
      type: 'textfield',
      heading: Drupal.t('Title attribute'),
      param_name: 'title',
      description: Drupal.t('Additional information about the image'),
      can_be_empty: true,
      value: '',
      tab: Drupal.t('SEO'),
    },],
    frontend_render: true,
    show_settings_on_create: true,
    render: function($) {
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
  },

  {
    base: 'az_images_carousel',
    name: Drupal.t('Image carousel'),
    icon: 'et et-icon-pictures',
    // description: Drupal.t('Image Slider'),
    params: [{
      type: 'images',
      heading: Drupal.t('Images'),
      param_name: 'images',
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Interval'),
      param_name: 'interval',
      max: '10000',
      value: '5000',
    }, {
      type: 'checkbox',
      heading: Drupal.t('Hide'),
      param_name: 'hide',
      value: {
        'pagination_control': Drupal.t("Hide pagination control"),
        'prev_next_buttons': Drupal.t("Hide prev/next buttons"),
      },
    }, {
      type: 'textfield',
      heading: Drupal.t('Alt attribute'),
      param_name: 'alt',
      description: Drupal.t('Topic of image carousel'),
      can_be_empty: true,
      value: '',
      tab: Drupal.t('SEO'),
    }, {
      type: 'textfield',
      heading: Drupal.t('Title attribute'),
      param_name: 'title',
      description: Drupal.t('Additional information about the images'),
      can_be_empty: true,
      value: '',
      tab: Drupal.t('SEO'),
    },],
    show_settings_on_create: true,
    showed: function($) {
      this.baseclass.prototype.showed.apply(this, arguments);
      var element = this;
      $(this.dom_element)['carousel']({
        interval: this.attrs['interval'],
        pause: 'hover',
      });
    },
    render: function($) {
      var id = this.id;
      var element = this;
      var images = this.attrs['images'].split(',');
      this.dom_element = $('<div id="' + this.id + '" class="az-element az-images-carousel carousel ' +
        'slide ' + this.get_el_classes() + '" data-ride="carousel" style="' + this.attrs['style'] +
        '"></div>');
      var hide = this.attrs['hide'].split(',');
      if ($.inArray('pagination_control', hide) < 0) {
        var indicators = $('<ol class="carousel-indicators"></ol>');
        for (var i = 0; i < images.length; i++) {
          $(indicators).append('<li data-target="#' + this.id + '" data-slide-to="' + i + '"></li>');
        }
        $(this.dom_element).append(indicators);
      }

      var inner = $('<div class="carousel-inner"></div>');
      for (var i = 0; i < images.length; i++) {
        var item = $('<img class="item" style="width:100%" src="' + images[i] + '" alt="' + this.attrs['alt'] + '" title="' + this.attrs['title'] + '">').appendTo(inner);
      }
      $(this.dom_element).append(inner);
      if ($.inArray('prev_next_buttons', hide) < 0) {
        var controls = $('<a class="left carousel-control" href="#' + this.id +
          '" data-slide="prev"><span class="glyphicon glyphicon-chevron-left"></span></a><a class="right carousel-control" href="#' +
          this.id + '" data-slide="next"><span class="glyphicon glyphicon-chevron-right"></span></a>');
        $(this.dom_element).append(controls);
      }

      $(this.dom_element).find('.carousel-indicators li:first').addClass(p + 'active');
      $(this.dom_element).find('.carousel-inner .item:first').addClass(p + 'active');
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_jumbotron',
    name: Drupal.t('Jumbotron'),
    icon: 'et et-icon-megaphone',
    // description: Drupal.t('Big Box'),
    params: [],
    is_container: true,
    controls_base_position: 'top-left',
    render: function($) {
      this.dom_element = $('<div class="az-element az-ctnr az-jumbotron jumbotron ' + this.get_el_classes() + '" style="' + this.attrs['style'] + '"></div>');
      this.dom_content_element = this.dom_element;
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_link',
    name: Drupal.t('Link'),
    icon: 'et et-icon-attachment fa-flip-horizontal',
    // description: Drupal.t('Link wrapper'),
    params: [{
      type: 'link',
      heading: Drupal.t('Link'),
      param_name: 'link',
      description: Drupal.t('Content link (url).'),
    }, {
      type: 'dropdown',
      heading: Drupal.t('Link target'),
      param_name: 'link_target',
      description: Drupal.t('Select where to open link.'),
      value: target_options,
      dependency: {
        'element': 'link',
        'not_empty': {}
      },
    },],
    is_container: true,
    controls_base_position: 'top-left',
    show_settings_on_create: true,
    show_controls: function() {
      if (window.glazed_editor) {
        this.baseclass.prototype.show_controls.apply(this, arguments);
        $(this.dom_content_element).click(function() {
          return !$(this).closest('.az-container').hasClass('glazed-editor');
        });
      }
    },
    render: function($) {
      this.dom_element = $('<div class="az-element az-link ' + this.get_el_classes() + '"></div>');
      this.dom_content_element = $('<a href="' + this.attrs['link'] + '" class="az-ctnr" target="' + this.attrs[
          'link_target'] + '"></a>').appendTo(this.dom_element);
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_map',
    name: Drupal.t('Map'),
    icon: 'et et-icon-map',
    params: [{
      type: 'textfield',
      heading: Drupal.t('Address'),
      param_name: 'address',
      description: Drupal.t('1865 Winchester Blvd #202 Campbell, CA 95008'),
      can_be_empty: false
    }, {
      type: 'textfield',
      heading: Drupal.t('Map width'),
      param_name: 'width',
      description: Drupal.t('For example 100px, or 50%.'),
      can_be_empty: true,
      value: '100%'
    }, {
      type: 'textfield',
      heading: Drupal.t('Map Height'),
      description: Drupal.t('For example 100px, or 50%.'),
      can_be_empty: true,
      param_name: 'height',
      value: '400px'
    }],
    show_settings_on_create: true,
    is_container: true,
    has_content: true,
    render: function($) {
      this.dom_element = $('<div style="line-height: 0;" class="az-element az-map ' + this.get_el_classes() + '"></div>');
      function render_map(address, style, width, height) {
        address = address.replace(' ', '+');
        if ($.isNumeric(width))
          width = width + 'px';
        if ($.isNumeric(height))
          height = height + 'px';
        var map = $('<iframe src="https://maps.google.com/maps?q=' + address +
          '&iwloc=near&output=embed" frameborder="0"></<iframe>');
        $(map).attr('style', style);
        if (width.length > 0)
          $(map).css('width', width);
        if (height.length > 0)
          $(map).css('height', height);
        return map;
      }
      var map = render_map(this.attrs['address'], this.attrs['style'], this.attrs['width'], this.attrs['height']);
      $(map).appendTo(this.dom_element);
      this.baseclass.prototype.render.apply(this, arguments);
    }
  },

  {
    base: 'az_panel',
    name: Drupal.t('Panel'),
    icon: 'et et-icon-focus',
    // description: Drupal.t('Content Panel'),
    params: [{
      type: 'textfield',
      heading: Drupal.t('Title'),
      param_name: 'title',
    },],
    is_container: true,
    controls_base_position: 'top-left',
    render: function($) {
      this.dom_element = $('<div class="az-element az-panel panel ' + this.get_el_classes() + ' ' +
        this.attrs['type'] + '" style="' + this.attrs['style'] + '"></div>');
      if (this.attrs['title'] != '') {
        var heading = $('<div class="panel-heading"><h3 class="panel-title">' + this.attrs[
            'title'] + '</div></div>');
        $(this.dom_element).append(heading);
      }
      var body = $('<div class="panel-body az-ctnr"></div>').appendTo(this.dom_element);
      this.dom_content_element = body;
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_progress_bar',
    name: Drupal.t('Progress Bar'),
    icon: 'et et-icon-bargraph fa-rotate-90',
    // description: Drupal.t('Animated progress bar'),
    params: [{
      type: 'textfield',
      heading: Drupal.t('Label'),
      param_name: 'label',
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Progress'),
      param_name: 'width',
      value: '50',
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Bar height'),
      param_name: 'height',
      value: '3',
    }, {
      type: 'colorpicker',
      heading: Drupal.t('Back Color'),
      param_name: 'bgcolor',
    }, {
      type: 'colorpicker',
      heading: Drupal.t('Front Color'),
      param_name: 'fcolor',
    }, {
      type: 'dropdown',
      heading: Drupal.t('Type'),
      param_name: 'type',
      hidden: true,
      value: _.object(['','progress-bar-success','progress-bar-info','progress-bar-warning',
        'progress-bar-danger'
      ], [Drupal.t('Default'), Drupal.t('Success'), Drupal.t('Info'), Drupal.t('Warning'), Drupal.t('Danger')]),
    }, {
      type: 'checkbox',
      heading: Drupal.t('Options'),
      param_name: 'options',
      value: {
        'progress-striped': Drupal.t("Add Stripes?"),
        'active': Drupal.t("Add animation? Will be visible with striped bars."),
      },
    },],
    render: function($) {
      var height = this.attrs['height'] + 'px';
      var options = this.attrs['options'];
      if (options != '')
        options = _.map(options.split(','), function(value) {
          return p + value;
        }).join(' ');
      this.dom_element = $('<div class="az-element az-progress-bar progress ' + this.get_el_classes() +
        ' ' + options + '" style="' + this.attrs['style'] + '"><div class="progress-bar ' + this.attrs[
          'type'] + '" role="progressbar" aria-valuenow="' + this.attrs['width'] +
        '" aria-valuemin="0" aria-valuemax="100" style="width: ' + this.attrs['width'] + '%; line-height: ' + height + ';">' + this.attrs[
          'label'] + '</div></div>');
      $(this.dom_element).css('height', height).css('min-height', height).css('line-height', height);
      // Back Color
      if (this.attrs['bgcolor']) {
        $(this.dom_element).css('background-color', this.attrs['bgcolor']);
      }
      // Front Color
      if (this.attrs['fcolor']) {
        $(this.dom_element).find('.progress-bar').css('background-color', this.attrs['fcolor']);
      }
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_separator',
    name: Drupal.t('Divider'),
    icon: 'et et-icon-scissors',
    params: [{
      type: 'colorpicker',
      heading: Drupal.t('Color'),
      param_name: 'bgcolor',
    }, {
      type: 'dropdown',
      heading: Drupal.t('Thickness'),
      param_name: 'thickness',
      value: {
        'auto': Drupal.t('Theme Default'),
        'custom': Drupal.t('Custom Thickness'),
      },
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Thickness'),
      param_name: 'custom_thickness',
      max: '20',
      value: '3',
      dependency: {
        'element': 'thickness',
        'value': ['custom'],
      },
    }, {
      type: 'dropdown',
      heading: Drupal.t('Length'),
      param_name: 'width',
      value: {
        'auto': Drupal.t('Theme Default'),
        'custom': Drupal.t('Custom Width'),
      },
    }, {
      type: 'bootstrap_slider',
      heading: Drupal.t('Width'),
      param_name: 'custom_width',
      description: Drupal.t('Select where to open link.'),
      max: '500',
      value: '100',
      step: '10',
      dependency: {
        'element': 'width',
        'value': ['custom'],
      },
    }, {
      type: 'dropdown',
      heading: Drupal.t('Align'),
      param_name: 'align',
      value: {
        'left': Drupal.t('Left'),
        'center': Drupal.t('Center'),
        'right': Drupal.t('Right'),
      },
      dependency: {
        'element': 'width',
        'value': ['custom'],
      },
    },],
    // description: Drupal.t('Horizontal separator'),
    render: function($) {
      var divider_style = 'border: none;';
      // Stroke Width
      if ((this.attrs['thickness'] == 'custom') && this.attrs['custom_thickness']) {
        divider_style = divider_style + 'height: ' + this.attrs['custom_thickness'] + 'px;';
      }
      // Color
      if (this.attrs['bgcolor']) {
        divider_style = divider_style + 'background-color: ' + this.attrs['bgcolor'] + ';';
      }
      // Stroke Length
      if ((this.attrs['width'] == 'custom')) {
        if ( this.attrs['custom_width'] > 0) {
          divider_style = divider_style + 'width: ' + this.attrs['custom_width'] + 'px;';
        }
        else {
          divider_style = divider_style + 'width: 100%;';
        }
        // Align divider
        if (this.attrs['align'] == 'left') {
          divider_style = divider_style + 'margin-left: 0;margin-right: auto;';
        }
        else if (this.attrs['align'] == 'center') {
          divider_style = divider_style + 'margin-left: auto;margin-right: auto;';
        }
        else if (this.attrs['align'] == 'right') {
          divider_style = divider_style + 'margin-left: auto;margin-right: 0;';
        }
      }
       this.dom_element = $('<hr class="az-element az-separator ' + this.get_el_classes() + '" style="' + this.attrs[
           'style'] + divider_style + '"></hr>');
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_text',
    name: Drupal.t('Text'),
    icon: 'et et-icon-document',
    // description: Drupal.t('Text with editor'),
    params: [{
      type: 'textarea',
      heading: Drupal.t('Text'),
      param_name: 'content',
      value: '<h2>Lorem ipsum dolor sit amet.</h2> Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    },],
    show_settings_on_create: true,
    is_container: true,
    has_content: true,
    render: function($) {
      this.dom_element = $('<div class="az-element az-text ' + this.get_el_classes() + '" style="' + this.attrs[
          'style'] + '">' + this.attrs['content'] + '</div>');
      this.dom_content_element = this.dom_element;
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

  {
    base: 'az_video',
    name: Drupal.t('Video'),
    icon: 'et et-icon-video',
    // description: Drupal.t('YouTube / Vimeo video'),
    params: [{
      type: 'textfield',
      heading: Drupal.t('Video link'),
      param_name: 'link',
      description: Drupal.t('Link Youtube or Vimeo video'),
    }, {
      type: 'textfield',
      heading: Drupal.t('Video width'),
      param_name: 'width',
      description: Drupal.t('For example 100px, or 50%.'),
      value: '100%',
    }, {
      type: 'image',
      heading: Drupal.t('Image'),
      param_name: 'image',
      description: Drupal.t('Select image from media library.'),
    }, {
      type: 'checkbox',
      heading: Drupal.t('Themed Play Button'),
      param_name: 'play',
      value: {
        'yes': Drupal.t("Yes"),
      },
    },],
    show_settings_on_create: true,
    showed: function($) {
      this.baseclass.prototype.showed.apply(this, arguments);
      var $domElement = $(this.dom_element);
      $domElement.find('.az-video-play, .az-video-icon').bind('click', function () {
        var $iframe = $domElement.find('iframe');
        $iframe.attr('src', $iframe.attr('src') + '&autoplay=1').show();
        $domElement.find('.az-video-play, .az-video-icon').hide();
      });
    },
    render: function($) {
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
      function vimeo_parser(url) {
        var m = url.match(/^.+vimeo.com\/(.*\/)?([^#\?]*)/);
        return m ? m[2] || m[1] : false;
      }
      var url = youtube_parser(this.attrs['link']);
      if (url) {
        url = '//www.youtube.com/embed/' + url + '?rel=0&showinfo=0';
      }
      else {
        url = vimeo_parser(this.attrs['link']);
        if (url) {
          url = '//player.vimeo.com/video/' + url;
        }
        else {
          url = '';
        }
      }
      this.dom_element = $('<div class="az-element az-video embed-responsive embed-responsive-16by9 ' + this.get_el_classes() + '" style="' + this.attrs['style'] + '"></div>');

      function renderVideo(url, style, width, height, image) {
        if ($.isNumeric(width))
          width = width + 'px';
        var iframe = $('<iframe src="' + url +
          '" type="text/html" webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder="0"></iframe>'
        );
        iframe.attr('style', style);
        if (width.length > 0)
          iframe.css('width', width);
        if (image != '') {
          iframe.css('z-index', 1).hide();
        }
        return iframe;
      }
      function renderPlayButton(image, width, height) {
        if (image.length > 0) {
          var playButton = $('<div class="az-video-play"></div>');
          playButton.css('background-image', 'url(' + image + ')')
            .css('background-position', 'center')
            .css('background-repeat', 'no-repeat')
            .css('background-size', 'cover')
            .css('cursor', 'pointer')
            .css('position', 'absolute')
            .css('height', '100%')
            .css('width', '100%');
          if ($.isNumeric(width))
            width = width + 'px';
          playButton.width(width );
          if ($.isNumeric(height))
            height = height + 'px';
          playButton.height(height + 'px');
          return playButton;
        } else {
          return '';
        }
      }

      var playButton = renderPlayButton(this.attrs['image'], this.attrs['width'], this.attrs['height']);
      if (playButton != '') {
        $(playButton).appendTo(this.dom_element);
      }

      var video = renderVideo(url, this.attrs['style'], this.attrs['width'], this.attrs['height'], this.attrs['image']);
      $(video).appendTo(this.dom_element);

      if (this.attrs['play']) {
        var $videoIcon = $('<i class="az-video-icon bg-primary glyphicon glyphicon-play fa-2x ' + this.attrs['icon'] + '"></i>');
        $videoIcon.appendTo(this.dom_element);
      }

      this.baseclass.prototype.render.apply(this, arguments);
    }
  },

  {
    base: 'az_well',
    name: Drupal.t('Well'),
    icon: 'et et-icon-focus',
    // description: Drupal.t('Content box'),
    params: [{
      type: 'dropdown',
      heading: Drupal.t('Type'),
      param_name: 'type',
      value: _.object(
        [p,'well-lg','well-sm'], [Drupal.t('Default'), Drupal.t('Large'), Drupal.t('Small')]
      )
    }],
    is_container: true,
    controls_base_position: 'top-left',
    render: function($) {
      this.dom_element = $('<div class="az-element az-well well ' + this.get_el_classes() + ' ' +
        this.attrs['type'] + '" style="' + this.attrs['style'] + '"></div>');
      var body = $('<div class="az-ctnr"></div>').appendTo(this.dom_element);
      this.dom_content_element = body;
      this.baseclass.prototype.render.apply(this, arguments);
    }
  },

  {
    base: 'st_social',
    name: Drupal.t('Social links'),
    icon: 'et et-icon-twitter',
    // description: Drupal.t('Branded Social Links'),
    params: [{
      type: 'html',
      heading: Drupal.t('Social links'),
      param_name: 'st_social_links',
      description: Drupal.t(
        'Enter a social brand and URL per line. Example: Facebook="https://www.facebook.com/"'),
      value: "Facebook='https://www.facebook.com/'\nYouTube='https://www.youtube.com/'",
    }, {
      type: 'dropdown',
      heading: Drupal.t('Layout'),
      param_name: 'st_type',
      value: {
        'inline': Drupal.t('Inline'),
        'stacked': Drupal.t('Stacked'),
      },
    }, {
      type: 'dropdown',
      heading: Drupal.t('Style'),
      param_name: 'st_style',
      value: {
        '': Drupal.t('None'),
        'rounded': Drupal.t('Rounded'),
        'circle': Drupal.t('Circle'),
        'square': Drupal.t('Square'),
      },
    }, {
      type: 'dropdown',
      heading: Drupal.t('Size'),
      param_name: 'st_size',
      value: {
        'lg': Drupal.t('Large'),
        '': Drupal.t('Small'),
        '2x': Drupal.t('2x'),
        '3x': Drupal.t('3x'),
        '4x': Drupal.t('4x'),
        '5x': Drupal.t('5x'),
      },
    }, {
      type: 'dropdown',
      heading: Drupal.t('Color'),
      param_name: 'st_theme_color',
      value: colors,
      tab: Drupal.t('Icon Colors')
    }, {
      type: 'colorpicker',
      heading: Drupal.t('Color'),
      param_name: 'st_color',
      dependency: {
        'element': 'st_theme_color',
        'is_empty': {}
      },
      tab: Drupal.t('Icon Colors')
    }, {
      type: 'dropdown',
      heading: Drupal.t('Background Color'),
      param_name: 'st_theme_bgcolor',
      value: colors,
      tab: Drupal.t('Icon Colors')
    }, {
      type: 'colorpicker',
      heading: Drupal.t('Background Color'),
      param_name: 'st_bgcolor',
      dependency: {
        'element': 'st_theme_bgcolor',
        'is_empty': {}
      },
      tab: Drupal.t('Icon Colors')
    }, {
      type: 'dropdown',
      heading: Drupal.t('Hover color'),
      param_name: 'st_hover_color',
      value: {
        'brand': Drupal.t('Brand color'),
        'inherit': Drupal.t('Inherit'),
        '': Drupal.t('None'),
      },
      tab: Drupal.t('Icon Colors')
    }, {
      type: 'dropdown',
      heading: Drupal.t('Border color'),
      param_name: 'st_theme_border_color',
      value: colors,
      tab: Drupal.t('Icon Colors')
    }, {
      type: 'colorpicker',
      heading: Drupal.t('Border color'),
      param_name: 'st_border_color',
      dependency: {
        'element': 'st_theme_border_color',
        'is_empty': {}
      },
      tab: Drupal.t('Icon Colors')
    }, {
      type: 'dropdown',
      heading: Drupal.t('CSS3 Hover Effects'),
      description: Drupal.t('Setting a CSS3 Hover effect will automatically make the icon a circle-style icon.'),
      param_name: 'st_css3_hover_effects',
      value: {
        '': Drupal.t('None'),
        'disc': Drupal.t('Disc'),
        'pulse': Drupal.t('Pulse'),
      },
    }, ],
    show_settings_on_create: true,
    render: function($) {
      this.add_css('css/social.css', 'socialLink' in $.fn, function() {});
      this.add_css('css/icon-helpers.css', 'IconHelpers' in $.fn, function() {});
      this.add_css('vendor/font-awesome/css/font-awesome.min.css', 'fontAwesome' in $.fn, function() {});
      this.dom_element = $('<ul class="az-element st-social stbe-social-links ' + this.get_el_classes() +
        '" style="' + this.attrs['style'] + '"></ul>');
      if (this.attrs['st_theme_bgcolor'] == 'brand')
        $(this.dom_element).addClass('stbe-social-links--bgcolor-brand');
      if (this.attrs['st_hover_bgcolor'] == 'brand')
        $(this.dom_element).addClass('stbe-social-links--hover-bgcolor-brand');
      if (this.attrs['st_theme_color'] == 'brand')
        $(this.dom_element).addClass('stbe-social-links--color-brand');
      if (this.attrs['st_hover_color'] == 'brand')
        $(this.dom_element).addClass('stbe-social-links--hover-color-brand');
      if (this.attrs['st_type'] == 'stacked')
        $(this.dom_element).addClass('stbe-social-links-stacked');

      var icon_style = '';
      // Foreground color
      if (this.attrs['st_color'] && (this.attrs['st_theme_color'] == '')) {
        icon_style = icon_style + 'color: ' + this.attrs['st_color'] + ';';
      }
      // Background color
      if (this.attrs['st_bgcolor'] && (this.attrs['st_theme_bgcolor'] == '')) {
        icon_style = icon_style + 'background-color: ' + this.attrs['st_bgcolor'] + ';';
      }
      // Border color
      if (this.attrs['st_border_color'] && (this.attrs['st_theme_border_color'] == '')) {
        icon_style = icon_style + 'border-color: ' + this.attrs['st_border_color'] + ';';
      }
      var links = this.attrs['st_social_links'].split("\n");
      for (var i in links) {
        if (links[i] != '') {
          var link = links[i].split("=");
          var name = link[0].replace(/['"]+/g, '').toLowerCase();
          var url = link[1].replace(/['"]+/g, '');
          var icon_classes = ['fa'];
          icon_classes.push('fa-' + this.attrs['st_size']);
          icon_classes.push('fa-' + name);
          icon_classes.push('stbe-util-icon-' + this.attrs['st_style']);
          if (this.attrs['st_css3_hover_effects'])
            icon_classes.push('stbe-util-icon-fx');
            icon_classes.push('stbe-util-fx-' + this.attrs['st_css3_hover_effects']);
          if (this.attrs['st_border_color'] != '' || this.attrs['st_theme_border_color'] != '')
            icon_classes.push('stbe-util-icon-border');
          $(this.dom_element).append('<li class="stbe-social-links__item"><a href="' + url + '"><i class="' +
            icon_classes.join(' ') + '" style="' + icon_style +
            '" data-toggle="tooltip" data-placement="top auto" title="' + name + '"></i></a></li>')
        }
      }
      this.baseclass.prototype.render.apply(this, arguments);
    },
  },

];
if ('glazed_elements' in window) {
  window.glazed_elements = window.glazed_elements.concat(glazed_elements);
} else {
  window.glazed_elements = glazed_elements;
}


})(window.jQuery);
