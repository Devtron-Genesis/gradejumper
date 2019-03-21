<?php
/**
 * @file
 * The GeoIP API handler for version 1 - legacy.
 */

namespace Drupal\geoip;

class GeoIpHandlerV1 implements GeoIpHandlerInterface {

  /**
   * The reader for this configuration.
   *
   * @var \GeoIp2\Database\Reader
   */
  protected $reader;

  /**
   * Path to the db file to use.
   *
   * @var string
   */
  protected $dbFile;

  /**
   * Stores the vars from geoipregionvars.php
   * @var array.
   */
  static protected $vars;

  /**
   * Load the required libraries and store some meta information.
   *
   * @throws \Exception
   */
  public function __construct() {
    // Ensure we exit with a proper exception if the library isn't available.
    if (($library = libraries_load('geoip-api-php')) && empty($library['loaded'])) {
      throw new \Exception('Unable to load GeoIP1 API.');
    }

    // Make this conditional so that even if the required file is just included
    // once we don't overwrite already set vars.
    if (isset($GLOBALS['GEOIP_REGION_NAME'])) {
      self::$vars = $GLOBALS['GEOIP_REGION_NAME'];
    }
  }

  /**
   * Creates a single reader instance for this file.
   *
   * @return resource
   *   File pointer to use.
   */
  public function getReader() {
    if (!isset($this->reader)) {
      $this->reader = geoip_open($this->dbFile, GEOIP_STANDARD);
    }
    return $this->reader;
  }

  /**
   * {@inheritdoc}
   */
  public function setDbFile($db_file) {
    $this->dbFile = $db_file;
    // Unset reader to ensure the new file is taken in account.
    $this->reader = NULL;
  }

  /**
   * Returns the record matching the ip.
   *
   * @param string $ip
   *   The ip to process.
   *
   * @return object
   *   The record object found for this IP.
   */
  public function record($ip = NULL) {
    $ip = empty($ip) ? ip_address() : $ip;
    return geoip_record_by_addr($this->getReader(), $ip);
  }

  /**
   * {@inheritdoc}
   */
  public function rawRecord($ip = NULL) {
    $raw = (array) $this->record($ip);
    // Be nice and add processed values.
    $raw['continent_name'] = $this->continentName($ip);
    $raw['region_name'] = $this->regionName($ip);
    // Ensure at least the info we have are set also if we don't use the city
    // database.
    $raw['country_code'] = $this->countryCode($ip);
    $raw['country_name'] = $this->countryName($ip);
    return $raw;
  }

  /**
   * {@inheritdoc}
   */
  public function continentCode($ip = NULL) {
    try {
      if ($this->record($ip)->continent_code != '--') {
        return strtoupper($this->record($ip)->continent_code);
      }
      return FALSE;
    }
    catch (\Exception $e) {
      return FALSE;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function continentName($ip = NULL) {
    try {
      if ($this->record($ip)->continent_code != '--') {
        $continents = geoip_continents_list();
        return $continents[strtoupper($this->record($ip)->continent_code)];
      }
      return FALSE;
    }
    catch (\Exception $e) {
      return FALSE;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function countryCode($ip = NULL) {
    try {
      return strtoupper(geoip_country_code_by_addr($this->getReader(), $ip));
    }
    catch (\Exception $e) {
      return FALSE;
    }
  }


  /**
   * {@inheritdoc}
   */
  public function countryName($ip = NULL) {
    try {
      return geoip_country_name_by_addr($this->getReader(), $ip);
    }
    catch (\Exception $e) {
      return FALSE;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function regionCode($ip = NULL) {
    try {
      // @TODO Make compatible to V2 - Letter codes.
      return strtoupper(geoip_region_by_addr($this->getReader(), $ip));
    }
    catch (\Exception $e) {
      return FALSE;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function regionName($ip = NULL) {
    try {
      $record = $this->record($ip);
      if (!empty($record->country_code) && !empty($record->region)) {
        return self::$vars[$record->country_code][$record->region];
      }
      return FALSE;
    }
    catch (\Exception $e) {
      return FALSE;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function cityName($ip = NULL) {
    try {
      return $this->record($ip)->city;
    }
    catch (\Exception $e) {
      return FALSE;
    }
  }
}
