<div class="gj-pr-header">Proactive Responses</div>

<div class="gj-pr-request-time">
    Request for <?php print _get_subject_level_term_display_name(taxonomy_term_load($search_request->field_search_request_tid['und'][0]['value'])); ?> tutoring on Mon 13 Feb 2019, 8:35pm
</div>

<div class="gj-pr-request-header-container">
    <div class="gj-pr-request-header-top">
        <div class="gj-pr-request-header-top-left">
            Hi <?php print ucwords($search_request->field_search_request_first_name['und'][0]['value']); ?>
        </div>
        <div class="gj-pr-request-header-top-right">
            <?php
            $count = _search_request_num_responses($search_request->nid);
            $output = $count . " proactive response";
            if ($count > 1 || $count == 0){ $output .= "s"; }
            print $output;
            ?>
        </div>
    </div>
    <div class="gj-pr-request-header-body">
        <p class="gj-pr-request-header-body-message">
            Following your initial interest in GradeJumpers, we’ve hand picked a selection of top <?php print _get_subject_level_term_display_name(taxonomy_term_load($search_request->field_search_request_tid['und'][0]['value'])); ?> tutors that have proactively expressed a desire to work with you and would like you to message them. They are available and ready to start tutoring.</p>
        <p class="gj-pr-request-header-body-message">
            Please message them to organise a free video meeting or to get started with your tutoring.
        </p>

        <p class="gj-pr-request-header-body-message">Best wishes,</p>
        <p class="gj-pr-request-header-body-message-name">
            <img class="gj-pr-request-header-body-message-pic" src="<?php print file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . '/img/manager.png') ?>"> Lisa
        </p>


        <span class="gj-pr-request-header-body-title">GradeJumpers Customer Services</span>
    </div>
</div>

<?php foreach($responses as $response): ?>
<div class="gj-pr-request-response-container">
    <div class="gj-pr-request-response-header">
        <div class="gj-pr-request-response-header-avatar">
            <img src="
            <?php
                $image_uri = get_tutor_ad_picture_uri(get_tutor_ad_by_user(user_load($response->uid)));
                $derivative_uri = image_style_url ('profile_image_200x200-copy', $image_uri);
                $success        = file_exists($derivative_uri) || image_style_create_derivative(image_style_load('profile_image_200x200'), $image_uri, $derivative_uri);
                $new_image_url  = file_create_url($derivative_uri);

                print $new_image_url;
            ?>">
        </div>
        <div class="gj-pr-request-response-header-details">
            <div class="gj-pr-request-response-header-details-top-row">
                <div class="gj-pr-request-response-header-details-top-row-left">
                    <?php print ucwords(get_user_firstname($response->uid)) . " " . substr(ucwords(get_user_lastname($response->uid)), 0, 1); ?>
                </div>
                <div class="gj-pr-request-response-header-details-top-row-right">
                    <div class="gj-pr-price-value">
                        £<?php print get_tutor_ad_teaser_price_display(get_tutor_ad_by_user(user_load($response->uid))); ?>
                    </div>
                    <div class="gj-pr-price-label">
                        /hr
                    </div>
                </div>
            </div>
            <div class="gj-pr-request-response-header-details-middle-row">
                <?php print get_tutor_ad_first_degree(get_tutor_ad_by_user(user_load($response->uid))); ?>
            </div>
            <div class="gj-pr-request-response-header-details-bottom-row">
                <?php print get_tutor_ad_star_rating_display(get_tutor_ad_by_user(user_load($response->uid))); ?>
            </div>
        </div>
    </div>
    <div class="gj-pr-tutor-request-tutor-details">
        <div class="gj-pr-tutor-request-tutor-label">Why <?php print ucwords(get_user_firstname($response->uid)); ?>?</div>
        <div class="gj-pr-tutor-request-tutor-text"><?php print $response->tutor_rqst_about_me['und'][0]['value']; ?></div>
        <div class="gj-pr-tutor-request-tutor-label"><?php print ucwords(get_user_firstname($response->uid)); ?>'s Availability</div>
        <div class="gj-pr-tutor-request-tutor-text"><?php print $response->tutor_rqst_avail_txt['und'][0]['value']; ?></div>
    </div>
    <div class="gj-pr-request-response-buttons">
        <a href="<?php print _get_tutor_ad_msg_link_from_response($response); ?>" class="btn btn-primary btn-md gj-pr-request-response-buttons-send">Send a message</a>
        <a href="<?php print _get_tutor_ad_email_link_from_response($response); ?>" class="btn btn-secondary btn-md gj-pr-request-response-buttons-view">View full profile</a>
    </div>
</div>
<?php endforeach; ?>

<div class="gj-pr-trust-container">
    <div class="gj-pr-trust-pilot">
        <img src="<?php print file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/trustpilot.svg"); ?>">
    </div>
    <div class="gj-pr-trust-seperator">
        <img src="<?php print file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/seperator.svg"); ?>">
    </div>
    <div class="gj-pr-trust-excelent">
        "Excellent"
    </div>
</div>
