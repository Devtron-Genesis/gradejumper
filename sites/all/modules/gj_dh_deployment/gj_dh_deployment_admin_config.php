<?php
/************************************************************
 * gj_dh_deployment_sso_menu                                *
 ************************************************************
 * Description: Create module configuration menus.          *
 *              Hooks into drupal's menu()                  *
 * Arguments:                                               *
 * Return:      $items                                      *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_dh_deployment_menu() {
    $items['admin/config/gj_deployment'] = array(
        'title' => "GradeJumpers Deployment Configuration",
        'description' => t("GradeJumpers Deployment Configuration"),
        'position' => 'right',
        'weight' => -6,
        'access arguments' => array('administer site configuration'),
        'page callback' => 'system_admin_menu_block_page',
        'file' => 'system.admin.inc',
        'file path' => drupal_get_path('module', 'system'),
    );

    $items['admin/config/gj_deployment/configuration'] = array(
        'title' => 'TutorCruncher ID Strings',
        'description' => t('Set the TutorCruncher IDs per server.'),
        'page callback' => 'drupal_get_form',
        'page arguments' => array('gj_dh_deployment_admin_tc_id_form'),
        'access arguments' => array('administer site configuration'),
    );

    return $items;
}

/************************************************************
 * gj_dh_deployment_admin_tc_id_form                        *
 ************************************************************
 * Description: Define form for module's configuration menu *
 *              Hooks into drupal's form()                  *
 * Arguments:   $foorm, &$form_state provided by super      *
 * Return:      system_settings_form() with modified form   *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_dh_deployment_admin_tc_id_form($form, &$form_state) {
    $form['gj_current_server'] = array(
        '#type' => 'markup',
        '#markup' => '<h1>Current environment is: ' . strtoupper(gj_detect_environment_by_hostname()) . '</h1><h3>Hostname: ' . gethostname() . '</h3>',
    );

    $form['gj_dev_server_id'] = array(
        '#type' => 'textfield',
        '#size' => 128,
        '#maxlength' => 128,
        '#required' => TRUE,
        '#default_value' => variable_get('gj_dev_server_id'),
        '#title' => t('TutorCruncher ID for DEV servers'),
        '#description' => t('Enter the TutorCruncher ID to be used on DEV servers.'),
    );

    $form['gj_test_server_id'] = array(
        '#type' => 'textfield',
        '#size' => 128,
        '#maxlength' => 128,
        '#required' => TRUE,
        '#default_value' => variable_get('gj_test_server_id'),
        '#title' => t('TutorCruncher ID for TEST servers'),
        '#description' => t('Enter the TutorCruncher ID to be used on TEST servers.'),
    );

    $form['gj_live_server_id'] = array(
        '#type' => 'textfield',
        '#size' => 128,
        '#maxlength' => 128,
        '#required' => TRUE,
        '#default_value' => variable_get('gj_live_server_id'),
        '#title' => t('TutorCruncher ID for LIVE servers'),
        '#description' => t('Enter the TutorCruncher ID to be used on LIVE servers.'),
    );


    $form['#submit'][] = 'gj_dh_deployment_admin_tc_id_submit'; //Submit button call back.
    return system_settings_form($form);
}

/************************************************************
 * gj_dh_deployment_admin_tc_id_submit                      *
 ************************************************************
 * Description: Handle form submit on module config page    *
 * Arguments:   $form, $form_state provided by super        *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_dh_deployment_admin_tc_id_submit($form, $form_state) {
    $gj_dev_server_id = $form_state['input']['gj_dev_server_id'];
    $gj_test_server_id = $form_state['input']['gj_test_server_id'];
    $gj_live_server_id = $form_state['input']['gj_live_server_id'];

    variable_set('gj_dev_server_id', $gj_dev_server_id);
    variable_set('gj_test_server_id', $gj_test_server_id);
    variable_set('gj_live_server_id', $gj_live_server_id);
}