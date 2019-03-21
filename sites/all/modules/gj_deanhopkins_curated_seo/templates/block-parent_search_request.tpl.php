<?php if (user_is_anonymous()): ?>

<div class="parent-search-request-container anonymous-container">
    <div class="parent-search-request-online">
        <img src="<?php print file_create_url(drupal_get_path('module', 'gj_deanhopkins_curated_seo') . '/img/online_dot.svg') ?>">
        <span>Online</span>
    </div>
    <div class="parent-search-request-sub-container">
        <div class="parent-search-request-header">
            <div class="parent-search-request-header-image">
                <img src="<?php print file_create_url(drupal_get_path('module', 'gj_deanhopkins_curated_seo') . '/img/customer_services.jpg') ?>">
            </div>
            <div class="parent-search-request-header-text">
                "Fill in your details and we'll have some great tutor choices ready for you in a moment..."
            </div>
        </div>
        <div class="parent-search-request-form-input-container">
            <form action="<?php print $form['#action']?>" method="<?php print $form['#method']?>" id="<?php print $form['#form_id']?>">
                <div class="parent-search-request-form-input"><?php print render($form['first_name']); ?></div>
                <div class="parent-search-request-form-input"><?php print render($form['last_name']); ?></div>
                <div class="parent-search-request-form-input"><?php print render($form['email']); ?></div>
                <div class="parent-search-request-form-input"><?php print render($form['phone_number']); ?></div>
                <div class="parent-search-request-form-input parent-search-request-submit"><?php print render($form['submit']); ?></div>
                <div class="parent-search-request-hidden"><?php print drupal_render_children($form);?></div>
            </form>
        </div>
    </div>
</div>
<?php endif; ?>

<?php if (!user_is_anonymous()): ?>
<div class="parent-search-request-container registered-container">
    <form action="<?php print $form['#action']?>" method="<?php print $form['#method']?>" id="<?php print $form['#form_id']?>">
        <div class="parent-search-request-top-bar">
            Request a tutor
        </div>
        <div class="parent-search-request-sub-container">
            <div class="parent-search-request-header">
                <div class="parent-search-request-header-text-registered">
                    <p>Hi <?php print ucwords(get_user_firstname($user->uid)); ?>,</p>
                    <p>We'd be delighted to help you find your perfect <?php print $form['level']['#value'] . " " . $form['subject']['#value']; ?> tutor. Simply click the button below and a member of the team will hand-pick a selection of great tutors for you.</p>
                </div>
            </div>
            <div class="parent-search-request-form-input-container-registered">
                    <div class="parent-search-request-form-input parent-search-request-submit"><?php print render($form['submit']); ?></div>
            </div>
            <div class="parent-search-request-footer">
                <div class="parent-search-request-footer-check">
                    <?php print render($form['accept']); ?>
                </div>
                <div class="parent-search-request-footer-text">
                    Yes, I am happy to be messaged by up to 3 carefully selected tutors matching this tutor request.
                </div>
            </div>
        </div>
        <div class="parent-search-request-hidden"><?php print drupal_render_children($form);?></div>
    </form>
</div>
<?php endif; ?>
