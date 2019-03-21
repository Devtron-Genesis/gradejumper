<div class="tutor-search-container">
    <form action="<?php print $form['#action']?>" method="<?php print $form['#method']?>" id="<?php print $form['#form_id']?>">
        <div class="tutor-search-text">
            <?php print render($form['search_text']);?>
        </div>
        <div class="tutor-search-button">
            <?php print render($form['submit']); ?>
        </div>
    </form>

</div>
