<?php
/**
 * @file
 * glazed_builder_block.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function glazed_builder_block_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "bean_admin_ui" && $api == "bean") {
    return array("version" => "5");
  }
}
