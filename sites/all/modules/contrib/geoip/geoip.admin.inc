<?php
/**
 * @file
 * Admin functions for geoip module.
 */

/**
 * Menu callback and form builder for admin/settings/geoip.
 */
function geoip_admin_settings() {
  $form['geoip_data_file'] = array(
    '#type' => 'textfield',
    '#title' => t('GeoIP data file location'),
    '#description' => t('The path to the GeoIP database file.'),
    '#default_value' => variable_get('geoip_data_file', 'sites/all/libraries/geoip/GeoIP.dat'),
    '#after_build' => array('geoip_data_file_validate'),
  );

  // Version options.
  $geoip_db_version_options = array();
  if ((($library = libraries_detect('GeoIP2-php')) && !empty($library['installed'])) || (($library_phar = libraries_detect('GeoIP2-phar')) && !empty($library_phar['installed']))) {
    $geoip_db_version_options[2] = t('Version 2');
  }
  if (($library = libraries_detect('geoip-api-php')) && !empty($library['installed'])) {
    $geoip_db_version_options[1] = t('Version 1 - Legacy');
  }

  $form['geoip_db_version'] = array(
    '#type' => 'select',
    '#title' => t('Maxmind database version'),
    '#default_value' => variable_get('geoip_db_version', 2),
    '#options' => $geoip_db_version_options,
    '#access' => !empty($geoip_db_version_options),
  );

  if (empty($geoip_db_version_options)) {
    $form['geoip_missing_api'] = array(
      '#type' => 'item',
      '#title' => t('Maxmind API missing!'),
      '#markup' => '<div class="messages error">' . t('No Maxmind API found. Please follow the installation instructions in the INSTALL.txt to install the required library.') . '</div>',
    );
  }

  $form['geoip_debug'] = array(
    '#type' => 'checkbox',
    '#title' => t('GeoIP debug mode'),
    '#description' => t('With this setting enabled, an IP may be passed in through the query string using the <kbd>geoip_debug</kbd> parameter. This should not be used on production sites.'),
    '#default_value' => variable_get('geoip_debug', FALSE),
  );

  $ip = geoip_ip_address();
  if (isset($_GET['geoip_debug'])) {
    $ip = check_plain($_GET['geoip_debug']);
  }
  $form['geoip_example'] = array(
    '#type' => 'item',
    '#title' => t('Example with !ip:', array('!ip' => $ip)),
    '#markup' => t('For this example the GET parameter <kbd>geoip_debug</kbd> is always evaluated - regardless of debug mode!') . theme('item_list', array(
      'items' => array(
        t('Continent code: %geoip_continent_code', array('%geoip_continent_code' => geoip_continent_code($ip))),
        t('Continent name: %geoip_continent_name', array('%geoip_continent_name' => geoip_continent_name($ip))),
        t('Country code: %geoip_country_code', array('%geoip_country_code' => geoip_country_code($ip))),
        t('Country name: %geoip_country_name', array('%geoip_country_name' => geoip_country_name($ip))),
        t('Region code: %geoip_region_code', array('%geoip_region_code' => geoip_region_code($ip))),
        t('Region name: %geoip_region_name', array('%geoip_region_name' => geoip_region_name($ip))),
        t('City name: %geoip_city_name', array('%geoip_city_name' => geoip_city_name($ip))),
      ),
    )),
  );

  return system_settings_form($form);
}

/**
 * Validate that the geoip_data_file exists.
 */
function geoip_data_file_validate($form_element) {
  $file = $form_element['#value'];

  if (!file_exists($file)) {
    form_error($form_element, t('The GeoIP data file could not be located at the specified location.'));
  }
  else {
    $mtime = filemtime($file);
    if ($mtime < strtotime('1 months ago')) {
      $database_link = 'http://dev.maxmind.com/geoip/geoip2/geolite2/#Downloads';
      if (variable_get('geoip_db_version', 2) == 1) {
        $database_link = 'http://dev.maxmind.com/geoip/legacy/downloadable/';
      }
      drupal_set_message(t('The GeoIP database file is more than a month old. Download the latest file at <a href="@url" target="_blank">Maxmind.com</a>.', array('@url' => $database_link)), 'warning');
    }
  }

  return $form_element;
}
