<?php

/************************************************************
 * gj_deanhopkins_ts_sso_form_user_profile_form_alter       *
 ************************************************************
 * Description: Prevent user from modifying their TCID in   *
 *              profile. Hooks into drupal's                *
 *              form_user_profile_form_alter.               *
 * Arguments:   &$form, &$form_state, $form_id provided by  *
 *              super                                       *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_deanhopkins_ts_sso_form_user_profile_form_alter(&$form, &$form_state, $form_id) {
    $current_user = user_uid_optional_load();
    if($current_user->uid != 1) {
        $form['tcid']['#access'] = FALSE;
    }
}

/************************************************************
 * gj_deanhopkins_ts_sso_preprocess_user_profile            *
 ************************************************************
 * Description: Hide TCID from User Profile for non-admin   *
 *              users. Hooks into drupal's                  *
 *              pre_process_user_profile.                   *
 * Arguments:   &$vars provided by super                    *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_deanhopkins_ts_sso_preprocess_user_profile(&$vars) {
    $current_user = user_uid_optional_load();
    if($current_user->uid != 1) {
        unset($vars['user_profile']['tcid']);
    }
}