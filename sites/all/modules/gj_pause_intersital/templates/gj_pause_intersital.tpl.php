<?php

?>

<section class="chat">
  <div class="greeting">
    <div class="greeting__message">Just a moment while we connect you...
    </div>
  </div>
  <div class="connected">
    <div class="connected__loader"><i class="connected__dot connected__dot--1"></i><i class="connected__dot connected__dot--2"></i><i class="connected__dot connected__dot--3"></i>
    </div><span class="connected__heading">Connecting you with the GJ Team</span>
    <div class="connected__manager connected__manager--hidden"><img class="connected__pic" src="<?php print drupal_get_path('module', 'gj_pause_intersital');?>/images/manager.png" alt="" role="presentation"/>
    </div>
  </div>
  <div class="chat__header chat__header--hidden">
    <div class="chat__manager">
      <div class="chat__picWrap"><img class="chat__pic" src="<?php print drupal_get_path('module', 'gj_pause_intersital');?>/images/manager.png" alt="" role="presentation"/>
      </div>
      <div class="chat__headingWrap">
        <h1 class="chat__heading">GJ Team
        </h1><span class="chat__title">GradeJumpers Customer Services</span>
      </div>
    </div><span class="chat__status">Online now</span>
  </div>
  <div class="chat__messagesWrap chat__messagesWrap--hidden">
    <div class="chat__message chat__message--hidden">
      <p class="chat__messageText">Thanks so much for your enquiry. Just give us a second to check our <?php print gjpi_get_levelsubject(); ?> tutors’ availability. We’ll post your list here in a moment.
      </p>
    </div>
    <div class="chat__message chat__message--hidden">
      <p class="chat__messageText">Once we’ve sent over your list, you can simply create a free account and start messaging tutors right away. You can even book a complimentary 15 minute meeting with any of your favourite tutors (without any commitment or obligation).
      </p>
    </div>
    <div class="chat__message chat__message--hidden">
      <p class="chat__messageText">Great news, we’ve found some super <?php print gjpi_get_levelsubject(); ?> tutors for you! Click the button below to view your list. </p>
      <p class="chat__messageText">If you have any questions please call the London based team on 0800 772 3827 and we’ll be happy to help.</p>
      <p class="chat__messageText"> Thanks again for choosing Gradejumpers! :) </p>
    </div>
    <div class="chat__typingWrap">
      <div class="chat__loaderWrap">
        <div class="chat__typingLoader">
        </div>
      </div><span class="chat__typing"></span>
    </div>
  </div><a class="chat__continue chat__continue--hidden" href="<?php print gjpi_destination_url(); ?>">View my list of tutors</a><span class="chat__isLogout chat__isLogout--hidden">GJ Team disconnected</span>
</section>
