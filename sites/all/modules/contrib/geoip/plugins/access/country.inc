<?php
/**
 * @file
 * Plugin to provide access control/visibility based on the country of a ip.
 */

$plugin = array(
  'title' => t('GeoIP: Country'),
  'description' => t('Control access by country a IP belongs to.'),
  'callback' => 'geoip_ctools_plugin_region_ctools_access_check',
  'settings form' => 'geoip_ctools_plugin_region_ctools_access_settings',
  'summary' => 'geoip_ctools_plugin_region_ctools_access_summary',
  'default' => array(
    'countries' => array(),
  ),
);

/**
 * Settings form for the 'user_agent' access plugin.
 */
function geoip_ctools_plugin_region_ctools_access_settings($form, &$form_state, $conf) {
  // Ensure sane defaults.
  $conf += array(
    'countries' => array(),
  );
  $form['settings']['countries'] = array(
    '#type' => 'select',
    '#multiple' => TRUE,
    '#title' => t('Country'),
    '#default_value' => $conf['countries'],
    '#options' => country_get_list(),
    '#description' => t('The ip has to belong to one of the selected countries.'),
  );
  return $form;
}

/**
 * Check for access.
 */
function geoip_ctools_plugin_region_ctools_access_check($conf, $contexts) {
  // Ensure sane defaults.
  $conf += array(
    'countries' => array(),
  );
  return in_array(geoip_country_code(), $conf['countries']);
}

/**
 * Provide a summary description based upon provided user agent.
 */
function geoip_ctools_plugin_region_ctools_access_summary($conf, $context) {
  $countries = country_get_list();
  $countries = array_intersect_key($countries, $conf['countries']);
  return t('User IP belongs to country: @countries', array('@countries' => implode(' ' . t('or') . ' ', $countries)));
}
