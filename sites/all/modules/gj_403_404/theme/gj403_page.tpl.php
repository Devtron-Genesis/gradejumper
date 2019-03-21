<?php


?>
<div class="gj40s_wrap">
	<div class="gj40s_left">
		<img src="/sites/default/files/images/403-access-denied.png" style="margin: 0 auto; padding-top: 20px;">
	</div>
	<div class="gj40s_right">


	<?php
		if(user_is_logged_in()) { ?>
			<div class="gj40s_right_innner">
				Sorry, but you do not have permission to access this page of the site.<br><br>Return to our <a href="/">Homepage</a>.
			</div>
	<?php
		}
		else
		{
	 ?>
			<div class="gj40s_right_innner">
				Sorry, but you do not have permission to access this page of the site. It is probably because you aren't logged in. <br><br>Please <a href="https://secure.tutorcruncher.com/gradejumpers/login/">click here</a> to log-in.
			</div>
	<?php } ?>
</div>
