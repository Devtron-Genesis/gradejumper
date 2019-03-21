<?php

/************************************************************
 * gj_deanhopkins_ts_sso_menu                               *
 ************************************************************
 * Description: Create module configuration menus.          *
 *              Hooks into drupal's menu()                  *
 * Arguments:                                               *
 * Return:      $items                                      *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_deanhopkins_ts_sso_menu() {
    $items['admin/config/gj_deanhopkins_ts_sso'] = array(
        'title' => "TutorCruncher SSO Config (gj_deanhopkins_ts_sso)",
        'description' => t("TutorCruncher SSO Config."),
        'position' => 'right',
        'weight' => -5,
        'access arguments' => array('administer site configuration'),
        'page callback' => 'system_admin_menu_block_page',
        'file' => 'system.admin.inc',
        'file path' => drupal_get_path('module', 'system'),
    );

    $items['admin/config/gj_deanhopkins_ts_sso/configuration'] = array(
        'title' => 'API Settings',
        'description' => t('Set the TutorCruncher API credentials.'),
        'page callback' => 'drupal_get_form',
        'page arguments' => array('gj_deanhopkins_ts_sso_form'),
        'access arguments' => array('administer site configuration'),
    );

    $items['process_tutorcruncher_email_api'] = array(
        'type' => MENU_NORMAL_ITEM,
        'title' => t('Trigger job to get tutor email addresses from Tutor Cruncher API'),
        'description' => 'Trigger job to get tutor email addresses from Tutor Cruncher API',
        'page callback' => 'gj_deanhopkins_ts_sso_process_emails',
        'access arguments' => array('access content'),
        'access callback' => TRUE,
    );

    return $items;
}

/************************************************************
 * gj_deanhopkins_ts_sso_form                               *
 ************************************************************
 * Description: Define form for module's configuration menu *
 *              Hooks into drupal's form()                  *
 * Arguments:   $foorm, &$form_state provided by super      *
 * Return:      system_settings_form() with modified form   *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_deanhopkins_ts_sso_form($form, &$form_state) {
    $default_vals = _form_default_value();
    $form['tc_secret_key'] = array(
        '#type' => 'textfield',
        '#size' => 128,
        '#maxlength' => 128,
        '#required' => TRUE,
        '#default_value' => $default_vals['tc_secret_key'],
        '#title' => t('TutorCruncher Secret Key'),
        '#description' => t('Enter the Secret Key provided by TutorCruncher SSO API.'),
    );

    $form['tc_api_private_key'] = array(
        '#type' => 'textfield',
        '#size' => 128,
        '#maxlength' => 128,
        '#required' => TRUE,
        '#default_value' => $default_vals['tc_api_private_key'],
        '#title' => t('TutorCruncher API Private Key'),
        '#description' => t('Enter the Private Key for your TutorCruncher API Integration.'),
    );

    $form['#submit'][] = 'submit_setting_for_site'; //Submit button call back.
    return system_settings_form($form);
}


/************************************************************
 * gj_deanhopkins_ts_sso_form                               *
 ************************************************************
 * Description: Set default values for config Secret Key    *
 * Arguments:                                               *
 * Return:      $def_values populated with db var value     *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function _form_default_value() {
    $def_values['tc_secret_key'] = variable_get('tc_secret_key');
    $def_values['tc_api_private_key'] = variable_get('tc_api_private_key');
    return $def_values;
}

/************************************************************
 * gj_deanhopkins_ts_sso_form                               *
 ************************************************************
 * Description: Handle form submit on module config page    *
 * Arguments:   $form, $form_state provided by super        *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function submit_setting_for_site($form, $form_state) {
    $tc_secret_key = $form_state['input']['tc_secret_key'];
    $tc_api_private_key = $form_state['input']['tc_api_private_key'];
    variable_set(tc_secret_key, $tc_secret_key);
    variable_set(tc_api_private_key, $tc_api_private_key);
}