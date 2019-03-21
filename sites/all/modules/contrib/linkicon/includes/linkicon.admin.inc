<?php

/**
 * @file
 * Provides admin related functions.
 */

/**
 * Implements hook_field_formatter_settings_form().
 */
function _linkicon_field_formatter_settings_form($field, $instance, $view_mode, $form, &$form_state) {
  $path     = drupal_get_path('module', 'linkicon');
  $display  = $instance['display'][$view_mode];
  $settings = $display['settings'];
  $elements = array();

  $elements['linkicon_prefix'] = array(
    '#type' => 'textfield',
    '#title' => t('Icon prefix class'),
    '#description' => t('A "prefix" or "namespace", e.g.: icon (Fontello), fa (FontAwesome), st-icon (Stackicons), genericon, fonticon, etc. <br />If the link title is <em>Facebook</em>, it will create classes: <em>icon icon-facebook</em> for Fontello, or <em>fa fa-facebook</em> for FontAwesome > 3. <br />The individual icon class itself is based on the link title key matching the pattern: icon-KEY, or fa-KEY.<br />To add classes for the A tag, such as button, external, etc, use the widget settings instead. <br />If icon API present and integration used, it will be ignored and managed/overriden by icon API.'),
    '#required' => TRUE,
  );

  $elements['linkicon_wrapper_class'] = array(
    '#type' => 'textfield',
    '#title' => t('Additional wrapper class'),
    '#description' => t('Additional wrapper class for the entire icon list.'),
  );

  $elements['linkicon_load'] = array(
    '#type' => 'checkbox',
    '#title' => t('Allow linkicon to provide CSS assets'),
    '#description' => t('Otherwise, DIY accordingly.'),
  );

  $elements['linkicon_vertical'] = array(
    '#type' => 'checkbox',
    '#title' => t('Vertical'),
    '#description' => t('By default, icons are displayed inline. Check to make icons stacked vertically.'),
    '#states' => array(
      'visible' => array(
        ':input[name*="linkicon_load"]' => array('checked' => TRUE),
      ),
    ),
  );

  $elements['linkicon_style'] = array(
    '#type' => 'select',
    '#title' => t('Icon style'),
    '#options' => array(
      'round'    => t('Round'),
      'round-2'  => t('Round 2'),
      'round-5'  => t('Round 5'),
      'round-8'  => t('Round 8'),
      'round-10'  => t('Round 10'),
      'square'   => t('Square'),
      'button'   => t('Button'),
    ),
    '#empty_option' => t('- None -'),
    '#states' => array(
      'visible' => array(
        ':input[name*="linkicon_load"]' => array('checked' => TRUE),
      ),
    ),
    '#description' => t('Button is more prominent if the title text is not hidden over the background color.'),
  );

  $elements['linkicon_color'] = array(
    '#type' => 'select',
    '#title' => t('Icon background color'),
    '#options' => array(
      'grey'   => t('Grey'),
      'dark'   => t('Dark'),
      'purple' => t('Purple'),
      'orange' => t('Orange'),
      'blue'   => t('Blue'),
      'lime'   => t('Lime'),
      'red'    => t('Red'),
    ),
    '#empty_option' => t('- None -'),
    '#states' => array(
      'visible' => array(
        ':input[name*="linkicon_load"]' => array('checked' => TRUE),
      ),
    ),
    '#description' => t('Basic background color. You should do proper theming to suit your design better, and disable all this.'),
  );

  $elements['linkicon_tooltip'] = array(
    '#type' => 'checkbox',
    '#title' => t('Display title as tooltip'),
    '#states' => array(
      'visible' => array(
        ':input[name*="linkicon_load"]' => array('checked' => TRUE),
      ),
    ),
  );

  $elements['linkicon_no_text'] = array(
    '#type' => 'checkbox',
    '#title' => t('Visually hide the title text'),
    '#states' => array(
      'visible' => array(
        ':input[name*="linkicon_load"]' => array('checked' => TRUE),
      ),
    ),
  );

  $elements['linkicon_maxlength'] = array(
    '#type' => 'textfield',
    '#title' => t('The title and tooltip maxlength'),
    '#description' => t('Limit the amount of characters if using token replacement for the title and tooltip as defined at the widget settings, default to 60 characters.'),
    '#size' => 6,
    '#maxlength' => 3,
  );

  $elements['linkicon_global_title'] = array(
    '#type' => 'textfield',
    '#title' => t('Override title with a generic link title'),
    '#description' => t('If provided, the link title will be overriden with this text, e.g.: Visit the site, View Demo.'),
    '#states' => array(
      'visible' => array(
        ':input[name*="linkicon_no_text"]' => array('checked' => FALSE),
      ),
    ),
  );

  $elements['linkicon_position'] = array(
    '#type' => 'select',
    '#title' => t('Icon position to the title text'),
    '#description' => t('By default icon is before the text.'),
    '#options' => array(
      'bottom' => t('Bottom'),
      'right'  => t('Right'),
      'top'    => t('Top'),
    ),
    '#empty_option' => t('Left'),
    '#states' => array(
      'visible' => array(
        ':input[name*="linkicon_no_text"]' => array('checked' => FALSE),
      ),
    ),
  );

  $icon_sizes = array(
    'small' => t('Small'),
    'medium' => t('Medium'),
    'large' => t('Large'),
    'xlarge' => t('X-large'),
    'xxlarge' => t('Xx-large'),
  );

  $elements['linkicon_size'] = array(
    '#type' => 'select',
    '#title' => t('Icon font size'),
    '#options' => $icon_sizes,
    '#empty_option' => t('Default'),
    '#states' => array(
      'visible' => array(
        ':input[name*="linkicon_load"]' => array('checked' => TRUE),
      ),
    ),
  );

  $elements['linkicon_font'] = array(
    '#type' => 'textfield',
    '#title' => t('Path to font icon CSS file'),
    '#description' => t('Valid path to CSS file, e.g.: sites/all/libraries/fontello/css/fontello.css. <br />Leave blank if your theme has already had one. Overriden if Icon API preferred, or if the prefix matches one, e.g.: fontawesome.module. <br />Please be aware of possible conflicts if you installed different icon fonts <br />due to their namespace collision. Most icon fonts tend to make use the same .icon:before.'),
    '#element_validate' => array('_linkicon_element_validate_font_path'),
    '#states' => array(
      'visible' => array(
        ':input[name*="linkicon_load"]' => array('checked' => TRUE),
      ),
    ),
  );

  // Build a preview.
  if (function_exists('icon_bundles')) {
    $providers = icon_providers();

    $provider_options = array();
    foreach ($providers as $provider) {
      $provider_options[$provider['name']] = $provider['title'];
    }

    // @todo filter by status flag
    if ($provider_options) {
      $elements['linkicon_bundle'] = array(
        '#type' => 'select',
        '#title' => t('Icon module integration'),
        '#options' => $provider_options,
        '#description' => t('The above icon module providers are detected. You can choose which icon CSS file to load with this module. <br />Make sure that you have a working module that loads relevant CSS accordingly. <br />Known working modules as of this writing: fontawesome, and icomoon. This integration is optional.'),
        '#empty_option' => t('- None -'),
      );
    }
  }

  if (!empty($settings['linkicon_bundle']) || !empty($settings['linkicon_font']) || module_exists('fontawesome')) {
    $prefix_class = check_plain($settings['linkicon_prefix']);
    $icon_previews = array();
    $linkicon_item = array(
      '#theme' => 'linkicon_item',
      '#position' => $settings['linkicon_position'],
      '#title' => 'Twitter',
      '#attributes' => array('class' => array($settings['linkicon_prefix'], $settings['linkicon_prefix'] . '-twitter')),
      '#icon_bundle' => $settings['linkicon_bundle'] ? $settings['linkicon_bundle'] : FALSE,
      '#icon_name' => 'twitter',
      '#icon_prefix'  => $prefix_class,
    );

    $icon = drupal_render($linkicon_item);

    $tooltip = '';
    if ($settings['linkicon_tooltip']) {
      $tooltip = ' data-title="Twitter"';
    }
    foreach ($icon_sizes as $key => $size) {
      $is_active = $key == $settings['linkicon_size'] ? ' active' : '';
      $icon_previews[] = array('#markup' => '<a class="linkicon__item linkicon--' . $key . $is_active . '" href="#"' . $tooltip . '>' . $icon . '</a>');
    }

    $preview = array(
      '#theme' => 'linkicon',
      '#linkicon_id' => 'linkicon-preview',
      '#items' => $icon_previews,
    );

    foreach (array('color', 'load', 'no_text', 'position', 'style', 'tooltip', 'wrapper_class') as $key) {
      $preview['#config'][$key] = $settings['linkicon_' . $key];
    }

    if ($settings['linkicon_load']) {
      $preview['#attached']['css'][] = array('data' => $path . '/css/linkicon.css');
      if ($settings['linkicon_font'] && empty($settings['linkicon_bundle'])) {
        $preview['#attached']['css'][] = array('data' => strip_tags($settings['linkicon_font']));
      }
    }

    $elements['linkicon_size_preview'] = array(
      '#markup' => drupal_render($preview),
    );
  }

  $defaults = linkicon_defaults();
  foreach (element_children($elements) as $element) {
    if (isset($elements[$element]['#type']) && !isset($elements[$element]['#default_value'])) {
      $default = isset($defaults[$element]) ? $defaults[$element] : '';
      $elements[$element]['#default_value'] = isset($settings[$element]) ? $settings[$element] : $default;
    }
  }

  return $elements;
}

