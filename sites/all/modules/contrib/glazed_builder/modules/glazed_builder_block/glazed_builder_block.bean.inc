<?php
/**
 * @file
 * glazed_builder_block.bean.inc
 */

/**
 * Implements hook_bean_admin_ui_types().
 */
function glazed_builder_block_bean_admin_ui_types() {
  $export = array();

  $bean_type = new stdClass();
  $bean_type->disabled = FALSE; /* Edit this to true to make a default bean_type disabled initially */
  $bean_type->api_version = 5;
  $bean_type->name = 'cb_drag_drop_block';
  $bean_type->label = 'Drag and Drop Block';
  $bean_type->options = '';
  $bean_type->description = 'Advanced page with visual page building tools. Powered by Glazed Builder.';
  $export['cb_drag_drop_block'] = $bean_type;

  return $export;
}
