<!--<div id="popup-login-form">
	<h2>Password Help?</h2>
	<div class="trizzy-user-login-form-wrapper login-form-wrapper" >
		<div class="rpf-form-text">
			Enter your email address and we'll send you instructions to reset your password.
		</div>
		<?php //print drupal_render_children($form); ?>
	</div>
</div>
-->

<div id="stand-alone-requestpassword">
	<div class="stand-alone-requestpassword-form login-form-wrapper" >
		<!--<div class="stand-alone-reg-trustpilot"><img src="/sites/default/files/images/login/trustpilot_logo.png"></div>
		<div class="stand-alone-reg-logo"><img src="/sites/default/files/images/logos/tutorsave_main_logo.png"></div>-->
		<div class="stand-alone-reg-form-headline"><h2>REQUEST NEW PASSWORD</h2></div>
		<div class="stand-alone-registration-just-form">
			<?php print drupal_render_children($form); ?>
		</div>
	</div>
</div>