/**
 * Implements hook_field_formatter_settings_summary().
 */
function _linkicon_field_formatter_settings_summary($field, $instance, $view_mode) {
  $display  = $instance['display'][$view_mode];
  $settings = $display['settings'];
  $summary  = array();
  $summary[] = t('Base class: <em>@linkicon_prefix</em>.', array(
    '@linkicon_prefix' => $settings['linkicon_prefix'],
  ));

  $summary[] = t('Module CSS: <em>@linkicon_load</em>. Wrapper: <em>@linkicon_wrapper_class</em>. Style: <em>@linkicon_style</em>. Bg: <em>@linkicon_color</em>.', array(
    '@linkicon_load' => $settings['linkicon_load'] ? t('Yes') : t('No'),
    '@linkicon_wrapper_class' => $settings['linkicon_wrapper_class'] ? $settings['linkicon_wrapper_class'] : t('None'),
    '@linkicon_vertical' => $settings['linkicon_vertical'] ? t('Vertical') : t('Horizontal'),
    '@linkicon_style' => $settings['linkicon_style'] ? $settings['linkicon_style'] : t('None'),
    '@linkicon_color' => $settings['linkicon_color'] ? $settings['linkicon_color'] : t('None'),
  ));

  if ($settings['linkicon_load']) {
    $summary[] = t('Size: <em>@linkicon_size</em>. No text: <em>@linkicon_no_text</em>. Tooltip: <em>@linkicon_tooltip</em>', array(
      '@linkicon_size' => $settings['linkicon_size'],
      '@linkicon_no_text' => $settings['linkicon_no_text'] ? t('Yes') : t('No'),
      '@linkicon_tooltip' => $settings['linkicon_tooltip'] ? t('Yes') : t('No'),
    ));

    if (empty($settings['linkicon_no_text'])) {
      $summary[] = t('Use global title: <em>@linkicon_global_title</em>. <br />Icon position: <em>@linkicon_position</em>.', array(
        '@linkicon_global_title' => $settings['linkicon_global_title'] ? $settings['linkicon_global_title'] : t('No'),
        '@linkicon_position' => $settings['linkicon_position'] ? $settings['linkicon_position'] : t('Left'),
      ));
    }

    $summary[] = t('Font icon path: <em>@linkicon_font</em>.', array(
      '@linkicon_font' => $settings['linkicon_font'] ? $settings['linkicon_font'] : t('No'),
    ));
    $summary[] = t('Icon provider: <em>@linkicon_bundle</em>.', array(
      '@linkicon_bundle' => $settings['linkicon_bundle'] ? $settings['linkicon_bundle'] : t('No'),
    ));
  }

  return $summary;
}

