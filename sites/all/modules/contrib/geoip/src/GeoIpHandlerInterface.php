<?php
/**
 * @file
 * The GeoIP API Interface.
 */

namespace Drupal\geoip;


interface GeoIpHandlerInterface {

  /**
   * Set the db file to use.
   *
   * @param string $db_file
   *   Path to the db file.
   */
  public function setDbFile($db_file);

  /**
   * Returns an array of all information related the ip.
   *
   * !Attention! The array isn't unified in any way. The return will change
   * depending on which DB type / version is used.
   *
   * @param string $ip
   *   The ip to resolve.
   *
   * @return array
   *   Country code or FALSE on failure.
   */
  public function rawRecord($ip = NULL);

  /**
   * Returns the continent code for a given IP.
   *
   * Defaults to using the current user's IP if not specified.
   *
   * @param string $ip
   *   The ip to resolve.
   *
   * @return string|FALSE
   *   Continent code or FALSE on failure. Code is always upper case.
   */
  public function continentCode($ip = NULL);


  /**
   * Returns the continent name for a given IP.
   *
   * Defaults to using the current user's IP if not specified.
   *
   * @param string $ip
   *   The ip to resolve.
   *
   * @return string|FALSE
   *   Continent name or FALSE on failure.
   */
  public function continentName($ip = NULL);

  /**
   * Returns the ISO 3166-2 country code for a given IP.
   *
   * Defaults to using the current user's IP if not specified.
   *
   * @param string $ip
   *   The ip to resolve.
   *
   * @return string|FALSE
   *   Country code or FALSE on failure. Code is always upper case.
   */
  public function countryCode($ip = NULL);


  /**
   * Returns the country name for a given IP.
   *
   * Defaults to using the current user's IP if not specified.
   *
   * @param string $ip
   *   The ip to resolve.
   *
   * @return string|FALSE
   *   Country name or FALSE on failure.
   */
  public function countryName($ip = NULL);


  /**
   * The region code for a given IP.
   *
   * This will just return the most accurate subdivision if there are multiple
   * levels.
   *
   * @param string $ip
   *   The ip to resolve.
   *
   * @return string|FALSE
   *   The region name or FALSE on failure. Code is always upper case.
   */
  public function regionCode($ip = NULL);

  /**
   * The region name for a given IP.
   *
   * This will just return the most accurate subdivision if there are multiple
   * levels.
   *
   * @param string $ip
   *   The ip to resolve.
   *
   * @return string|FALSE
   *   The region name or FALSE on failure.
   */
  public function regionName($ip = NULL);

  /**
   * The city name for a given IP.
   *
   * Defaults to using the current user's IP if not specified.
   * This function only works with the city level database and will return
   * false in all other cases.
   *
   * @param string $ip
   *   The ip to resolve.
   *
   * @return string|FALSE
   *   The city name or FALSE on failure (e.g. the country db is used).
   */
  public function cityName($ip = NULL);
}
