<?php
    $search_label = get_search_label_from_args();
?>
<div class="row">
    <div class="col-md-8 col-md-offset-2 search-label-header">
        <?php print $search_label; ?> Tutors
    </div>
</div>
<div class="row">
    <div class="col-md-8 col-md-offset-2">
        <form action="<?php print $form['#action']?>" method="<?php print $form['#method']?>" id="<?php print $form['#form_id']?>">
            <div class="tutor-search-text">
                <?php print render($form['search_text']);?>
            </div>
            <div class="tutor-search-button">
                <?php print render($form['submit']); ?>
            </div>
        </form>
    </div>
</div>
