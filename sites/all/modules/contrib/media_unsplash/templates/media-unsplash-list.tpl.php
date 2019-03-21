<?php

/**
 * @file
 * Default theme implementation for displaying thumbnails.
 *
 * @see template_preprocess()
 * @see template_preprocess_page()
 * @see template_process()
 */
?>
<div id="<?php print $css_wrapper; ?>" class="<?php print $css_wrapper; ?>">
  <div class="media-list-thumbnails">
    <?php if (is_array($content)): ?>
    <ul id="photos">
      <?php foreach ($content['images'] as $key => $img): ?>
        <li>
          <div class="media-item">
            <div class="media-thumbnail">
              <img class="unsplash"
                   data-image="<?php print $img['download']; ?>"
                   src="<?php print $img['thumb']; ?>"/>
              <div class="label-wrapper">
                <?php print $img['link']; ?>
              </div>
            </div>
          </div>
        </li>
      <?php endforeach; ?>
    </ul>
    <div id="<?php print $pager_wrapper; ?>">
      <?php print render($pager); ?>
    </div>

    <?php else: ?>
      <?php print $content; ?>
    <?php endif; ?>
  </div>
</div>
