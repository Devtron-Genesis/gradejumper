<?php

/************************************************************
 * gj_dh_deployment_drush_command
 ************************************************************
 * Description: Implements hook_drush_command().
 *              Define gj_get_server_name
 * Arguments: None
 * Return: drush command configuration (array).
 ************************************************************
 * Author: Dean Hopkins
 * Date: 2019-03-14
 ************************************************************/
function gj_dh_deployment_drush_command() {
    $commands['gj-get-server-name-command'] = array(
        'description' => 'Returns hostname and detected environment name as string.',
        'aliases' => array('gj-get-server-name'),
        'examples' => array(
            'drush gj-get-server-name' => 'Returns hostname and detected environment name as string.',
        ),
    );

    return $commands;
}

/************************************************************
 * drush_gj_get_server_name_command
 ************************************************************
 * Description: gj-get-server-nameDrush command main logic
 * Arguments: None
 * Return: None
 ************************************************************
 * Author: Dean Hopkins
 * Date: 2019-03-14
 ************************************************************/
function drush_gj_dh_deployment_gj_get_server_name_command() {
    $hostname = gethostname();
    $detected_env = gj_detect_environment_by_hostname();
    print "\nHostname: " . $hostname . "\nDetected Environment: " . strtoupper($detected_env) . "\n";
}