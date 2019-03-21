<?php
/**
 * @file
 * Plugin to provide access control/visibility based on the region of a ip.
 */

$plugin = array(
  'title' => t('GeoIP: Region'),
  'description' => t('Control access by region a IP belongs to.'),
  'callback' => 'geoip_ctools_plugin_region_ctools_access_check',
  'settings form' => 'geoip_ctools_plugin_region_ctools_access_settings',
  'summary' => 'geoip_ctools_plugin_region_ctools_access_summary',
  'default' => array(
    'regions' => '',
  ),
);

/**
 * Settings form for the 'user_agent' access plugin.
 */
function geoip_ctools_plugin_region_ctools_access_settings($form, &$form_state, $conf) {
  // Ensure sane defaults.
  $conf += array(
    'regions' => '',
  );
  $form['settings']['regions'] = array(
    '#type' => 'textarea',
    '#multiple' => TRUE,
    '#title' => t('Region'),
    '#default_value' => $conf['regions'],
    '#options' => geoip_regions_list(),
    '#description' => t('The ip has to belong to one of the regions defined here. Enter one region per line.'),
  );
  return $form;
}

/**
 * Check for access.
 */
function geoip_ctools_plugin_region_ctools_access_check($conf, $contexts) {
  // Ensure sane defaults.
  $conf += array(
    'regions' => '',
  );

  // Split the regions by new lines and remove left over spaces / carriage
  // returns.
  $regions = explode("\n", $conf['regions']);
  array_walk($regions, 'trim');

  return in_array(geoip_region_code(), $regions);
}

/**
 * Provide a summary description based upon provided user agent.
 */
function geoip_ctools_plugin_region_ctools_access_summary($conf, $context) {
  $regions = geoip_regions_list();
  $regions = array_intersect_key($regions, $conf['regions']);
  return t('User IP belongs to region: @regions', array('@regions' => implode(' ' . t('or') . ' ', $regions)));
}
