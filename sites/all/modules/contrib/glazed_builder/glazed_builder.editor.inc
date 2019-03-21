<?php

/**
 * @file
 * Glazed Builder Editor code. Only loads when a field is displayed with Glazed
 * Builder text format and the current user has Glazed Builder editor permission
 * and permission to update the field.
 *
 * @param
 * @ingroup editor
 */

/**
 * Attaches js and css assets to field render array. Also adds some libraries
 * to page output using drupal_add_library(). Adds several settings to inline JS
 * output for the builder UI to use. If the default theme implements the color
 * modulew e also provide a subset of it's colors to be used as default colors
 * in color pickers.
 *
 * @param integer $start_js_weight
 *   Offset on the weight of attached assets.
 * @param array $element
 *   A renderable array for the $items, as an array of child elements keyed by numeric indexes starting from 0.
 *   @see https://api.drupal.org/api/drupal/modules!field!field.api.php/function/hook_field_formatter_view/7.x
 *
 */
function glazed_builder_editor_attach(&$start_js_weight, &$element) {
  $themes = list_themes();
  $cms_elements = glazed_builder_get_cms_element_names();

  $element['#attached']['js'][] = array(
    'data' => glazed_builder_get_template_elements($themes),
    'type' => 'inline',
    'weight' => $start_js_weight + 5,
  );
  $element['#attached']['js'][] = array(
    'data' => "window.glazed_cms_element_names = " . json_encode($cms_elements) . ";",
    'type' => 'inline',
    'weight' => $start_js_weight + 1,
  );

  // Creating a list of views with additional settings.
  $view_elements_settings = glazed_builder_get_cms_view_element_settings();

  // Added js settings for set variable glazed_cms_element_views_settings.
  $element['#attached']['js'][] = array(
    'data' => "window.glazed_cms_element_views_settings = " . json_encode($view_elements_settings) . ";",
    'type' => 'inline',
    'weight' => $start_js_weight + 2,
  );

  // Creating a list of views tags.
  $views_tags = glazed_builder_get_cms_views_tags();

  // Added js settings for set variable views_tags.
  $element['#attached']['js'][] = array(
    'data' => "window.glazed_views_tags = " . json_encode($views_tags) . ";",
    'type' => 'inline',
    'weight' => $start_js_weight + 3,
  );

  // Creating a list of buttons style.
  $button_styles = glazed_builder_get_button_styles();

  // Added js settings for set variable button_styles.
  $element['#attached']['js'][] = array(
    'data' => "window.button_styles = " . json_encode($button_styles) . ";",
    'type' => 'inline',
    'weight' => $start_js_weight + 4,
  );

  drupal_add_library('system', 'ui');
  drupal_add_library('system', 'ui.tabs');
  drupal_add_library('system', 'ui.sortable');
  drupal_add_library('system', 'ui.droppable');
  drupal_add_library('system', 'ui.draggable');
  drupal_add_library('system', 'ui.accordion');
  drupal_add_library('system', 'ui.selectable');
  drupal_add_library('system', 'ui.resizable');
  drupal_add_library('system', 'ui.slider');

  // Add current language to the JS settings.
  global $language;
  drupal_add_js(array(
    'glazed_builder' => array(
      'language' => $language->language,
    ),
  ),
    array('type' => 'setting')
  );

  $enabled_fonts = variable_get('google_fonts_enabled_fonts', array());
  $element['#attached']['js'][] = array(
    'data' => array('glazed_builder' => array('enabled_fonts' => $enabled_fonts)),
    'type' => 'setting',
    'weight' => $start_js_weight + 10,
  );

  $glazed_classes = array();
  foreach ($themes as $theme => $theme_info) {
    if (($theme_info->status == 1) && isset($theme_info->info['glazed_classes'])) {
      $optgroup = 'optgroup-' . $theme;
      $glazed_classes[$optgroup] = $theme_info->info['name'];
      $glazed_classes = array_merge($glazed_classes, $theme_info->info['glazed_classes']);
    }
  }
  drupal_alter('glazed_builder_classes', $glazed_classes);
  $element['#attached']['js'][] = array(
    'data' => "window.glazed_classes = " . json_encode($glazed_classes) . ";",
    'type' => 'inline',
    'weight' => $start_js_weight + 11,
  );


  $styles = image_styles();
  $styles_list = array();
  foreach ($styles as $id => $style) {
    $styles_list[$id] = $style['label'];
  }
  // Add original image style.
  $styles_list = array('empty' => t('Original image')) + $styles_list;

  $element['#attached']['js'][] = array(
    'data' => array('glazed_builder' => array('image_styles' => $styles_list)),
    'type' => 'setting',
    'weight' => $start_js_weight + 12,
  );

  // Load assets media module
  if (module_exists('media')) {
    $element['#attached']['library'][] = array('media', 'media_browser');
    $element['#attached']['library'][] = array(
      'media',
      'media_browser_settings'
    );
  }

  $element['#attached']['css'][] = drupal_get_path('module', 'glazed_builder') . '/css/ac_drupal.css';
  $element['#attached']['js'][drupal_get_path('module', 'glazed_builder') . '/js/ac_drupal.js'] = array('weight' => $start_js_weight + 14);
  $element['#attached']['js'][drupal_get_path('module', 'glazed_builder') . '/glazed_builder/vendor/bootstrap-notify/bootstrap-notify.min.js'] = array('weight' => $start_js_weight + 14);
  $element['#attached']['css'][] = drupal_get_path('module', 'glazed_builder') . '/glazed_builder/vendor/et-line-font/et-line-font.css';
  $element['#attached']['css'][] = drupal_get_path('module', 'glazed_builder') . '/glazed_builder/vendor/pe-icon-7-stroke/css/pe-icon-7-stroke.css';

  if (variable_get('glazed_development', FALSE)) {
    $element['#attached']['js'][drupal_get_path('module', 'glazed_builder') . '/glazed_builder/glazed_param_types.js'] = array('weight' => $start_js_weight + 15);
    $element['#attached']['js'][drupal_get_path('module', 'glazed_builder') . '/glazed_builder/glazed_elements.js'] = array('weight' => $start_js_weight + 17);
    $element['#attached']['js'][drupal_get_path('module', 'glazed_builder') . '/glazed_builder/glazed_builder.js'] = array('weight' => $start_js_weight + 18);
  }
  else {
    $element['#attached']['js'][drupal_get_path('module', 'glazed_builder') . '/glazed_builder/glazed_param_types.min.js'] = array('weight' => $start_js_weight + 16);
    $element['#attached']['js'][drupal_get_path('module', 'glazed_builder') . '/glazed_builder/glazed_elements.min.js'] = array('weight' => $start_js_weight + 19);
    $element['#attached']['js'][drupal_get_path('module', 'glazed_builder') . '/glazed_builder/glazed_builder.min.js'] = array('weight' => $start_js_weight + 20);
  }
  $element['#attached']['css'][] = drupal_get_path('module', 'glazed_builder') . '/glazed_builder/css/glazed_builder_backend.css';

  // Expose default theme color palette to color pickers
  $default_theme = variable_get('theme_default');
  if ($palette = theme_get_setting('palette', $default_theme)) {
    $palette = array_slice($palette, 0, 10);
    $element['#attached']['js'][] = array(
      'data' => "window.sooperthemes_theme_palette = " . json_encode($palette) . ";",
      'type' => 'inline',
      'weight' => $start_js_weight + 10,
    );
  }
}

