<?php

/**
 * Implements hook_rules_event_info().
 *
 * @ingroup rules
 */
function one_time_login_short_link_rules_event_info() {
  return array(
    'one_time_login_short_link_visited' => array(
      'label' => t('One-Time Login Short Link was visited'),
      'group' => t('User'),
      'variables' => array(
        'account' => array(
          'type' => 'user',
          'label' => t("The user's account"),
        ),
      ),
    ),
  );
}

/**
 * Implementation of hook_rules_action_info().
 *
 * @ingroup rules
 */
function one_time_login_short_link_rules_action_info() {
  return array(
    'one_time_login_short_link_rules_action' => array(
      'label' => t('Create One-Time Login Short Link'),
      'parameter' => array(
        'account' => array(
          'type' => 'user',
          'label' => t('User'),
        ),
        'expire' => array(
          'type' => 'date',
          'label' => t('Expire Date'),
          'optional' => TRUE
        ),
        'redirect' => array(
          'type' => 'uri',
          'label' => t('Redirect path'),
          'optional' => TRUE,
        )
      ),
      'group' => t('User'),
      'provides' => array(
        'one_time_login_short_link' => array(
          'type' => 'uri',
          'label' => t('One-Time Login Short Link'),
        ),
      ),
    ),
  );
}

/**
 * Implements Rule's Action.
 *
 * @param object $account
 *   User object.
 * @param string $expire
 *   Expiration time. Value could be a number of seconds from now or from the
 *   begining of Unix Epoc; of in a format suitable for strtotime() function.
 *   @see http://php.net/manual/en/function.strtotime.php
 *   Default is '1 day'.
 * @param string $redirect
 *   Path to redirect user after success login.
 *
 * @return array
 *   Returns the one-time login link for given user prepared for later use in
 *   Rule module actions.
 */
function one_time_login_short_link_rules_action($account, $expire, $redirect) {
  return array('one_time_login_short_link' => one_time_login_short_link($account, $expire ? $expire : '+1 day', $redirect));
}

