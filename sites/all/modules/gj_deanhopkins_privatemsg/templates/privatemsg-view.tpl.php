<?php
// Each file loads it's own styles because we cant predict which file will be
// loaded.
drupal_add_css(drupal_get_path('module', 'privatemsg') . '/styles/privatemsg-view.base.css');
drupal_add_css(drupal_get_path('module', 'privatemsg') . '/styles/privatemsg-view.theme.css');
?>
<?php
print $anchors; ?>
<div <?php if ( !empty($message_classes)) { ?>class="<?php echo implode(' ', $message_classes); ?>" <?php } ?> id="privatemsg-mid-<?php print $mid; ?>">

    <?php
    global $user;
    $col_classes = "privatemsg-message-column ";
    if ($user->uid == $message->author->uid){
        $col_classes .= "privatemsg-message-column-owner";
    }
    ?>

  <div class="<?php echo $col_classes; ?>">
    <?php if (isset($new)): ?>
      <span class="new privatemsg-message-new"><?php print $new ?></span>
    <?php endif ?>
      <div class="privatemsg-message-information">
        <?php print $message_timestamp; ?></span>
      </div>
      <?php
        global $user;
        $classes = "privatemsg-message-body ";
        if ($user->uid == $message->author->uid){
            $classes .= "privatemsg-message-owner";
        }
        ?>
    <div class="<?php echo $classes; ?>">
      <?php print $message_body; ?>
    </div>
  </div>
  <div class="clearfix"></div>
</div>
