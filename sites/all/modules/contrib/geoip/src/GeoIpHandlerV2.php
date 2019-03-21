<?php
/**
 * @file
 * The GeoIP API handler for version 2.
 */

namespace Drupal\geoip;

use \GeoIp2\Database\Reader;

class GeoIpHandlerV2 implements GeoIpHandlerInterface {

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
   * Since the Maxmind API doesn't expose an unified method to read a record but
   * database typ related ones we store the method to use here once.
   *
   * @see GeoIpHandlerV2::record()
   *
   * @var string
   */
  protected $readMethod;

  /**
   * Load the required library.
   *
   * Does its best to find a library to use.
   *
   * @throws \Exception
   */
  public function __construct() {
    // Load the required library, throw Exception on failure.
    if (($library = libraries_load('GeoIP2-php')) && empty($library['loaded'])) {
      if (($library = libraries_load('GeoIP2-phar')) && empty($library['loaded'])) {
        throw new \Exception('Unable to load GeoIP2 API.');
      }
    }
  }

  /**
   * Creates a single reader instance for this file.
   *
   * @return \GeoIp2\Database\Reader
   *   The reader to use.
   */
  public function getReader() {
    if (!isset($this->reader)) {
      $this->reader = new Reader($this->dbFile);
      // Set the read method to use for this type of db.
      $database_type = $this->reader->metadata()->databaseType;
      $this->readMethod = strtolower(substr($database_type, strrpos($database_type, '-') + 1));
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
   * @return \GeoIp2\Model\AbstractModel
   *   The record object found for this IP.
   */
  public function record($ip = NULL) {
    $ip = empty($ip) ? ip_address() : $ip;
    return $this->getReader()->{$this->readMethod}($ip);
  }

  /**
   * {@inheritdoc}
   */
  public function rawRecord($ip = NULL) {
    return $this->record($ip)->raw;
  }

  /**
   * {@inheritdoc}
   */
  public function continentCode($ip = NULL) {
    try {
      return strtoupper($this->record($ip)->continent->code);
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
      return $this->record($ip)->continent->name;
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
      return strtoupper($this->record($ip)->country->isoCode);
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
      return $this->record($ip)->country->name;
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
      $subdivisions = $this->record($ip)->subdivisions;
      if ($subdivision = end($subdivisions)) {
        return strtoupper($subdivision->isoCode);
      }
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
      $subdivisions = $this->record($ip)->subdivisions;
      if ($subdivision = end($subdivisions)) {
        return $subdivision->name;
      }
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
      return $this->record($ip)->city->name;
    }
    catch (\Exception $e) {
      return FALSE;
    }
  }
}
