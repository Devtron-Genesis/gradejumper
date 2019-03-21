<?php

  if($data['nid'] > 0) {
    $header_data = generate_parent_sign_up_header_data($data['nid']);
  }
?>
<div class="gj_rr_parent_query_wrap">
  <div class="gj_rr_parent_query_box">
    <div class="gj_rr_parent_query_signup_text_block">
      <div class="gj_rr_parent_query_signup_text_block_header">
        <h3>Messaging <?php print get_registration_redirect_firstname($data['nid']); ?></h3>
      </div>
      <div class="gj_rr_parent_query_signup_text_block_image">
        <img src="<?php print image_style_url("small_user_image_round", $header_data['tutor_image']); ?>" />
      </div>
      <div class="gj_rr_parent_query_header_stars">
        <?php print $header_data['tutor_stars']; ?>
      </div>
      <div class="gj_rr_parent_query_signup_text">
        After sign up you will be redirected to our secure member’s area where you are free to message <?php print get_registration_redirect_firstname($data['nid']); ?> directly via the private messaging system.
      </div>
      <div class="gj_rr_parent_query_signup_button">
        <a href="https://secure.tutorcruncher.com/gradejumpers/signup/client/" class="btn btn-primary btn-lg" id="tutor-ad-header-send-message">Continue to sign up</a>
      </div>
      <div class="gj_rr_parent_query_signup_bottom">
        By signing up you agree to our <a href="/legal">terms and conditions</a> and <a href="/privacy">privacy policy</a>
      </div>
    </div>
  </div>
  <div class="gj_rr_parent_query_trustpilot">
    <img src="/sites/default/files/trustpilot_logo_full.png">
    <br>
    Rated the top grade “Excellent” on <strong>Trustpilot</strong>
  </div>
</div>
