<?php

/**
 * @file
 * Definition of all admin pages.
 */

/**
 * Implements hook_admin().
 */
function media_unsplash_admin() {
  $form = array();
  $form['media_unsplash_api'] = array(
    '#type' => 'textfield',
    '#title' => t('Unsplash Client ID'),
    '#default_value' => variable_get('media_unsplash_api', ""),
    '#description' => t('Register on Unsplash.com, create your application and get your Client ID <a href="https://unsplash.com/oauth/applications/" target="_blank">here</a>.'),
    '#required' => TRUE,
  );

  return system_settings_form($form);
}