/**
 * Discovers Sidebar Elements and outputs them as JSON for builder interface.
 *
 * Checks for sidebar elements in glazed_elements folder, in active themes, and
 * in modules implementing hook_glazed_builder_elements_folders.
 *
 * @param array themes
 *   List of themes
 *
 * @return string $template_elements
 *   JSON encoded list of sidebar elements including the full HTML of the element
 *   and the path and url of element thumbnails.
 *
 * @ingroup editor
 */
function glazed_builder_get_template_elements($themes) {
  $template_elements = &drupal_static(__FUNCTION__);
  if (!isset($template_elements)) {
    if ($cache = cache_get('template_elements')) {
      $template_elements = $cache->data;
    }
    else {
      $template_elements = '';

      global $base_url;
      $glazed_elements_folders = array(
        array(
          'folder' => dirname(__FILE__) . DIRECTORY_SEPARATOR . 'glazed_elements',
          'folder_url' => $base_url . '/' . drupal_get_path('module', 'glazed_builder') . '/' . 'glazed_elements',
        ),
      );

      foreach ($themes as $theme => $theme_info) {
        if (($theme_info->status == 1)
          && ($folder = realpath(drupal_get_path('theme', $theme) . DIRECTORY_SEPARATOR . 'elements'))) {
          $glazed_elements_folders[] = array(
            'folder' => $folder,
            'folder_url' => $base_url . '/' . drupal_get_path('theme', $theme) . '/' . 'elements',
          );
        }
      }
      drupal_alter('glazed_builder_elements_folders', $glazed_elements_folders);
      $elements = array();
      foreach ($glazed_elements_folders as $glazed_elements_folder) {
        $src = $glazed_elements_folder['folder'];
        $src_url = $glazed_elements_folder['folder_url'];
        if (is_dir($src)) {
          $files = file_scan_directory($src, '/./');
          foreach ($files as $path => $file) {
            $path = realpath($path);
            $info = pathinfo($path);
            if ($info['extension'] == 'html') {
              $p = str_replace(DIRECTORY_SEPARATOR, '|', str_replace('.html', '', substr(str_replace($src, '', $path), 1)));
              $elements[$p]['html'] = file_get_contents($path);
              $elements[$p]['name'] = $info['filename'];
              $folders = explode(DIRECTORY_SEPARATOR, str_replace($src, '', $path));
              array_pop($folders);
              $folders = implode('/', $folders);
              $elements[$p]['baseurl'] = $src_url . $folders . '/';
              if (file_exists(str_replace('.html', '.png', $path))) {
                $elements[$p]['thumbnail'] = $src_url . '/' . str_replace('|', '/', $p) . '.png';
              }
              if (file_exists(str_replace('.html', '.jpg', $path))) {
                $elements[$p]['thumbnail'] = $src_url . '/' . str_replace('|', '/', $p) . '.jpg';
              }
            }
          }
        }
      }
      $template_elements = "var glazed_template_elements = " . json_encode($elements) . ";\n";
      cache_set('template_elements', $template_elements, 'cache');
    }
  }
  return $template_elements;
}

