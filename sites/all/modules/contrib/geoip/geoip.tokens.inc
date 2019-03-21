<?php
/**
 * @file
 * Token callbacks for the geoip module.
 */

/**
 * Implements hook_token_info().
 */
function geoip_token_info() {
  $tokens['geoip-continent-code'] = array(
    'name' => t('Continent code'),
    'description' => t('The continent code as detected by the users ip.'),
  );
  $tokens['geoip-continent-name'] = array(
    'name' => t('Continent name'),
    'description' => t('The continent name as detected by the users ip.'),
  );

  $tokens['geoip-region-code'] = array(
    'name' => t('Region code'),
    'description' => t('The region code as detected by the users ip.'),
  );
  $tokens['geoip-region-name'] = array(
    'name' => t('Region name'),
    'description' => t('The region name as detected by the users ip.'),
  );

  $tokens['geoip-country-code'] = array(
    'name' => t('ISO-3166 country code'),
    'description' => t('The country code as detected by the users ip.'),
  );
  $tokens['geoip-country-name'] = array(
    'name' => t('Country name'),
    'description' => t('The country name as detected by the users ip.'),
  );

  return array(
    'tokens' => array('user' => $tokens),
  );
}

/**
 * Implements hook_tokens().
 */
function geoip_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $replacements = array();
  if ($type == 'user') {
    foreach ($tokens as $token => $placeholder) {
      switch ($token) {
        // Replace continent code tokens.
        case 'geoip-continent-code':
          $replacements[$placeholder] = geoip_continent_code();
          break;

        // Replace continent name tokens.
        case 'geoip-continent-name':
          $continent_name = geoip_continent_name();
          $replacements[$placeholder] = (!empty($continent_name)) ? $continent_name : t('Unknown');
          break;

        // Replace region code tokens.
        case 'geoip-region-code':
          $replacements[$placeholder] = geoip_region_code();
          break;

        // Replace region name tokens.
        case 'geoip-region-name':
          $region_name = geoip_region_name();
          $replacements[$placeholder] = (!empty($region_name)) ? $region_name : t('Unknown');
          break;

        // Replace country code tokens.
        case 'geoip-country-code':
          $replacements[$placeholder] = geoip_country_code();
          break;

        // Replace country name tokens.
        case 'geoip-country-name':
          $country_name = geoip_country_name();
          $replacements[$placeholder] = (!empty($country_name)) ? $country_name : t('Unknown');
          break;
      }
    }
  }
  return $replacements;
}
