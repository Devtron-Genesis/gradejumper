/*
 * Behavior for the automatic file upload
 */

(function ($) {
  Drupal.behaviors.tutorAdAutoUpload = {
    attach: function(context, settings) {
      $('#tutor-ad-edit-container .form-item input.form-submit[value=Upload]', context).hide();
      $('#tutor-ad-edit-container .form-item input.form-file', context).change(function() {
        $parent = $(this).closest('.form-item');

        //setTimeout to allow for validation
        //would prefer an event, but there isn't one
        setTimeout(function() {
          if(!$('.error', $parent).length) {
            $('button.form-submit[value=Upload]', $parent).mousedown();
            $('#tutor-ad-uploading').css("display","block");

            setTimeout(function(){
                $('#tutor-ad-uploading').css("display","none");
            }, 2500);

          }
        }, 100);
      });
    }
  };
})(jQuery);