/**
 * Discovers CSS classes used for (bootstrap) buttons
 *
 * Checks for button classes in glazed_elements/Buttons and
 * in modules implementing hook_glazed_builder_element_buttons_folders.
 * These classes are used in the button modal element settings.
 *
 * @return array $button_styles
 *   Array of button style classes, keyed by an identifier for the button style
 *
 * @ingroup editor
 */
function glazed_builder_get_button_styles() {
  $button_styles = &drupal_static(__FUNCTION__);
  if (!isset($button_styles)) {
    if ($cache = cache_get('button_styles')) {
      $button_styles = $cache->data;
    }
    else {
      $button_styles = array();

      $glazed_element_buttons_folders = array(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'glazed_elements/Buttons');
      drupal_alter('glazed_builder_element_buttons_folders', $glazed_element_buttons_folders);

      $elements = array();
      foreach($glazed_element_buttons_folders as $src) {
        if (is_dir($src)) {
          $files =  file_scan_directory($src, '/\.html/');
          foreach ($files as $path => $file) {
            $path = realpath($path);
            $info = pathinfo($path);
            if ($info['extension'] == 'html') {
              $elements[$info['filename']] = file_get_contents($path);
            }
          }
        }
      }
      foreach ($elements as $key => &$element) {
        preg_match('/class="(.*?)"/', $element, $match);
        $classes = preg_replace('/(btn\s)|(btn-\w+\s)|(\saz-\w+$)/', '', $match[1]);
        if (!empty($classes)) {
          $element = $classes;
        }
        else {
          unset($element);
        }

      }
      $button_styles = $elements;
      cache_set('button_styles', $button_styles, 'cache');
    }
  }
  return $button_styles;
}

/**
 * Retrieves and caches list of CMS elements (blocks and views) for Builder interface.
 *
 * @return array $cms_elements
 *   Array of Drupal blocks and views displays. Blocks are keyed by an identifier
 *   consisting of "block"-module-delta and view displays are keyed by
 *   "view"-module-display.
 */
function glazed_builder_get_cms_element_names() {
  $cms_elements = &drupal_static(__FUNCTION__);
  if (!isset($cms_elements)) {

    $cms_elements = array();
    if (module_exists('block')) {
      if ($cache = cache_get('cms_elements_blocks')) {
        $cms_elements += $cache->data;
      }
      else {
        foreach (module_implements('block_info') as $module) {
          $module_blocks = module_invoke($module, 'block_info');
          foreach ($module_blocks as $delta => $block) {
            $cms_elements['block-' . $module . '-' . $delta] = t('Block: ') . str_replace('_', ' ', $block['info']);
          }
        }
        cache_set('cms_elements_blocks', $cms_elements, 'cache');
      }
    }
    if (module_exists('views')) {
      if ($cache = cache_get('cms_elements_views')) {
        $cms_elements += $cache->data;
      }
      else {
        $views = views_get_all_views();
        foreach ($views as $view) {
          if (!empty($view->disabled)) {
            continue;
          }
          $view = views_get_view($view->name);
          foreach ($view->display as $display) {
            $cms_elements['view-' . $view->name . '-' . $display->id] = t('View: ') . str_replace('_', ' ', $view->human_name . ' (' . $display->display_title . ')');
          }
        }
        cache_set('cms_elements_views', $cms_elements, 'cache_views');
      }
    }
  }
  return $cms_elements;
}

