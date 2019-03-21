<?php global $user;?>

<div class="gj-pr-header">Proactive response</div>

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
                <div class="gj-pr-tutor-request-value"><?php print _get_search_request_display_name($search_request); ?> </div>
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

        <div class="gj-pr-tutor-request-info-container gj-pr-tutor-request-info-container__search-response">
            <div class="gj-pr-tutor-request-info-img">
                <img src="<?php print file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/info.svg"); ?>">
            </div>
            <div class="gj-pr-tutor-request-info-text">
                If <?php print ucwords(get_user_firstname($search_request->uid)) . " " . substr(ucwords(get_user_lastname($search_request->uid)), 0, 1); ?> has already contacted you via the private messaging system then there is no need to complete the form below.
            </div>
        </div>
    </div>
</div>

<?php if (!isset($form)): ?>
<div class="gj-pr-closed">
    We're sorry, this tutor request is now closed.
</div>
<?php endif; ?>

<?php if (isset($form)): ?>
<div class="gj-pr-my-response-container">

    <form action="<?php print $form['#action']?>" method="<?php print $form['#method']?>" id="<?php print $form['#form_id']?>">

        <div class="gj-pr-tutor-ad-header">
            <div class="gj-pr-tutor-ad-header-image">
                <img class="gj-pr-tutor-ad-header-pic" src="
                     <?php
                         $image_uri = get_tutor_ad_picture_uri(get_tutor_ad_by_user($user));
                         $derivative_uri = image_style_url ('profile_image_200x200-copy', $image_uri);
                         $success        = file_exists($derivative_uri) || image_style_create_derivative(image_style_load('profile_image_200x200'), $image_uri, $derivative_uri);
                         $new_image_url  = file_create_url($derivative_uri);

                         print $new_image_url;
                     ?>
                ">
            </div>
            <div class="gj-pr-tutor-ad-wrap">
                <div class="gj-pr-tutor-ad-header-name">
                    <?php print ucwords(get_user_firstname($user->uid)) . " " . substr(ucwords(get_user_lastname($user->uid)), 0, 1) . "."; ?>
                </div>
                <div class="gj-pr-tutor-ad-header-rating">
                    <?php print get_tutor_ad_star_rating_display(get_tutor_ad_by_user($user)); ?>
                </div>
            </div>
            <div class="gj-pr-tutor-ad-header-price-container">
                <div class="gj-pr-tutor-ad-header-price-value">
                    £<?php print get_tutor_ad_teaser_price_display(get_tutor_ad_by_user($user)); ?>
                </div>
                <div class="gj-pr-tutor-ad-header-price-suffix">
                    /hr
                </div>
            </div>
        </div>
        <div class="gj-pr-input-container">
            <div class="gj-pr-input-label">
                Why you?
            </div>
            <div class="gj-pr-input-control">
                <?php print drupal_render($form['about_me']); ?>
            </div>
        </div>
        <div class="gj-pr-input-contatutoring_requestsiner">
            <div class="gj-pr-input-label">
                Your current availability
            </div>
            <div class="gj-pr-input-control">
                <?php print drupal_render($form['availability_text']); ?>
            </div>
        </div>
        <div class="gj-pr-submit-container">
            <?php print drupal_render($form['submit']); ?>
        </div>

        <div class="gj-pr-hidden" style="display:none">
            <?php print drupal_render_children($form); ?>
        </div>

    </form>
</div>
<?php endif; ?>



