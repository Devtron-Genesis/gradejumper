(function($) {
	Drupal.behaviors.gj_search_frm_v2 = {
		attach: function() {
      //console.log(Drupal.settings.gj_search_frm_v2.subjectlevels);
			//Get the entire list of levels and subjects that are available
      var subject_level_array = Drupal.settings.gj_search_frm_v2.subjectlevels;
			console.log(subject_level_array);

			//When the "Subject" dropdown is changed....
      $('select[name="subject"]').change(function() {
          var subject = $(this).val();

          if(subject == "Select" ||  subject == "") { // If we uset the subject
						$("#edit-level").prop('disabled', true);
					}
					else { //If the users has picked anything other than the default 'empty' option
						//Clear all the current items in the level list
            $("#edit-level").children().remove();
						//Get the levels for the selected subject
            var levels = get_levels_for_subject(subject, subject_level_array);
						//Add "Select" to the front of the list
						levels.unshift("Select");
						console.log(levels);
						//add the levesls to the levels select box
						$.each(levels, function(key, value) {
							$('#edit-level')
                .append($("<option></option>")
                .attr("value",value)
                .text(value));
            });
						//Enable the level field
						$("#edit-level").prop('disabled', false);
          }
      });

		}
  };

  function get_levels_for_subject(subject, subject_level_array) {
    for (var i in subject_level_array) {
      if(i == subject) {
        var levels = subject_level_array[i];
        console.log(levels);
      }
    }
    return levels;
  }

})(jQuery);
