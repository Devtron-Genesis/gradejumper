jQuery(document).ready(function($){
    //check availabilty based on last selection
    var availability_field = $('.field-name-field-my-availability-for-tutori').find('input');
    if (availability_field){
        availability_field.addClass('availability-for-tutoring');
        var availability = $('.availability-for-tutoring').val();

        var initValues = availability.split(',');

        $('.input-check input[type=checkbox]').each(function () {
            var is_checked = ($.inArray($(this)[0].id.replace('create_batch_', ''), initValues) != -1);
            $(this).attr("checked", is_checked);
            $(this).prop("checked", is_checked);
            setCheckboxTick(this);
        });

        $('.input-check input[type=checkbox]').click(function(){
            var selection = '';
            var arr = [];
            $('.input-check input[type=checkbox]:checked').each(function(){
                arr.push($(this)[0].id.replace('create_batch_', ''));
            });
            selection = arr.join(',');
            $('.availability-for-tutoring').val(selection);

            setCheckboxTick(this);

        });
    }

    
});

function setCheckboxTick(element){
    //set label value based on selection
    if (Drupal.settings.gj_deanhopkins_tutor_ad){
        var tickUri =  Drupal.settings.gj_deanhopkins_tutor_ad.tickImgPath;
        var label = element.parentElement.children[1];
        if (element.checked){
            label.innerHTML = "<span class='tutor-ad-availability-tick'><img src='" + tickUri + "' /></span>";
        } else {
            label.innerHTML = "";
        }
    }
}