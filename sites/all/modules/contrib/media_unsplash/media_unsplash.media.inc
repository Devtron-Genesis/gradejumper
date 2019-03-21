<?php

/**
 * @file
 * Media module integration for the Media Unsplash module.
 */

/**
 * Implements hook_media_browser_plugin_info().
 */
function media_unsplash_media_browser_plugin_info() {

  $info['unsplash'] = array(
    'title' => t('Unsplash'),
    'class' => 'MediaUnsplash',
    'weight' => -8,
  );

  return $info;
}

/**
 * Implements hook_media_internet_providers().
 *
 * Provides a very basic handler which copies files from remote sources to the
 * local files directory.
 */
function media_unsplash_media_internet_providers() {
  return array(
    'MediaUnsplashHandler' => array(
      'title' => 'Unsplash',
      'hidden' => TRUE,
      'weight' => 9999,
    ),
  );
}