/**
 * Retrieves and caches list of Views tags to help organize and filter the interface
 * where you can select views displays in the Glazed Builder modal.
 *
 * @return array $cms_views_tags
 *   Array of views tags keyed by an identifier with the view and display name
 */
function glazed_builder_get_cms_views_tags() {
  $cms_views_tags = &drupal_static(__FUNCTION__);
  if (!isset($cms_views_tags)) {
    if ($cache = cache_get('cms_views_tags')) {
      $cms_views_tags = $cache->data;
    }
    else {
      $cms_views_tags = array();

      if (module_exists('views')) {
        $views = views_get_all_views();
        foreach ($views as $view) {
          if (!empty($view->disabled)) {
            continue;
          }
          $view = views_get_view($view->name);
          foreach ($view->display as $display) {
            $cms_views_tags['az_view-' . $view->name . '-' . $display->id] = $view->name;
          }
        }
      }

      cache_set('cms_views_tags', $cms_views_tags, 'cache_views');
    }
  }
  return $cms_views_tags;
}

/**
 * Retrieves and caches list of views displays and their settings and fields.
 *
 * @return array $cms_view_elements_settings
 *   Array of views displayscontaining all metadata that the Glazed Builder
 *   interface uses for modifying the display using various settings. Keyed by
 *   an identifier with the view and display name.
 */
function glazed_builder_get_cms_view_element_settings() {
  $cms_view_elements_settings = &drupal_static(__FUNCTION__);
  if (!isset($cms_elements)) {
    if ($cache = cache_get('cms_view_elements_settings', 'cache_views')) {
      $cms_view_elements_settings = $cache->data;
    }
    else {
      $cms_view_elements_settings = array();
      if (module_exists('views')) {
        $views = views_get_all_views();
        foreach ($views as $view) {
          if (!empty($view->disabled)) {
            continue;
          }
          $view = views_get_view($view->name);
          foreach ($view->display as $display) {
            $key = 'az_view-' . $view->name . '-' . $display->id;
            $view->set_display($display->id);
            // prevent fatal error when handler is missing (for example with views data export display)
            if (!is_object($display->handler)) {
              continue;
            }
            $title = method_exists($view, 'get_title') ? $view->get_title() : 0;
            $contextual_filter = method_exists($view, 'get_items') ? $view->get_items('argument', $display->id) : 0;
            $cms_view_elements_settings[$key] = array(
              'view_display_type' => $display->display_plugin,
              'title' => !empty($title) ? 1 : 0,
              'contextual_filter' => !empty($contextual_filter) ? 1 : 0,
            );

            $fields = $display->handler->get_option('fields');
            foreach ($fields as $k => $field) {
              $handler = $view->display_handler->get_handler('field', $field['id']);
              if (empty($handler)) {
                $field_name = t('Broken/missing handler: @table > @field', array(
                  '@table' => $field['table'],
                  '@field' => $field['field'],
                ));
              }
              else {
                $field_name = check_plain($handler->ui_name(TRUE));
              }
              if (!empty($field['relationship']) && !empty($relationships[$field['relationship']])) {
                $field_name = '(' . $relationships[$field['relationship']] . ') ' . $field_name;
              }
              $fields[$k] = $field_name;
            }
            $cms_view_elements_settings[$key]['use_fields'] = (count($fields) > 1) ? 1 : 0;
            $cms_view_elements_settings[$key]['field_list'] = $fields;

            if (!empty($display->display_options['pager'])) {
              $pager = $display->display_options['pager'];
              $cms_view_elements_settings[$key]['pager'] = array(
                'items_per_page' => !empty($pager['options']['items_per_page']) ? $pager['options']['items_per_page'] : NULL,
                'offset' => !empty($pager['options']['offset']) ? $pager['options']['offset'] : NULL,
              );
            }
            elseif (!empty($cms_view_elements_settings['az_view-' . $view->name . '-default']['pager'])) {
              $cms_view_elements_settings[$key]['pager'] = $cms_view_elements_settings['az_view-' . $view->name . '-default']['pager'];
            }
            else {
              $cms_view_elements_settings[$key]['pager'] = array(
                'items_per_page' => NULL,
                'offset' => NULL,
              );
            }
          }
        }
      }
    }

    cache_set('cms_view_elements_settings', $cms_view_elements_settings, 'cache_views');
  }
  return $cms_view_elements_settings;
}
