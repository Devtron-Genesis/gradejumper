<?php
    $search_label = get_search_label_from_args();
?>
<div class="row">
    <div class="col-md-8 col-md-offset-2 search-label-header">
        <?php print $search_label; ?> Tutors
    </div>
</div>
<div class="row">
  <div class="tutor-search-container-v2">
      <form action="<?php print $form['#action']?>" method="<?php print $form['#method']?>" id="<?php print $form['#form_id']?>">
        <div class="tutor-search-select-wrap">
          <div class="tutor-search-subject">
              <?php print render($form['subject']);?>
          </div>
          <div class="tutor-search-level">
              <?php print render($form['level']);?>
          </div>
          <div class="tutor-search-button">
              <?php print render($form['submit']); ?>
          </div>
        </div>
        <?php
        print render($form['form_id']);
        print render($form['form_build_id']);
        print render($form['form_token']);
        ?>
      </form>
  </div>
</div>
