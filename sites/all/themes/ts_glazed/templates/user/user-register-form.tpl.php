<?php if(current_path() == "modal_forms/ajax/register"): ?>
  <div id="popup-login-form">
    <h2>
      <?php print t('PLEASE REGISTER'); ?>
    </h2>
    <div class="trizzy-user-login-form-wrapper login-form-wrapper" >
      <?php print drupal_render_children($form); ?>
    </div>
  </div>
<?php endif; ?>
<?php if (((arg(0) == "user") && (arg(1) == "register")) || (current_path() == "system/ajax")): ?>
  <div id="stand-alone-registration">
    <div class="stand-alone-reg-form login-form-wrapper" >
      <div class="stand-alone-reg-form-headline">
        <h2>
          <?php if (arg(2) == "tutor"): ?>
            <?php print t('PLACE YOUR FREE ADVERT'); ?>
          <?php elseif (arg(2) == "parent"): ?>
            <?php print t('Place your FREE advert'); ?>
          <?php elseif (arg(2) == NULL): ?>
            <?php print t('PLEASE REGISTER... IT\'S FREE!'); ?>
          <?php endif; ?>
        </h2>
      </div>
      <div class="stand-alone-reg-form-body">
        <?php if (arg(2) == "parent"): ?>
          <?php print t("Be messaged by tutors with tutoring jobs or be<br>proactive and message them directly."); ?>
        <?php endif; ?>
      </div>
      <div class="stand-alone-registration-just-form">
        <?php print drupal_render_children($form); ?>
      </div>
      <div class="register-accept-terms">
        <?php print t("By registering I agree to comply with the<br><a href='/legal'>site terms</a> and <a href='/privacy'>privacy policy</a>"); ?>
      </div>
    </div>
  </div>
<?php else: ?>
	<div class="generic-user-registration-form-wrapper">
	  <?php print drupal_render_children($form) ?>
	</div>
<?php endif; ?>
