<?php
drupal_add_css(drupal_get_path("module", "gj_deanhopkins_tutor_ad"). "/css/gj_deanhopkins_tutor_ad.css");
drupal_add_css(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . '/widgets/fontawesome/fontawesome-star.css');
?>
<div id="tutor-ad-teaser-container">
    <div class="row" style="display: flex; margin-top:20px; min-height:165px;">
        <div class="col-md-2 teaser-user-picture-wrapper">
            <div class="user-picture teaser-user-picture">
                <img src="<?php print file_create_url(get_tutor_ad_picture_uri($node)); ?>" />
            </div>
        </div>
        <div class="col-md-7">
            <div class="row">
                <div class="col-md-12">
                    <span class="tutor-ad-teaser-name"><?php print ucwords(get_tutor_ad_first_name($node) . " " . ucwords(get_tutor_ad_last_initial($node))) . "."; ?></span>
                    <span class="tutor-ad-teaser-degree"><?php print get_tutor_ad_first_degree($node); ?></span>
                    <span class="tutor-ad-teaser-subjects"><?php print get_tutor_ad_teaser_subjects_offered($node); ?></span>
                    <span class="tutor-ad-teaser-description"><?php print get_tutor_ad_teaser_description($node); ?></span>
                </div>
            </div>
        </div>
        <div class="col-md-3" style="position: relative">
            <div class="row">
                <div class="col-md-12">
                    <span class="tutor-ad-teaser-price">£<?php print get_tutor_ad_teaser_price_display($node);?>/hr</span>
                    <span class="tutor-ad-teaser-star-rating"><?php print get_tutor_ad_star_rating_display($node); ?></span>
                    <span>
                        <img src="<?php print file_create_url(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . "/img/online.svg"); ?>">
                        <span>Teaches online</span>
                    </span>
                </div>
            </div>
            <div class="row" style="position: absolute; bottom: 5px;">
                <div class="col-md-12">
                    <a <?php print ($node->op == "Preview" ? "" : "href='" . url('node/'. $node->nid) . "'"); ?>">
                        <button type="button" class="btn tutor-ad-teaser-view-profile" id="tutor-ad-teaser-view-profile">View profile</button>
                    </a>
                </div>
            </div>
        </div>
    </div>
    <br />
    <hr style="margin-bottom:0px"/>
</div>

<a href="<?php print url('node/'. $node->nid);?>">
    <div id="tutor-ad-teaser-container-mobile">
        <div class="row" style="display: flex;">

            <div class="col-2 teaser-user-picture-wrapper-mobile" style="display:inline-block;">
                <div class="user-picture teaser-user-picture teaser-user-picture-mobile">
                    <img src="<?php print file_create_url(get_tutor_ad_picture_uri($node)); ?>" />
                </div>
            </div>
            <div class="col-10 teaser-wrapper-mobile" style="display:inline-block;">
                <div class="row">
                    <div style="display:inline-block; float: left;">
                        <span class="tutor-ad-teaser-name-mobile"><?php print ucwords(get_tutor_ad_first_name($node) . " " . ucwords(get_tutor_ad_last_initial($node))) . "."; ?></span>
                    </div>
                    <div style="display:inline-block; float: right;">
                        <span class="tutor-ad-teaser-price-mobile">£<?php print get_tutor_ad_teaser_price_display($node);?>/hr</span>
                    </div>
                </div>
                <div class="row">
                    <span class="tutor-ad-teaser-title-mobile"><?php print get_tutor_ad_first_degree($node); ?></span>
                </div>
                <div class="row">
                    <span class="tutor-ad-teaser-subjects-mobile"><?php print get_tutor_ad_teaser_subjects_offered($node); ?></span>
                </div>
                <div class="row">
                    <span class="tutor-ad-teaser-star-rating-mobile"><?php print get_tutor_ad_star_rating_display($node); ?></span>
                </div>
                <div class="row">
                    <span>
                        <img src="<?php print file_create_url(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . "/img/online.svg"); ?>">
                        <span class="tutor-ad-teaser-online-mobile">Teaches online</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
</a>