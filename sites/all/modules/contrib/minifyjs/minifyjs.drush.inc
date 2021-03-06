<?php

/**
 * Implements hook_drush_command().
 */
function minifyjs_drush_command() {
  $commands = array();

  $commands['minify-js'] = array(
    'description' => 'Drush command to minify all JS files.',
    'aliases'     => array('minifyjs'),
     'examples'   => array(
       'drush minify-js' => 'Minify all JS files.',
     ),
  );

  $commands['minify-js-skip'] = array(
    'description' => 'Drush command to minify all JS files that are not currently minified.',
    'aliases'     => array('minifyjslite'),
     'examples'   => array(
       'drush minify-js-skip' => 'Minify all JS files that are not currently minified.',
     ),
  );

  $commands['scan-js'] = array(
    'description' => 'Drush command to find all JS files.',
    'aliases'     => array('scanjs'),
     'examples'   => array(
       'drush scan-js' => 'Find all JS files.',
     ),
  );

  return $commands;
}

/**
 * Drush command logic.
 * drush_[COMMAND_NAME]().
 */
function drush_minifyjs_minify_js() {
  drush_print('Minifying all JS files...');
  module_load_include('inc', 'minifyjs', 'minifyjs.admin');
  $files = minifyjs_load_all_files();
  foreach ($files as $fid => $file) {
    $status = minifyjs_minify_file($fid);

    // Only output error messages.
    if ($status !== TRUE) {
      drush_print($status);
    }
  }

  cache_clear_all(MINIFYJS_CACHE_CID, 'cache');

  drush_print('Complete!');
}

/**
 * Drush command logic.
 * drush_[COMMAND_NAME]().
 */
function drush_minifyjs_minify_js_skip() {
  drush_print('Minifying all JS files not currently minified...');
  module_load_include('inc', 'minifyjs', 'minifyjs.admin');
  $files = minifyjs_load_all_files();
  foreach ($files as $fid => $file) {
    if (!empty($file->minified_uri)) {
      $status = minifyjs_minify_file($fid);

      // Only output error messages.
      if ($status !== TRUE) {
        drush_print($status);
      }
    }
  }

  cache_clear_all(MINIFYJS_CACHE_CID, 'cache');

  drush_print('Complete!');
}

/**
 * Drush command logic.
 * drush_[COMMAND_NAME]().
 */
function drush_minifyjs_scan_js() {
  drush_print('Scanning for JS files...');
  module_load_include('inc', 'minifyjs', 'minifyjs.admin');
  minifyjs_scan_for_javascript_files(TRUE);
  drush_print('Complete!');
}