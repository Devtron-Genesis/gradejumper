<?php if (current_path() == "modal_forms/ajax/login") : ?>
  <div id="popup-login-form">
    <h2>
      <?php print t('PLEASE LOG IN'); ?>
    </h2>
    <div class="trizzy-user-login-form-wrapper login-form-wrapper" >
      <?php print drupal_render_children($form); ?>
    </div>
  </div>
<?php elseif ((current_path() == "node/114") || (current_path() == "node/110")): ?>
  <div id="114-login-form">
    <div class="yourtheme-user-login-form-wrapper">
      <?php print drupal_render_children($form) ?>
    </div>
  </div>
<?php elseif ((current_path() == "user/login") || (current_path() == "system/ajax")): ?>
  <div id="stand-alone-registration">
    <div class="stand-alone-reg-form login-form-wrapper" >
      <div class="stand-alone-reg-form-headline">
        <h2>
          <?php print t('LOG IN TO YOUR ACCOUNT'); ?>
        </h2>
      </div>
      <div class="stand-alone-registration-just-form">
        <?php print drupal_render_children($form); ?>
      </div>
    </div>
  </div>
<?php else: ?>
	<?php print drupal_render_children($form); ?>
<?php endif; ?>
