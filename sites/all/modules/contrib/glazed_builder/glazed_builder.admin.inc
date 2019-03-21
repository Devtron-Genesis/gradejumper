<?php

/**
 * @file
 * Glazed Builder administration and module settings UI.
 */

/**
 * Form constructor for the glazed builder settings form.
 *
 * @see glazed_builder_menu()
 * @ingroup forms
 */
function glazed_builder_form($form, &$form_state) {
  $form['glazed_bootstrap'] = array(
    '#type' => 'radios',
    '#title' => t('Include Bootstrap Files'),
    '#description' => t('Bootstrap 3 is required. Bootstrap 3 Light is recommended if your theme has conflicts with Bootstrap 3 CSS. Bootstrap Light includes all grid and helper classes but doesn\'t contain normalize.css and some typography styles.'),
    '#options' => array(
      0 => t('No'),
      1 => t('Load Bootstrap 3 Full'),
      2 => t('Load Bootstrap 3 Light'),
    ),
    '#default_value' => variable_get('glazed_bootstrap', 0),
  );
  $form['glazed_development'] = array(
    '#type' => 'checkbox',
    '#title' => t('Development mode'),
    '#description' => t('In Development mode Glazed Builder will use non-minified files to make debugging easier.'),
    '#default_value' => variable_get('glazed_development', FALSE),
  );
  $form['experimental'] = array(
    '#type' => 'fieldset',
    '#title' => t('Experimental Features'),
    '#description' => t('Use with caution.'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );
  $form['experimental']['glazed_format_filters'] = array(
    '#type' => 'checkbox',
    '#title' => t('Process Text Format Filters on Frontend Builder content'),
    '#description' => t('If a field uses Glazed Builder as field formatter any filters that are set on the field\'s text format will be ignored. This is because when editing on the frontend, you are editing the raw field contents. With this setting enabled the Glazed editor still loads raw fields content, but users that don\'t have Glazed Builder editing permission will get a filtered field. Some filters will not work at all with Glazed Builder while others should work just fine.'),
    '#default_value' => variable_get('glazed_format_filters', FALSE),
  );

  $form['uninstall'] = array(
    '#type' => 'fieldset',
    '#title' => t('Uninstall Batch Process'),
    '#description' => t('Our builder content contains tokens like -base-url- that make sure your content safely migrates between environments. Before uninstalling this module you have to run this batch process on your pdocution environment to replace the tokens. This will ensure your image, css and javascript files will keep working.'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );
  $link_options['attributes']['class'][] = 'button';
  $form['uninstall']['remove_tokens'] = array(
    '#type' => 'item',
    '#markup' => l(t('Remove url tokens from Glazed Builder content.'), 'admin/config/content/glazed_builder/remove-tokens', $link_options),
  );
  return system_settings_form($form);
}


/**
 * Form constructor for the remove tokens form.
 */
function glazed_builder_remove_tokens_form($form, &$form_state) {
  return confirm_form(
    array(),
    t('Are you sure you want to remove tokens?'),
    'admin/config/content/glazed_builder',
    t('This action cannot be undone.'),
    t('Remove tokens'),
    t('Cancel')
  );
}

/**
 * Form submission handler for remove tokens form.
 */
function glazed_builder_remove_tokens_form_submit($form, &$form_state) {
  $data = array();

  $instances = field_info_instances();
  foreach ($instances as $entity_type => $bundles) {
    foreach ($bundles as $bundle_name => $instances) {
      foreach ($instances as $field_name => $instance) {
        if ($instance['display']['default']['type'] == 'text_glazed_builder') {
          $query = new EntityFieldQuery();
          $query
            ->entityCondition('entity_type', $entity_type)
            ->entityCondition('bundle', $bundle_name);
          $result = $query->execute();
          if (isset($result[$entity_type])) {
            $ids = array_keys($result[$entity_type]);
            foreach ($ids as $id) {
              $data[] = array($id, $entity_type, $field_name);
            }
          }
        }
      }
    }
  }

  $operations = array();
  foreach (array_chunk($data, 10) as $portion) {
    $operations[] = array('glazed_builder_remove_tokens_process', array($portion));
  }

  $batch = array(
    'operations' => $operations,
    'finished' => 'glazed_builder_remove_tokens_finished',
    'file' => drupal_get_path('module', 'glazed_builder') . '/glazed_builder.remove_tokens.inc',
  );

  batch_set($batch);
  batch_process('admin/config/content/glazed_builder');
}

/**
 * Batch process callback.
 */
function glazed_builder_remove_tokens_process($records, &$context) {
  foreach ($records as $record) {
    list($entity_id, $entity_type, $field_name) = $record;
    $entities = entity_load($entity_type, array($entity_id));
    $entity = reset($entities);
    foreach ($entity->{$field_name} as $language => $items) {
      foreach ($items as $delta => $item) {
        $entity->{$field_name}[$language][$delta]['value'] = glazed_builder_remove_base_url($item['value']);
        if (!empty($item['summary'])) {
          $entity->{$field_name}[$language][$delta]['summary'] = glazed_builder_remove_base_url($item['summary']);
        }
      }
    }
    $context['results'][] = entity_save($entity_type, $entity);
  }
}

/**
 * Batch 'finished' callback.
 */
function glazed_builder_remove_tokens_finished($success, $results, $operations) {
  if ($success) {
    $message = format_plural(
      count($results),
      '1 entity successfully processed.',
      '@count entities successfully processed.'
    );
    drupal_set_message($message);
  }
}
