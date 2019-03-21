<?php

/**
 * Implements hook_theme().
 *
 * @see views_fieldsets_theme()
 * @see views-fieldsets-fieldset.tpl.php
 */
function test_theme() {
  return array(
    // Hook name format = views_fieldsets_TYPE.
    'views_fieldsets_simple' => array(
      // Label, as seen in Views Field edit screen.
      'views_fieldsets_label' => 'Super simple, func, no tpl',
      // Only 'fieldset_fields' is mandatory, but you can add anything you
      // want. 'legend' is optional, but always filled.
      'variables' => array('fieldset_fields' => array(), 'legend' => ''),
      // If your hook is a template, you'll need these, but our example isn't.
      // 'template' => 'views-fieldsets-simple',
      // 'path' => $path,
    ),
  );
}

/**
 * Implements hook_views_fieldsets_views_field_options_alter().
 *
 * @see views_fieldsets_fieldset_field_handler::option_definition()
 */
function hook_views_fieldsets_views_field_options_alter(&$options, $handler) {
  $options['link']['contains']['path'] = array('default' => '');
  $options['link']['contains']['absolute'] = array('default' => 0);
}

/**
 * Implements hook_views_fieldsets_views_field_form_alter().
 *
 * @see views_fieldsets_fieldset_field_handler::options_form()
 */
function hook_views_fieldsets_views_field_form_alter(&$form, $handler) {
  $form['link'] = array(
    '#type' => 'fieldset',
    '#title' => t('Link options'),
    '#description' => t('To wrap the entire fieldset content with a link, enter a path.'),
  );
  $form['link']['path'] = array(
    '#type' => 'textfield',
    '#title' => t('Path'),
    '#default_value' => $handler->options['fieldset']['link']['path'],
  );
  $form['link']['absolute'] = array(
    '#type' => 'checkbox',
    '#title' => t('Absolute'),
    '#default_value' => $handler->options['fieldset']['link']['absolute'],
  );
}

/**
 * Default preprocessor for views_fieldsets_simple.
 */
function template_preprocess_views_fieldsets_simple(&$variables) {
  // Much better legend:
  $variables['legend'] = 'OVERRIDE YO!';
  // Wrap the whole thing with a link:
  $handler = $variables['fields'][$variables['fieldset_field']]->handler;
  $path = $handler->options['fieldset']['link']['path'];
  $path = $handler->tokenize_value($path, $variables['view']->row_index);
  $vars['href'] = url($path); //  Use $href in the custom tpl or theme function.
}

/**
 * Theme function for 'views_fieldsets_simple'.
 */
function theme_views_fieldsets_simple($variables) {
  $content = implode("\n", array_map(function ($field) {
    return $field->separator . $field->wrapper_prefix . $field->label_html . $field->content . $field->wrapper_suffix;
  }, $variables['fieldset_fields']));
  $html = '<fieldset>';
  $html .= '<legend>' . check_plain(strip_tags($variables['legend'])) . '</legend>';
  $html .= check_plain(strip_tags($content)); // Wrap this in $href maybe?
  $html .= '</fieldset>';
  return $html;
}
