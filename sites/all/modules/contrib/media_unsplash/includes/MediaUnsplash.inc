<?php

/**
 * @file
 * Definition of MediaUnsplash.
 */

/**
 * Media browser plugin for showing images from Unsplash.
 *
 * @deprecated
 */
class MediaUnsplash extends MediaBrowserPlugin {

  /**
   * Implements MediaBrowserPluginInterface::access().
   */
  public function access($account = NULL) {
    return TRUE;
  }

  /**
   * Implements MediaBrowserPlugin::view().
   */
  public function view() {
    module_load_include('inc', 'file_entity', 'file_entity.pages');

    $build = array();
    $params = $this->params;
    $params['unsplash'] = TRUE;
    $build['form'] = drupal_get_form('media_unsplash_external', $params);

    return $build;
  }

}