/**
 * Alters the existing link field widget settings form elements.
 */
function _linkicon_field_widget_settings_form_alter(&$form, $settings) {
  if ($form['widget']['type']['#value'] == 'link_field') {
    $form['settings']['title']['#options'] += array(
      'predefined' => t('Predefined Title'),
    );

    // Avoid confusing static title by disabling it if predefined is selected.
    // We don't want to hide it so to have immediate awareness of this option.
    $form['settings']['title_value']['#states'] = array(
      'disabled' => array(
        ':input[name="instance[settings][title]"]' => array('value' => 'predefined'),
      ),
    );

    // Insert our extra option after title.
    $new_form['settings'] = array();
    foreach ($form['settings'] as $key => $value) {
      if ($key == 'title_value') {
        $new_form['settings']['title_predefined'] = array(
          '#type' => 'textarea',
          '#title' => t('Allowed titles'),
          '#default_value' => isset($settings['title_predefined']) ? $settings['title_predefined'] : '',
          '#description' => t('Enter the list of key|value pairs of predefined titles separated by new line, where key is the icon name without prefix, e.g.: <br />for <em>icon-facebook</em>, place <em>facebook|Facebook</em>. The prefix is defined at Display formatter so that you are not stuck in database when the icon vendor change prefixes from "icon-" to just "fa-", etc. Make sure the icon name is available at your icon set. To have a tooltip different from the title, add a third pipe value.<br />Warning! Pre-existing values will be reset. Token is supported for title and tooltip. Use the "Browse available tokens." under "Allow user-entered tokens" below if token module installed.'),
          '#states' => array(
            'visible' => array(
              ':input[name="instance[settings][title]"]' => array('value' => 'predefined'),
            ),
          ),
        );
      }
      $new_form['settings'][$key] = $value;
    }

    // Replace $form['settings'] with new form.
    $form['settings'] = $new_form['settings'];
  }
}

/**
 * Implements hook_form_FORM_ID_alter().
 */
function _linkicon_form_field_ui_field_edit_form_alter(&$form, $form_state) {
  // Get the instance and widget type.
  $element = &$form['instance'];
  $widget_type = $element['widget']['type']['#value'];

  if ($widget_type == 'link_field') {
    // Get the field instance and settings.
    $instance = field_info_instance($element['entity_type']['#value'], $element['field_name']['#value'], $element['bundle']['#value']);
    $settings = $instance['settings'];

    // Alter the existing form elements.
    linkicon_field_widget_settings_form_alter($element, $settings);
  }
}
