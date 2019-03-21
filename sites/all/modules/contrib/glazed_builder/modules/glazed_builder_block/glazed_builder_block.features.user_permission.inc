<?php
/**
 * @file
 * glazed_builder_block.features.user_permission.inc
 */

/**
 * Implements hook_user_default_permissions().
 */
function glazed_builder_block_user_default_permissions() {
  $permissions = array();

  // Exported permission: 'view any cb_drag_drop_block bean'.
  $permissions['view any cb_drag_drop_block bean'] = array(
    'name' => 'view any cb_drag_drop_block bean',
    'roles' => array(
      'anonymous user' => 'anonymous user',
      'authenticated user' => 'authenticated user',
    ),
    'module' => 'bean',
  );

  return $permissions;
}
