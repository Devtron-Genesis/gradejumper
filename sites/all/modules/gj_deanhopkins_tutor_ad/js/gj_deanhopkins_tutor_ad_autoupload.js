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

            var waitForUpload = setInterval(function(){
              if (document.getElementById("edit-field-tutor-upload-profile-image-und-0-ajax-wrapper").children[0].children[1].children[2].children.length > 1){
                try {
                  setImagePreview();
                  $('#tutor-ad-uploading').css("display","none");
                  clearInterval(waitForUpload);
                } catch (err){
                  print("not ready");
                }
              }

            }, 100);

          }
        }, 500);
      });
    }
  };
})(jQuery);

function setImagePreview(){
  var url = document.getElementById("edit-field-tutor-upload-profile-image-und-0-ajax-wrapper").children[0].children[1].children[2].children[1].getAttribute("href");
  document.getElementById("edit-field-tutor-upload-profile-image-und-0-ajax-wrapper").children[0].children[1].children[2].children[0].style.display = "none";
  document.getElementById("edit-field-tutor-upload-profile-image-und-0-ajax-wrapper").children[0].children[1].children[2].children[1].innerHTML = '<div class="user-picture"><img style="height: 100%; object-fit: cover;" src="' + url + '"></img></div>';
}