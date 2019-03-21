<?php

require ('inc/Fernet.php');
use Fernet\Fernet;

/************************************************************
 * gj_deanhopkins_ts_sso_init                               *
 ************************************************************
 * Description: Main point of entry. Called on page init.   *
 *              If user isnt logged in, check if they came  *
 *              from TutorCruncher.                         *
 *              Validate their token, check if they already *
 *              have a user account. If not, register and   *
 *              assign roles.                               *
 *              Log in user.                                *
 *              Implements hook_init()                      *
 * Arguments:                                               *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_deanhopkins_ts_sso_init() {
    if (!user_is_logged_in()){
        $secret_key = variable_get('tc_secret_key');
        if ($secret_key && isset($_GET['token'])){
            $url_token = $_GET['token'];
            $fernet = new Fernet($secret_key);
            $decoded_msg = $fernet->decode($url_token);

            if (gj_validate_token_data($decoded_msg)){
                $token_data = json_decode($decoded_msg);
                $drupal_user = gj_get_existing_user($token_data);
                if (!$drupal_user){
                    $drupal_user = gj_create_user($token_data);
                    gj_assign_roles_to_user($drupal_user, $token_data);
                }
                gj_login_user($drupal_user);
            }
        }
    }
}

/************************************************************
 * gj_generate_random_password                              *
 ************************************************************
 * Description: Generate a random password for new users.   *
 *              This password is never actually used.       *
 *              TutorCruncher users log in via SSO link.    *
 *              Called upon user registration via SSO       *
 * Arguments:                                               *
 * Return:      String containing random password.          *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_generate_random_password() {
    $alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!"£$%%^&*_-+';
    $pass = array();
    $alphaLength = strlen($alphabet) - 1;
    for ($i = 0; $i < 10; $i++) {
        $n = rand(0, $alphaLength);
        $pass[] = $alphabet[$n];
    }
    return implode($pass);
}

/************************************************************
 * gj_get_user_mail_from_rest                              *
 ************************************************************
 * Description: Currently generates a placeholder email.    *
 *              We are waiting for TutorCruncher to let us  *
 *              know how to retrieve users email from ID    *
 *              via REST API.                               *
 * Arguments:   $tcid (TutorCruncher user ID)               *
 * Return:      String containing placeholder email.        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_get_user_mail_from_rest($tcid){
    //@todo: Change function to return e-mail from tutorcruncher
    //@todo: once we have answer on how to achieve this.
    return $tcid . "@example.com";
}

/************************************************************
 * gj_get_username_from_token                              *
 ************************************************************
 * Description: Extracts and compiles username from token.  *
 *              Format: FirstName_LastName_ID lowercase     *
 * Arguments:   $token_data (json decoded as token array)   *
 * Return:      String containing formatted username        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_get_username_from_token($token_data){
    $tc_role_id = $token_data->role_id;
    $nm = $token_data->nm;

    //return lower case, spaces = underscores, append with _id
    return strtolower(str_replace(' ', '_', $nm) . "_" . $tc_role_id);
}

/************************************************************
 * gj_validate_token_data                                   *
 ************************************************************
 * Description: Valides SSO token. Checks is valid JSON.    *
 * Arguments:   $decoded_msg (JSON string representing      *
 *              decrypted token data)                       *
 * Return:      true/false                                  *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_validate_token_data($decoded_msg){
    try {
        $token_data = json_decode($decoded_msg);
    } catch (Exception $e) {
        throw new Exception("Error decoding token JSON.");
    }

    if (strlen(gj_get_username_from_token($token_data)) <= 0){
        return false;
    }

    return true;
}

/************************************************************
 * gj_get_existing_user                                     *
 ************************************************************
 * Description: Gets user from token data. Check if already *
 *              registered.                                 *
 * Arguments:   $token_data (json decoded as token array)   *
 * Return:      $user (drupal user, null if not found)      *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_get_existing_user($token_data) {
    $username = gj_get_username_from_token($token_data);
    $user = user_load_by_name($username);
    return $user;
}

/************************************************************
 * gj_assign_roles_to_user                                  *
 ************************************************************
 * Description: Assigns role to user based on 'rt' (role    *
 *              type) variable from TutorCruncher SSO token *
 * Arguments:   $user (drupal user)                         *
 *              $token_data (json decoded as token array)   *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_assign_roles_to_user($user, $token_data){
    $tc_role = $token_data->rt;

    $drupal_role_name = false;

    switch ($tc_role) {
        case "Contractor":
            $drupal_role_name = 'Tutor';
            break;
        case "Client":
            $drupal_role_name = 'Parent';
            break;
        case "ServiceRecipient":
            $drupal_role_name = 'Student';
            break;
    }

    if (($drupal_role_name) and ($drupal_role = user_role_load_by_name($drupal_role_name))) {
        user_multiple_role_edit(array($user->uid), 'add_role', $drupal_role->rid);
    }
}

/************************************************************
 * gj_create_user                                           *
 ************************************************************
 * Description: Creates drupal user and sets profile TCID   *
 * Arguments:   $token_data (json decoded as token array)   *
 * Return:      $saved_user (newly created drupal user)     *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_create_user($token_data) {
    $new_user = array(
        'name' => gj_get_username_from_token($token_data),
        'pass' => gj_generate_random_password(),
        'mail' => gj_get_user_mail_from_rest($token_data->role_id),
        'tcid' => array("und" => array(array('value' => $token_data->role_id))),
        'status' => 1
    );

    try {
        $saved_user = user_save('', $new_user);
    } catch (Exception $e) {
        throw new Exception("Error saving TutorCruncher user to Drupal.");
    }

    return $saved_user;
}

/************************************************************
 * gj_login_user                                            *
 ************************************************************
 * Description: Logs in specified user to drupal manually.  *
 * Arguments:   $user (drupal user)                         *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_login_user($user){
    $form_state = array();
    $form_state['uid'] = $user->uid;
    user_login_submit(array(), $form_state);
}