/**
 * @file
 * A JavaScript file initiates the ac_drupal.js library
 */

(function ($) {
  var p = '';
  var fp = '';
  if ('glazed_prefix' in window) {
    p = window.glazed_prefix;
    fp = window.glazed_prefix.replace('-', '_');
  }

  // Select direct image style.
  function glazed_builder_select(options, input) {
    // Create a selectbox containing image styles as options
    var single_select = '<select>';
    for (var key in options) {
      single_select = single_select + '<option value="' + key + '">' + options[key] + '</option>';
    }
    single_select = single_select + '</select>';

    // Hide the text field that contains the chosen image style value
    // $(input).css('display', 'none');

    var select = $(single_select).insertAfter(input);
    // If we find an image style in the text field, set it as "selected" in the selection widget
    if ($(input).val().length) {
      $(select).append('<option value=""></option>');
      var value = $(input).val();
      // Add option if it doesn't exist
      if (!$(select).find('option[value="' + value + '"]').length) {
        $(select).append('<option value="' + value + '">"' + value + '"</option>');
      }
      // Set the "selected" attribute on the option that matches the value we found in the text field
      $(select).find('option[value="' + value + '"]').attr("selected", "selected");
    }
    else {
      $(select).append('<option value="" selected></option>');
    }
    // Add the Chosen selectbox behavior to add interactive features to image style selection
    $(select).chosen({
      search_contains: true,
      allow_single_deselect: true
    });
    // Set fixed width to chosen-enhanced widget
    $(select).parent().find('.chosen-container').width('260px');
    // If we detect a change in the selectbox, add selected value to input text field
    $(select).change(function () {
      $(this).find('option:selected').each(function () {
        $(input).val($(this).val());
      });
    });
    return select;
  }

  // Select image style from option.
  window.images_select = function (input, delimiter) {
    // $(input).css('display', 'none');
    $(input).wrap('<div class="ac-select-image"></div>'); // Add wrapper for image widget
    $imageSelectWrapper = $(input).closest('.ac-select-image');

    // Add the Image Style text input field
    var image_styles_input = $('<input type="text" name="image_style" style="display: none">')
      .prependTo($(input)
      .closest('.ac-select-image'));
    $imageSelectWrapper.prepend('<label style="width: 100%;">' + Drupal.t('Resize Image') + '</label>');

    // Create a container for holding Thumbnails
    $imageSelectWrapper.prepend('<ul class="preview"></ul>');

    // Create button
    $imageSelectWrapper.prepend('<button class="ac-select-image btn btn-default">' + Drupal.t('Add Image') + '</button>');

    // START MEDIA MODULE INTEGRATION
    // Link the button the the Media Browser API, powered by Drupal Media module
    // @see https://www.drupal.org/project/media
    // @see http://cgit.drupalcode.org/media/tree/js/media.popups.js?h=7.x-2.x
    $imageSelectWrapper.once('mediaBrowserLaunch', function () {
      Drupal.media.popups.getDialogOptions = function () {
        return {
          title: Drupal.t('Media browser'),
          buttons: {},
          dialogClass: 'media-wrapper',
          modal: true,
          draggable: true,
          resizable: true,
          position: 'center',
          overlay: {
            backgroundColor: '#000000',
            opacity: 0.4
          },
          zIndex: 10000,
          close: function (event, ui) {
            $(event.target).remove();
          }
        };
      };
      // If we have a delimiter passed in it means we support multiple images
      var multiselect = (delimiter != '');
      globalOptions = {
        types: ['image'],
        multiselect: multiselect,
        activePlugins: ['upload', 'media_default--media_browser_1'],
        file_directory: 'glazed-builder'
      };
      // END MEDIA MODULE INTEGRATION

      // Image Style Handling (resizing images)
      var $fileInput = $(input);
      var $preview = $imageSelectWrapper.find('.preview');
      var src = '';
      if (delimiter == '') {
        src = $(input).val(); // Single image field, value = image URL
      }
      else {
        src = $(input).val().split(delimiter).pop(); // Multi image field, extract URL of first item
      }
      if (src) {
        var parts = src.split('/styles/');
        if (parts.length == 2) {
          var path = parts[1].split('/');
          $(image_styles_input).val(path.shift());
        }
      }
      var image_styles_select = glazed_builder_select(Drupal.settings.glazed_builder.image_styles, image_styles_input);

      // Bind to Chosen change event to refresh URLs when needed
      $(image_styles_select).chosen().change(function () {
        refresh_value($preview, input);
      });

      // Copy value of URL(s) text input field for a second time
      var value = $fileInput.val();
      var previews = '';
      var srcs = [];
      if (value) {
        if (delimiter == '') {
          srcs = [value]; // copy URL to srcs array
        }
        else {
          srcs = value.split(delimiter); // multiple URLs to srcs array
        }
        // Loop over sources and create thumbnails in unordered list
        _.each(srcs, function (url) {
          previews = previews + '<li class="added"><div class="inner" style="width: 75px; height: 75px; overflow: hidden;text-align: center;">';
          previews = previews + '<img src="' + url + '">';
          previews = previews + '</div><a href="#" class="glyphicon glyphicon-remove"></a></li>';
        });
        $preview.html(previews);
        $preview.find('.glyphicon-remove').click(function () {
          $(this).closest('li').remove();
          refresh_value($preview, input);
        });

        $preview.sortable({
          items: 'li',
          placeholder: 'az-sortable-placeholder',
          forcePlaceholderSize: true,
          over: function (event, ui) {
            ui.placeholder.attr('class', ui.helper.attr('class'));
            ui.placeholder.attr('width', ui.helper.attr('width'));
            ui.placeholder.attr('height', ui.helper.attr('height'));
            ui.placeholder.removeClass('ui-sortable-helper');
            ui.placeholder.addClass('az-sortable-placeholder');
          },
          update: function () {
            refresh_value($preview, input);
          }
        });
      }

      // When someone clicks the button to pick media (or clicks on an existing thumbnail).
      $imageSelectWrapper.find('button.ac-select-image').bind('click', function (e) {
        // Launch the browser, providing the following callback function.
        // @TODO: This should not be an anomyous function.
        var mediaIframe = Drupal.media.popups.mediaBrowser(function (mediaFiles) {
          if (mediaFiles.length < 0) {
            return;
          }
          var fids = '';
          var previews = '';
          if (multiselect) {
            fids = $fileInput.val();
            previews = $preview.html();
          }
          _.each(mediaFiles, function (mediaFile) {
            // Previews = previews + mediaFile.preview;.
            previews = previews + '<li class="added"><div class="inner" style="width: 75px; height: 75px; overflow: hidden;text-align: center;">';
            previews = previews + '<img src="' + mediaFile.url + '?fid=' + mediaFile.fid + '">';
            previews = previews + '</div><a href="#" class="glyphicon glyphicon-remove"></a></li>';
          });
          $preview.html(previews);
          refresh_value($preview, input);
          $preview.find('.glyphicon-remove').click(function () {
            $(this).closest('li').remove();
            refresh_value($preview, input);
          });
          $preview.sortable({
            items: 'li',
            placeholder: 'az-sortable-placeholder',
            forcePlaceholderSize: true,
            over: function (event, ui) {
              ui.placeholder.attr('class', ui.helper.attr('class'));
              ui.placeholder.attr('width', ui.helper.attr('width'));
              ui.placeholder.attr('height', ui.helper.attr('height'));
              ui.placeholder.removeClass('ui-sortable-helper');
              ui.placeholder.addClass('az-sortable-placeholder');
            },
            update: function () {
              refresh_value($preview, input);
            }
          });

          $fileInput.trigger('change');
        }, globalOptions);
        e.preventDefault();
        $(mediaIframe).on("load", function() {
          var zindex = parseInt($('#az-editor-modal').css('z-index'));
          $(mediaIframe).parent().css('z-index', zindex + 1);
          $(mediaIframe).contents().find('[aria-controls="media-tab-youtube"]').remove();
          $(mediaIframe).contents().find('#media-tab-youtube').remove();
          $(mediaIframe).dialog("option", "closeOnEscape", true);
        });
        return false;
      });

      // When someone clicks the Remove button.
      $('.remove', this).bind('click', function (e) {
        // Set the value of the filefield fid (hidden) and trigger change.
        $fileInput.val('');
        $fileInput.trigger('change');
        // Set the preview field HTML.
        $preview.html('');
        e.preventDefault();
      });

      // Show or hide the edit/remove buttons if the field has a file or not.
      $('.fid', this).bind('change', function () {
        if ($fileInput.val() == '') {
          // removeButton.hide();
        }
        else {
          // removeButton.show();
        }
      });

      // Get image style url.
      function make_image_src(src) {
        var q = src.split('?');
        if (q.length > 1) {
          var params = q[1].split('&');
          var fid = '';
          for (i in params) {
            if (params[i].split('=')[0] == 'fid') {
              fid = params[i].split('=')[1];
              break;
            }
          }
          if ($(image_styles_input).val() != '') {
            $.ajax({
              type: 'POST',
              url: Drupal.settings.basePath + '?q=glazed_builder_image_style_url',
              data: {
                style: $(image_styles_input).val(),
                fid: fid
              },
              dataType: 'json',
              async: false,
              context: this,
              complete: function (data) {
                if ('responseJSON' in data) {
                  src = data.responseJSON;
                }
                else {
                  src = $.parseJSON(data.responseText);
                }
              }
            });
          }
        }
        return src;
      }
      // Refresh image src.
      function refresh_value(preview, input) {
        var value = '';
        $(preview).find('li').each(function () {
          if (value.length == 0) {
            value = make_image_src($(this).find('img').attr('src'));
          }
          else {
            if (delimiter == '') {
              value = make_image_src($(this).find('img').attr('src'));
            }
            else {
              value = value + delimiter + make_image_src($(this).find('img').attr('src'));
            }
          }
        });
        $(input).val(value);
      }
    });
  };

  // Load ckeditor for textarea.
  window.glazed_ckeditor = function (textarea) {
    function ckeditor_add_editor() {

      // Don't add spaces to empty blocks
      CKEDITOR.config.fillEmptyBlocks = false;
      // Disabling content filtering.
      CKEDITOR.config.allowedContent = true;
      // Prevent wrapping inline content in paragraphs
      CKEDITOR.config.autoParagraph = false;

      // Theme integration
      CKEDITOR.config.contentsCss = ['//cdn.jsdelivr.net/bootstrap/3.3.7/css/bootstrap.min.css'];
      if ((typeof window.Drupal.settings != "undefined")
            && (typeof window.Drupal.settings.glazed != "undefined")
            && (typeof window.Drupal.settings.glazed.glazedPath != "undefined")) {
        CKEDITOR.config.contentsCss.push(Drupal.settings.basePath + window.Drupal.settings.glazed.glazedPath + 'css/glazed.css');
      }

      // Styles dropdown
      CKEDITOR.config.stylesSet = [
        { name: 'Lead', element: 'p', attributes: { 'class': 'lead' } },
        { name: 'Muted', element: 'p', attributes: { 'class': 'text-muted' } },
        { name: 'Highlighted', element: 'mark' },
        { name: 'Small', element: 'small' },
        { name: 'Button Primary', element: 'div', attributes: { 'class': 'btn btn-primary' } },
        { name: 'Button Default', element: 'div', attributes: { 'class': 'btn btn-default' } },
      ];

      // Load pallets from theme settings.
      if ('sooperthemes_theme_palette' in window) {
        var palette = [];
        for (var name in window.sooperthemes_theme_palette) {
          palette.push(window.sooperthemes_theme_palette[name].substring(1));
        }
        // Only once apply this settings
        var palletsString = palette.join(',') + ',';
        if ((CKEDITOR.config.hasOwnProperty('colorButton_colors')) && (CKEDITOR.config.colorButton_colors.indexOf(palletsString)) < 0) {
          CKEDITOR.config.colorButton_colors = palletsString + CKEDITOR.config.colorButton_colors;
        }
      }

      // Added config toolbar
      CKEDITOR.config.toolbar = [
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Superscript', 'Subscript', 'RemoveFormat']},
        { name: 'paragraph', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', 'BulletedList', 'NumberedList', 'Outdent', 'Indent', 'Blockquote', 'CreateDiv']},
        { name: 'clipboard', items: ['Undo', 'Redo', 'PasteText', 'PasteFromWord']},
        { name: 'links', items: ['Link', 'Unlink']},
        { name: 'insert', items: ['Image', 'HorizontalRule', 'SpecialChar', 'Table', 'Templates']},
        { name: 'colors', items: ['TextColor']},
        { name: 'document', items: ['Source']},
        { name: 'tools', items: ['ShowBlocks', 'Maximize']},
        { name: 'styles', items: ['Format', 'Styles', 'FontSize']},
        { name: 'editing', items: ['Scayt']},
      ];

          CKEDITOR.config.fontSize_sizes = '8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;36/36px;48/48px;60/60px;72/72px;90/90px;117/117px;144/144px';

      // Don't move about our Glazed Builder stylesheet link tags
      CKEDITOR.config.protectedSource.push(/<link.*?>/gi);

      var id = $(textarea).attr('id');
      CKEDITOR.replace(id);
    }
    if ('CKEDITOR' in window) {
      ckeditor_add_editor();
    }
    else {
      window.glazed_add_js({
        path: 'vendor/ckeditor/ckeditor.js',
        callback: function () {
          if (_.isObject(CKEDITOR)) {
            ckeditor_add_editor();
          }
        }
      });
    }
  };

  // Help function for use Drupal t().
  window.glazed_t = function (text) {
    return Drupal.t(text);
  };
  window.glazed_editable = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img:not(.not-editable)', 'a:not(.not-editable)', 'i:not(.not-editable)'];
  window.glazed_styleable = [];
  window.glazed_textareas = [];
  window.glazed_formats = [];
  Drupal.behaviors.glazed_builder = {
    attach: function (context, settings) {
      if (fp + 'modal' in $.fn && fp + 'popover' in $.fn) {
        for (var i = 0; i < window.glazed_textareas.length; i++) {
          (function (textarea, format) {
            $('#' + format).change(function () {
              var $textarea  = $('#' + textarea);
              if ($(this).val() == 'glazed_builder') {
                window.glazed_editor = true;
                $textarea.glazed_builder();
                if (Drupal.hasOwnProperty('wysiwygAttach'))
                  Drupal.wysiwygAttach(context, textarea);
                $textarea.hide();
              }
              else {
                $textarea.glazed_builder('hide');
                $textarea.show();
              }
            });
            _.defer(function () {
              if (_.isUndefined($('#' + textarea).data('glazed_builder'))) {
                $('#' + format).trigger('change');
              }
            });
          })(window.glazed_textareas[i], window.glazed_formats[i]);
        }
      }
    }
  };
})(jQuery);
