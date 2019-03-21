<div class="gj-pr-header">Proactive Responses</div>

<?php foreach($open_requests as $search_request): ?>
    <div class="gj-pr-tutor-request-container">
        <div class="gj-pr-tutor-request-header">
            <div class="gj-pr-tutor-request-title">
                Tutor Request #<?php print $search_request->nid; ?>
            </div>
            <div class="gj-pr-tutor-request-counter-container">
                <div class="gj-pr-tutor-request-counter">
                    <?php print _search_request_num_responses_display($search_request->nid); ?>/3 responses sent
                </div>
            </div>
        </div>


        <div class="gj-pr-tutor-request-body">
            <div class="gj-pr-tutor-request-details-container">
                <div class="gj-pr-tutor-request-detail">
                    <div class="gj-pr-tutor-request-label">Name:</div>
                    <div class="gj-pr-tutor-request-value"><?php print _get_search_request_display_name($search_request); ?>  </div>
                </div>
                <div class="gj-pr-tutor-request-detail">
                    <div class="gj-pr-tutor-request-label">Subject:</div>
                    <div class="gj-pr-tutor-request-value"><?php print _get_subject_level_term_display_name(taxonomy_term_load($search_request->field_search_request_tid['und'][0]['value'])); ?> </div>
                </div>
                <div class="gj-pr-tutor-request-detail">
                    <div class="gj-pr-tutor-request-label">Posted:</div>
                    <div class="gj-pr-tutor-request-value"><?php print date("d/m/Y H:i", $search_request->created); ?></div>
                </div>
            </div>

            <div class="gj-pr-tutor-request-info-container">
                <div class="gj-pr-tutor-request-apply-now">
                    <a href="<?php print url('respond_search_request/' . base64_encode($search_request->nid)); ?>" class="btn btn-primary btn-md gj-pr-tutor-request-apply-now-button">Apply now</a>
                </div>
            </div>
        </div>
    </div>
<?php endforeach; ?>



<?php foreach($applied_requests as $search_request): ?>
    <div class="gj-pr-tutor-request-applied-container" onclick="toggleAppliedVisibility(this);">
        <div class="gj-pr-tutor-request-applied-header">
            <div class="gj-pr-tutor-request-applied-title">
                Tutor Request #<?php print $search_request->nid; ?>
            </div>
            <div class="gj-pr-tutor-request-applied-info-container">
                <img src="<?php print file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/tick_green.svg"); ?>">
                Applied
            </div>
        </div>


        <div class="gj-pr-tutor-request-applied-body">
            <div class="gj-pr-tutor-request-applied-details-container">
                <div class="gj-pr-tutor-request-applied-detail">
                    <div class="gj-pr-tutor-request-label">Name:</div>
                    <div class="gj-pr-tutor-request-value"><?php print _get_search_request_display_name($search_request); ?> </div>
                </div>
                <div class="gj-pr-tutor-request-applied-detail">
                    <div class="gj-pr-tutor-request-label">Subject:</div>
                    <div class="gj-pr-tutor-request-value"><?php print _get_subject_level_term_display_name(taxonomy_term_load($search_request->field_search_request_tid['und'][0]['value'])); ?> </div>
                </div>
                <div class="gj-pr-tutor-request-applied-detail">
                    <div class="gj-pr-tutor-request-label">Posted:</div>
                    <div class="gj-pr-tutor-request-value"><?php print date("d/m/Y H:i", $search_request->created); ?></div>
                </div>
            </div>
            <div class="gj-pr-tutor-request-tutor-details-container">
                <div class="gj-pr-tutor-request-tutor-label">Why <?php print ucwords(get_user_firstname($user->uid)); ?>?</div>
                <div class="gj-pr-tutor-request-tutor-text"><?php print _get_search_request_response_by_user($search_request->nid, $user->uid)->tutor_rqst_about_me['und'][0]['value']; ?></div>
                <div class="gj-pr-tutor-request-tutor-label"><?php print ucwords(get_user_firstname($user->uid)); ?>'s Availability</div>
                <div class="gj-pr-tutor-request-tutor-text"><?php print _get_search_request_response_by_user($search_request->nid, $user->uid)->tutor_rqst_avail_txt['und'][0]['value']; ?></div>
            </div>
            <div class="gj-pr-tutor-request-tutor-details-expand-icon">
                <div class="gj-pr-tutor-request-tutor-details-hidden">
                    <img src="<?php print file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/down_arrow.svg"); ?>">
                </div>
                <div class="gj-pr-tutor-request-tutor-details-expanded">
                    <img src="<?php print file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/up_arrow.svg"); ?>">
                </div>
            </div>
        </div>
    </div>
<?php endforeach; ?>

