<?php
    $is_edit_mode = ($form['nid']['#value']);

    drupal_add_js(drupal_get_path("module", "gj_deanhopkins_tutor_ad"). "/js/availability_for_tutoring.js");
    drupal_add_js(drupal_get_path("module", "gj_deanhopkins_tutor_ad"). "/js/gj_deanhopkins_tutor_ad.js");
    drupal_add_css(drupal_get_path("module", "gj_deanhopkins_tutor_ad"). "/css/availability_for_tutoring.css");
    drupal_add_css(drupal_get_path("module", "gj_deanhopkins_tutor_ad"). "/css/gj_deanhopkins_tutor_ad.css");

    $settings = array('tickImgPath' => file_create_url(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . "/img/tick.svg"),);
    drupal_add_js(array('gj_deanhopkins_tutor_ad' => $settings), 'setting');


    hide($form['field_tutor_ad_title']);
    hide($form['field_tutor_first_name']);
    hide($form['field_tutor_second_name']);
?>

<div class="tutor-ad-edit-container">
    <div class="container-fluid" id="tutor-ad-edit-container">
        <div class="row">
            <?php
                $header_text = "";
                $header_subtext = "";
                if($is_edit_mode){
                    $header_text = "Edit my profile";
                    $header_subtext = variable_get('var_txt_edit_your_app_form', t(get_lorem_ipsum()));
                } else {
                    $header_text = "Complete your application form";
                    $header_subtext = variable_get('var_txt_complete_your_app_form', t(get_lorem_ipsum()));
                }
            ?>
            <div class="tutor-ad-edit-header"><?php print $header_text; ?></div>
            <p class="tutor-ad-header-subtext <?php print ($is_edit_mode ? 'tutor-ad-edit-header-subtext' : ''); ?>"><?php print $header_subtext; ?></p>
        </div>
        <div class="row">
            <div class="col-md-12">
                <p class="tutor-ad-section-title">About me</p>
                <p><?php print drupal_render_children($form['field_tutor_full_description']); ?></p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <p class="tutor-ad-section-title">About my sessions</p>
                <p><?php print drupal_render_children($form['field_tutor_about_sessions']); ?></p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <p class="tutor-ad-section-title">Gender</p>
                <p class="tutor-ad-edit-label">Please select your gender.</p>
                <?php print render($form['field_tutor_gender']); ?>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <?php print drupal_render(_block_get_renderable_array(_block_render_blocks(array(block_load('gj_deanhopkins_tutor_ad', 'txt_profile_img'))))); ?>
                <br />
                <input type="button" class="tutor-ad-upload-image-button" onclick="tutorAdClickUploadImage()" value="Select profile image"</input>
                <div class="tutor-ad-hidden-file-input"><?php print drupal_render_children($form['field_tutor_upload_profile_image']); ?></div>
                <span id="tutor-ad-uploading" class="tutor-ad-uploading">Uploading...</span>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <?php print drupal_render(_block_get_renderable_array(_block_render_blocks(array(block_load('gj_deanhopkins_tutor_ad', 'txt_profile_video'))))); ?>
                <br />
                <p class="tutor-ad-edit-label">Youtube link (optional)</p>
                <p><?php print drupal_render_children($form['field_enter_a_youtube_profile_vi']); ?></p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <?php print drupal_render(_block_get_renderable_array(_block_render_blocks(array(block_load('gj_deanhopkins_tutor_ad', 'txt_qualifications'))))); ?>
                <br />
                <?php print get_tutor_ad_qualifications_edit($form); ?>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <?php print drupal_render(_block_get_renderable_array(_block_render_blocks(array(block_load('gj_deanhopkins_tutor_ad', 'txt_dbscert'))))); ?>
                <br />
                <p class="tutor-ad-edit-label">Do you have a valid DBS Certificate?</p>
                <?php print render($form['field_tutor_dbs_certificate']); ?>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <p class="tutor-ad-section-title">General availability</p>
                <?php
                $html = "<div class='tsqc_field'>". create_availability_table($form['field_my_availability_for_tutori']['und'][0]['value']['#value'], true) . "</div>";
                print $html;
                ?>
                <?php print render($form['field_my_availability_for_tutori']); ?>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <p class="tutor-ad-section-title">Availability</p>
                <p class="tutor-ad-edit-label">Please set your availability for tutoring. If you are not available for tutoring straight away, please set to unavailable.</p>
                <?php print render($form['field_tutor_available']); ?>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <?php print drupal_render(_block_get_renderable_array(_block_render_blocks(array(block_load('gj_deanhopkins_tutor_ad', 'txt_subject_level_pricing'))))); ?>
                <br />
                <?php print get_tutor_ad_subjects_offered_edit($form); ?>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <?php print drupal_render(_block_get_renderable_array(_block_render_blocks(array(block_load('gj_deanhopkins_tutor_ad', 'txt_references'))))); ?>
                <?php print get_tutor_ad_references_edit($form); ?>
            </div>
        </div>
        <div class="row">
                <br />
                <?php print get_tutor_ad_submit_tos_div($form, $is_edit_mode); ?>
        </div>

        <div class="row" style="display:none">
            <div class="small-12 medium-12 large-8 large-offset-2 columns">
                <?php print render($form['form_build_id']); ?>
                <?php print render($form['form_token']); ?>
                <?php print render($form['form_id']); ?>
                <div style="display:none">
                    <?php print drupal_render_children($form); ?>
                </div>
            </div>
        </div>
    </div>
</div>
