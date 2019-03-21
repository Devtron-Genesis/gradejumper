<?php
/**
 * @file
 * Plugin to provide access control/visibility based on the continent of a ip.
 */

$plugin = array(
  'title' => t('GeoIP: Continent'),
  'description' => t('Control access by continent a IP belongs to.'),
  'callback' => 'geoip_ctools_plugin_region_ctools_access_check',
  'settings form' => 'geoip_ctools_plugin_region_ctools_access_settings',
  'summary' => 'geoip_ctools_plugin_region_ctools_access_summary',
  'default' => array(
    'continents' => array(),
  ),
);

/**
 * Settings form for the 'user_agent' access plugin.
 */
function geoip_ctools_plugin_region_ctools_access_settings($form, &$form_state, $conf) {
  // Ensure sane defaults.
  $conf += array(
    'continents' => array(),
  );
  $form['settings']['continents'] = array(
    '#type' => 'select',
    '#multiple' => TRUE,
    '#title' => t('continent'),
    '#default_value' => $conf['continents'],
    '#options' => geoip_continents_list(),
    '#description' => t('The ip has to belong to one of the selected continents.'),
  );
  return $form;
}

/**
 * Check for access.
 */
function geoip_ctools_plugin_region_ctools_access_check($conf, $contexts) {
  // Ensure sane defaults.
  $conf += array(
    'continents' => array(),
  );
  return in_array(geoip_continent_code(), $conf['continents']);
}

/**
 * Provide a summary description based upon provided user agent.
 */
function geoip_ctools_plugin_region_ctools_access_summary($conf, $context) {
  $continents = geoip_continents_list();
  $continents = array_intersect_key($continents, $conf['continents']);
  return t('User IP belongs to continent: @continents', array('@continents' => implode(' ' . t('or') . ' ', $continents)));
}
