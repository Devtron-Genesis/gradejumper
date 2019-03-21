<?php

/**
 * @file
 * Provides definition for unsplash media pages.
 */

/**
 * Return search results as html. Use in ajax fetching.
 */
function media_unsplash_ajax() {
  $output = t('Response was not initialized');

  // Check permission.
  if (user_access('access media browser')) {
    $param = drupal_get_query_parameters();

    // Let's take a minute to prey.
    $_GET['q'] = 'unsplash/ajax';

    if (!empty($param) && isset($param['term'])) {

      $search_term = $param['term'];

      $page = 1;

      if (isset($param['page'])) {
        $page = $param['page'] + 1;
      }

      // Search & render content.
      $content = media_unsplash_search($search_term, $page);
      $output = media_unsplash_render_content($content);

      // Return ajax.
      return array(
        '#type' => 'ajax',
        '#commands' => array(
          ajax_command_replace('#unsplash-output', $output),
        ),
      );
    }
  }

  return drupal_access_denied();
}
