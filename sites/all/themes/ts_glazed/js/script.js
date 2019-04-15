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
      $('.node-type-tutor-ad .tutor_ad_availability_table_header_row .tutor-ad-availability-table-header').wrap('<div class="ga_time_table"></div>');
      $('.node-type-tutor-ad .timetable_wrapper th span img').matchHeight();
      $('.node-type-tutor-ad .timetable_wrapper th .ga_time_table').matchHeight();

      // to changge days name for mobile screens
      $('.timetable_wrapper tr:nth-child(1)').addClass('row_day_monday');
      $('.timetable_wrapper tr:nth-child(2)').addClass('row_day_tuesday');
      $('.timetable_wrapper tr:nth-child(3)').addClass('row_day_wednesday');
      $('.timetable_wrapper tr:nth-child(4)').addClass('row_day_thusday');
      $('.timetable_wrapper tr:nth-child(5)').addClass('row_day_friday');
      $('.timetable_wrapper tr:nth-child(6)').addClass('row_day_saturday');
      $('.timetable_wrapper tr:nth-child(7)').addClass('row_day_sunday');
      if (window.matchMedia('(max-width: 768px)').matches) {
        $('.row_day_monday td:nth-child(1)').addClass('col_day_mon').text('Mon');
        $('.row_day_tuesday td:nth-child(1)').addClass('col_day_tue').text('Tue');
        $('.row_day_wednesday td:nth-child(1)').addClass('col_day_wed').text('Wed');
        $('.row_day_thusday td:nth-child(1)').addClass('col_day_thu').text('Thu');
        $('.row_day_friday td:nth-child(1)').addClass('col_day_fri').text('Fri');
        $('.row_day_saturday td:nth-child(1)').addClass('col_day_sat').text('Sat');
        $('.row_day_sunday td:nth-child(1)').addClass('col_day_sun').text('Sun');
      }
      if (($(window).width() < 740) && ($(window).width() > 0)) {
        var promo_height = $('.promo-container').innerHeight();
        $('#mobile-spacer').css('min-height', promo_height+90+'px');
      }
  });
  $(window).resize(function(){
      if ($(window).width() < 740) {
        var promo_height = $('.promo-container').innerHeight();
        $('#mobile-spacer').css('min-height', promo_height+90+'px');
      }
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