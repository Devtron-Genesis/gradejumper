<?php
/**
 * @file
 * Rules integration of the geoip module
 */

/**
 * Implements hook_rules_action_info().
 *
 * Condition to compare if the detected country is contained in a list
 * of selected countries.
 */
function geoip_rules_condition_info() {
  return array(
    'geoip_rules_condition_country_compare' => array(
      'label' => t('Check for user country detected by ip.'),
      'base' => 'geoip_rules_condition_country_compare',
      'parameter' => array(
        'Countries' => array(
          'label' => t('Country'),
          'type' => 'list<text>',
          'options list' => 'country_get_list',
        ),
      ),
      'group' => t('GeoIp'),
    ),
    'geoip_rules_condition_continent_compare' => array(
      'label' => t('Check for user continent detected by ip.'),
      'base' => 'geoip_rules_condition_continent_compare',
      'parameter' => array(
        'Countries' => array(
          'label' => t('Continent'),
          'type' => 'list<text>',
          'options list' => 'geoip_continents_list',
        ),
      ),
      'group' => t('GeoIp'),
    ),
  );
}

/**
 * Checks if the detected country matches to one in the list.
 *
 * @param array $countries
 *   List of countries to check against.
 *
 * @return bool
 *   TRUE if the country code is in the list.
 */
function geoip_rules_condition_country_compare($countries) {
  if (!is_array($countries)) {
    $countries = explode('\n', strtoupper($countries));
  }
  return in_array(geoip_country_code(), $countries);
}

/**
 * Checks if the detected continent matches to one in the list.
 *
 * @param array $continents
 *   List of continents to check against.
 *
 * @return bool
 *   TRUE if the continent code is in the list.
 */
function geoip_rules_condition_continent_compare($continents) {
  if (!is_array($continents)) {
    $countries = explode('\n', strtoupper($continents));
  }
  return in_array(geoip_continent_code(), $countries);
}
