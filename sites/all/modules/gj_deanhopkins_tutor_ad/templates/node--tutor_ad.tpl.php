<?php

drupal_add_js(drupal_get_path("module", "gj_deanhopkins_tutor_ad"). "/js/availability_for_tutoring.js");
drupal_add_js(drupal_get_path("module", "gj_deanhopkins_tutor_ad"). "/js/gj_deanhopkins_tutor_ad.js");
drupal_add_css(drupal_get_path("module", "gj_deanhopkins_tutor_ad"). "/css/availability_for_tutoring.css");
drupal_add_css(drupal_get_path("module", "gj_deanhopkins_tutor_ad"). "/css/gj_deanhopkins_tutor_ad.css");
drupal_add_css(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . '/widgets/fontawesome/fontawesome-star.css');

$settings = array('tickImgPath' => file_create_url(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . "/img/tick.svg"),);
drupal_add_js(array('gj_deanhopkins_tutor_ad' => $settings), 'setting');

?>

<div id="tutor-ad-container">
    <div class="  tutor-ad-header">
        <div class=" ">
            <div class=" " style="display:flex">
                <div class="col-md-2 tutor-ad-header-left">
                    <div class="user-picture">
                        <img src="<?php print file_create_url(get_tutor_ad_picture_uri($node)); ?>" />
                    </div>
                </div>
                <div class="col-md-7 tutor-ad-header-middle">
                    <p class="tutor-ad-header-name"><?php print get_tutor_ad_first_name($node) . " " . get_tutor_ad_last_initial($node) . "."; ?></p>
                    <p class="tutor-ad-header-university"><?php print get_tutor_ad_first_degree($node); ?></p>
                    <?php print get_tutor_ad_star_rating_display($node); ?>
                    <?php print generate_tutor_ad_node_send_message_button($node);?>
                </div>
                <div class="col-md-3 tutor-ad-header-right">
                    <span class="tutor-ad-header-price">
                    <span class="tutor-ad-header-price-label tutor-label-from">From </span>
                    <span class="tutor-ad-header-price-value">£<?php print get_tutor_ad_lowest_price($node); ?></span>
                    <span class="tutor-ad-header-price-label">/hr</span>
                    </span>
                </div>
            </div>
        </div>
        <hr style="margin-bottom:0px;"/>
    </div>

    <div class="tutor-ad-header-mobile">
        <div class=" ">
            <div class=" " style="display:flex">
                <div class="col-md-2 tutor-ad-header-left">
                    <div class="user-picture-mobile">
                        <img src="<?php print file_create_url(get_tutor_ad_picture_uri($node)); ?>" />
                    </div>
                </div>
                <div class="col-md-10 tutor-ad-header-middle tutor-ad-header-middle-mobile">
                    <p class="tutor-ad-header-name-mobile"><?php print get_tutor_ad_first_name($node) . " " . get_tutor_ad_last_initial($node) . "."; ?></p>
                    <span class="tutor-ad-header-price-mobile">
                        <span class="tutor-ad-header-price-value-mobile">£<?php print get_tutor_ad_lowest_price($node); ?> /hr</span>
                    </span>
                    <p class="tutor-ad-header-university-mobile"><?php print get_tutor_ad_first_degree($node); ?></p>
                    <div class="tutor-ad-header-rating-mobile"><?php print get_tutor_ad_star_rating_display($node); ?></div>
                </div>
            </div>
            <div class="full-width-margin-auto">
                <div class="full-width-margin-auto"><?php print generate_tutor_ad_node_send_message_button($node, TRUE);?></div>
            </div>
        </div>
        <hr class="full-width-hr"/>
    </div>

    <div class=" ">
        <div class=" ">
            <?php print get_tutor_ad_profile_video($content); ?>
            <p class="tutor-ad-section-title">About me</p>
            <p><?php print get_tutor_ad_full_description($node); ?></p>
        </div>
    </div>
    <div class=" ">
        <div class=" ">
            <p class="tutor-ad-section-title">About my sessions</p>
            <p><?php print get_tutor_ad_about_sessions($node); ?></p>
        </div>
    </div>

    <br /><br />

    <div class="promo-container">
        <?php
            $title = "Personally interviewed";
            $text = variable_get('var_txt_personally_interviewed_block', t(get_lorem_ipsum()));
            print get_tutor_ad_personally_interviewed_div($title, $text);
        ?>

        <?php print get_tutor_ad_dbs_check_div($node); ?>
    </div>
    <div id="mobile-spacer"></div>


    <div class=" ">
        <div class=" ">
            <p class="tutor-ad-section-title">Ratings & reviews (<?php print get_tutor_ad_reference_count($node); ?>)</p>
            <p><?php print get_tutor_ad_references_display($node); ?></p>
        </div>
    </div>
    <div class=" ">
        <div class=" ">
            <p class="tutor-ad-section-title">Qualifications</p>
            <p><?php print get_tutor_ad_qualifications($node); ?></p>
        </div>
    </div>
    <div class=" ">
        <div class=" ">
            <p class="tutor-ad-section-title">General Availability</p>
            <?php
            $html = "<div class='tsqc_field'>". create_availability_table(get_tutor_ad_availability_text($node), false) . "</div>";
            print $html;
            ?>
            <?php print get_tutor_ad_availability_hidden_field($node); ?>
        </div>
    </div>
    <div class=" ">
        <div class=" ">
            <p class="tutor-ad-section-title">Subjects offered</p>
            <p><?php print get_tutor_ad_subjects_offered($node); ?></p>
        </div>
    </div>
</div>

