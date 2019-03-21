<?php
/**
 * @file
 * glazed_builder_block.features.field_instance.inc
 */

/**
 * Implements hook_field_default_field_instances().
 */
function glazed_builder_block_field_default_field_instances() {
  $field_instances = array();

  // Exported field_instance: 'bean-cb_drag_drop_block-field_cb_block_content'.
  $field_instances['bean-cb_drag_drop_block-field_cb_block_content'] = array(
    'bundle' => 'cb_drag_drop_block',
    'default_value' => NULL,
    'deleted' => 0,
    'description' => '',
    'display' => array(
      'default' => array(
        'label' => 'hidden',
        'module' => 'glazed_builder',
        'settings' => array(
          'field_formatter_class' => '',
        ),
        'type' => 'text_glazed_builder',
        'weight' => 0,
      ),
    ),
    'entity_type' => 'bean',
    'fences_wrapper' => 'div',
    'field_name' => 'field_cb_block_content',
    'label' => 'Content',
    'required' => 0,
    'settings' => array(
      'text_processing' => 1,
      'user_register_form' => FALSE,
    ),
    'widget' => array(
      'active' => 1,
      'module' => 'text',
      'settings' => array(
        'rows' => 16,
      ),
      'type' => 'text_textarea',
      'weight' => 2,
    ),
  );

  // Translatables
  // Included for use with string extractors like potx.
  t('Content');

  return $field_instances;
}
