<?php

/************************************************************
 * gj_deanhopkins_tutor_ad_ref_config_form                  *
 ************************************************************
 * Description: Admin configuration form for tutor ad       *
 *              settings                                    *
 * Arguments:   $form, &$form_state                         *
 * Return:      $form                                       *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        10-12-2018                                  *
 ************************************************************/
function gj_deanhopkins_tutor_ad_ref_config_form($form, &$form_state) {
    $tutor_ad_min_refs = gj_deanhopkins_tutor_ad_form_default_value();
    $form['tutor_ad_min_refs'] = array(
        '#type' => 'textfield',
        '#size' => 128,
        '#maxlength' => 128,
        '#required' => TRUE,
        '#default_value' => $tutor_ad_min_refs['tutor_ad_min_refs'],
        '#title' => t('Minimum number of references'),
        '#description' => t('Minimum number of references required to submit Tutor Ad.'),
    );

    $form['#submit'][] = 'gj_deanhopkins_tutor_ad_submit_setting'; //Submit button call back.
    return system_settings_form($form);
}

/************************************************************
 * gj_deanhopkins_tutor_ad_form_default_value               *
 ************************************************************
 * Description: Default value callback for config form      *
 * Arguments:                                               *
 * Return:      $def_values                                 *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        10-12-2018                                  *
 ************************************************************/
function gj_deanhopkins_tutor_ad_form_default_value() {
    $def_values['tutor_ad_min_refs'] = variable_get('tutor_ad_min_refs');
    return $def_values;
}

/************************************************************
 * gj_deanhopkins_tutor_ad_submit_setting                   *
 ************************************************************
 * Description: Submit handler for tutor ad config form     *
 * Arguments:   $form, $form_state                          *
 * Return:                                                  *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        10-12-2018                                  *
 ************************************************************/
function gj_deanhopkins_tutor_ad_submit_setting($form, $form_state) {
    $tutor_ad_min_refs = $form_state['input']['tutor_ad_min_refs'];
    $var_name = 'tutor_ad_min_refs';
    variable_set($var_name, $tutor_ad_min_refs);
}