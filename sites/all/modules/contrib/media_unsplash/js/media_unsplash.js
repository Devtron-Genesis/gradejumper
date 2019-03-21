(function ($) {
  'use strict';

  Drupal.behaviors.media_unsplash = {
    attach: function (context, settings) {

      // Hide next button.
      $('form#media-unsplash-external .form-actions .form-submit').hide();

      $('img.unsplash').once().bind('click', function (e) {
        var unsplash_url = $(this).attr('data-image');

        $('input[name="unsplash_code"]').val(unsplash_url);

        // Autosubmit form.
        $('#media-unsplash-external').submit();
      });

      // Pager for media browser
      $('div#unsplash-pager ul li a').once().bind('click', function (e) {

        // Get sanitized search term.
        var search_term = Drupal.settings.media_unsplash.term;

        // Get page number from pager link.
        var unsplash_page = media_unsplash_parse_url($(this).attr('href'));

        // Default query.
        var query_url = '?page=' + unsplash_page + '&term=' + search_term;

        // First page exception.
        if (isNaN(unsplash_page)) {
          query_url = '?term=' + search_term;
        }

        $('#unsplash-output').once('unsplash-output', function (e) {

          var base = $(this).attr('id');

          var element_settings = {
            url: Drupal.settings.basePath + 'unsplash/ajax/' + query_url,
            settings: '',
            event: 'click',
            progress: {
              type: 'throbber'
            }
          };
          Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
        });

      });

    }
  };
}(jQuery));

/**
 * Parse url to get page number.
 *
 * @param string query
 *   Url for parsing.
 * @return integer
 *   Return page number
 */
function media_unsplash_parse_url(query) {
  'use strict';
  var args = {};
  var pos = query.indexOf('?');
  if (pos !== -1) {
    query = query.substring(pos + 1);
  }
  var pairs = query.split('&');
  for (var i in pairs) {
    if (typeof (pairs[i]) == 'string') {
      var pair = pairs[i].split('=');
      // Ignore the 'q' path argument, if present.
      if (pair[0] !== 'q' && pair[1]) {
        args[decodeURIComponent(pair[0].replace(/\+/g, ' '))] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
      }
    }
  }

  return parseInt(args['page']);
}
