<?php

function gj_deanhopkins_parent_search_request_form($form, &$form_state) {
    global $user;
    $form['first_name'] = array(
        '#type' => 'textfield',
        '#required' => TRUE,
        '#title' => "First name",
        '#description' => "First name",
        '#placeholder' => "First name",
        '#default_value' => ucwords(get_user_firstname($user->uid))
    );

    $form['last_name'] = array(
        '#type' => 'textfield',
        '#required' => TRUE,
        '#title' => "Last name",
        '#description' => "Last name",
        '#placeholder' => "Last name",
        '#default_value' => ucwords(get_user_lastname($user->uid))
    );

    $form['email'] = array(
        '#type' => 'textfield',
        '#title' => "Email address",
        '#description' => "Email address",
        '#placeholder' => "Email address",
    );

    $form['phone_number'] = array(
        '#type' => 'textfield',
        '#required' => FALSE,
        '#title' => "Phone number",
        '#description' => "Phone number",
        '#placeholder' => "Phone number",
        '#element_validate' => array('element_validate_number')
    );

    $form['accept'] = array(
        '#type' =>'checkbox',
    );

    $subject_str = isset(arg()[2]) ? arg()[2] : NULL;
    $level_str = isset(arg()[1]) ? arg()[1] : NULL;

    if (isset($subject_str) && isset($level_str)){
        $search_str = $subject_str . " (" . $level_str . ")";
    } else if (isset($subject_str)){
        $search_str = $subject_str;
    } else {
        $search_str = NULL;
    }

    $tid = _get_subject_level_terms_from_string($search_str)['tid'];

    $form['subject'] = array('#type' => 'hidden', '#value' => $subject_str);
    $form['level'] = array('#type' => 'hidden', '#value' => $level_str);
    $form['tid'] = array('#type' => 'hidden', '#value' => $tid);

    $form['submit'] = array(
        '#value' => 'Find me a tutor',
        '#type' => 'submit',
    );

    return $form;
}

function gj_deanhopkins_parent_search_request_form_validate($form, &$form_state) {
    // Random example, if the title is 'test' throw an error
    if (user_is_anonymous() && !valid_email_address($form['email']['#value'])) {
        form_set_error('email', t('The email address appears to be invalid.'));
    }
    if (!user_is_anonymous()){
        if (!$form_state['values']['accept']){
            form_set_error('accept', t('Please tick to accept.'));
        }
    }
}

function gj_deanhopkins_parent_search_request_form_submit($form, &$form_state) {
    $tid = isset($form['tid']['#value']) ? $form['tid']['#value'] : NULL;
    $subject = isset($form['subject']['#value']) ? $form['subject']['#value'] : NULL;
    $level = isset($form['level']['#value']) ? $form['level']['#value'] : NULL;
    $email = $form['email']['#value'];

    $results = _get_parent_search_requests_by_email_and_subject_level_tid($email, $tid);
    if (sizeof($results) > 0){
        $node = _create_parent_search_request_node($form);
        _notify_relevant_tutors($form, $node);
        $options = array('query' => array('managed_search' => base64_encode(date("M,d,Y h:i:s A"))));
        drupal_goto('level-subject/' . $level . '/' . $subject, $options);
    } else {
        $node = _create_parent_search_request_node($form);
        _notify_relevant_tutors($form, $node);
        _redirect_search_request($form);
    }
}

function _create_parent_search_request_node($form){
    global $user;

    if (user_is_anonymous()){
        $first_name = $form['first_name']['#value'];
        $last_name = $form['last_name']['#value'];
        $email = $form['email']['#value'];
        $phone = isset($form['phone_number']['#value']) ? $form['phone_number']['#value'] : NULL;
    } else {
        $first_name = get_user_firstname($user->uid);
        $last_name = get_user_lastname($user->uid);
        $email = $user->mail;
    }

    $subject = isset($form['subject']['#value']) ? $form['subject']['#value'] : NULL;
    $level = isset($form['level']['#value']) ? $form['level']['#value'] : NULL;
    $tid = isset($form['tid']['#value']) ? $form['tid']['#value'] : NULL;

    //create the node
    $node = new stdClass();
    $node->type = "parent_search_request";
    $node->title = "Parent Search Request: " . $first_name . " " . $last_name . " - " . $subject . " (" . $level . ")";
    node_object_prepare($node);
    $node->uid = $user->uid;
    $node->status = 1;

    $node->field_search_request_first_name['und'][]['value'] = $first_name;
    $node->field_search_request_last_name['und'][]['value'] = $last_name;
    $node->field_search_request_email['und'][]['email'] = $email;
    $node->field_search_request_phone['und'][]['value'] = $phone;
    $node->field_search_request_subject['und'][]['value'] = $subject;
    $node->field_search_request_level['und'][]['value'] = $level;
    $node->field_search_request_tid['und'][]['value'] = $tid;


    $node = node_submit($node);
    node_save($node);

    return $node;
}

function _notify_relevant_tutors($form, $parent_search_request){
    $tid = isset($form['tid']['#value']) ? $form['tid']['#value'] : NULL;

    if ($tid){
        $tutor_ads = _get_tutor_ads_by_subject_level_tid($tid);
        foreach ($tutor_ads as $tutor_ad){
            $tutor_user = user_load($tutor_ad->uid);
            _notify_tutor_of_search_request($tutor_user, $parent_search_request);
        }
    }

}

function _notify_tutor_of_search_request($tutor_user, $parent_search_request){
    $message = "Hi " . get_tutor_ad_first_name(get_tutor_ad_by_user($tutor_user)) . ",<br /><br />";
    $message .= "We have recieved a new tutoring request from " . $parent_search_request->field_search_request_first_name['und'][0]['value'] . ".<br /><br />";
    $message .= "Proacively responding to this request with a friendly message will significantly increase your chances of winning the business. Click the button below to create your proactive response...<br /><br />";

    $message .= "<div style='width:100%; text-align: center;'>";
    $message .=  "<a href='". $GLOBALS['base_url'] . "/respond_search_request/" . base64_encode($parent_search_request->nid) . "' style='" . _get_btn_email_style() . "'>Create proactive response</a><br /><br />";
    $message .= "</div>";

    $link = l("log into your account", $GLOBALS['base_url'] . "/user/login");
    $message .= "You can alternatively " . $link . " and click on the \"Proactive responses\" link to view all matching tutor requests that are currently available.<br /><br />";
    $message .= "We reward proactivity, so the faster you respond the better! :)";

    $params = array(
        'body' => $message,
        'subject' => 'GradeJumpers New Tutoring Request',
        'headers'=>'simple',
    );
    $to = $tutor_user->mail;
    $from = "support@gradejumpers.com";

    drupal_mail('gj_deanhopkins_curated_seo', 'gj_dh', $to, language_default(), $params, $from, TRUE);
}

function _get_tutor_ads_by_subject_level_tid($tid){
    $ret_nodes = array();

    $qry_str = "
        SELECT nid FROM node 
        join field_data_field_col_subject_level_pricing FCOL 
        on node.nid = FCOL.entity_id 
        join field_data_field_offered_level FDLEVEL 
        on FDLEVEL.entity_id = FCOL.field_col_subject_level_pricing_value 
        where node.type = 'tutor_ad' 
        and FCOL.bundle = 'tutor_ad' 
        and FDLEVEL.bundle = 'field_col_subject_level_pricing' 
        and FDLEVEL.field_offered_level_tid = :tid 
    ";


    $results = db_query($qry_str,array('tid'=>$tid))->fetchAll();

    foreach ($results as $result){
        array_push($ret_nodes, node_load($result->nid));
    }

    return $ret_nodes;

}

function _redirect_search_request($form){
    $subject = isset($form['subject']['#value']) ? $form['subject']['#value'] : NULL;
    $level = isset($form['level']['#value']) ? $form['level']['#value'] : NULL;
    $tid = isset($form['tid']['#value']) ? $form['tid']['#value'] : NULL;
    $node_count = _count_relevant_tutor_ads($subject, $level, $tid);

    if ($node_count == 0){
        $options = array('query' => array('subject' => $subject, 'level' => $level));
        drupal_goto('/content/no-tutors-available', $options);
    } else {
        if (is_subject_level_enabled_by_manager($tid)){
            _redirect_to_search_result($subject, $level);
        } else {
            $options = array('query' => array('subject' => $subject, 'level' => $level));
            drupal_goto('/matching-tutor-live', $options);
        }

    }
}

function _redirect_to_search_result($subject, $level) {
    if ($level){
        $search_str = $subject . " (" . $level . ")";
    } else {
        $search_str = $subject;
    }

    //check if term is subject or subject-level and redirect as per spec
    $terms = _get_subject_terms_from_string($search_str);
    if (isset($terms['subject'])){
        $subject = true;
    }
    if (isset($terms['level'])){
        $level = true;
    }

    if ($subject && !$level){
        drupal_goto('subject/' . $terms['subject']);
    }
    if ($subject && $level){
        drupal_goto('level-subject/' . $terms['level'] . '/' . $terms['subject']);
    }
    if (!$subject && $level){
        drupal_goto('level/' . $terms['level']);
    }
}

function _get_subject_level_terms_from_string($sub){
    $ret = array();

    $vid = taxonomy_vocabulary_machine_name_load('taxonomy_subject_levels')->vid;
    $subject_array = explode('(',$sub);
    $subject_parent = $subject_array[0];
    $parent_term = db_query("SELECT tid, name FROM {taxonomy_term_data} WHERE vid = :vid AND name = :name",array('vid'=> $vid,'name'=>$subject_parent))->fetch();

    if($parent_term){
        $parent_term_id = $parent_term->tid;
        $parent_term = taxonomy_term_load($parent_term_id);
        $term = taxonomy_term_load($parent_term_id);
        if ($term->term_type[LANGUAGE_NONE][0]['value'] == 'Subject'){
            $ret['tid'] = $parent_term->tid;
        } else {
            $ret['tid'] = $parent_term->tid;
        }

        if(isset($subject_array[1]) && $subject_array[1] != ''){
            $child_subject = trim($subject_array[1], ')');
            $dbTerm = db_query("SELECT td.tid, td.name FROM {taxonomy_term_data} td"
                ." LEFT JOIN {taxonomy_term_hierarchy} th ON th.tid = td.tid"
                . " WHERE td.vid = :vid AND td.name = :name AND th.parent=:parent",
                array('vid'=> $vid,'name'=>$child_subject,'parent' => $parent_term_id))->fetch();

            if($dbTerm){
                $term = taxonomy_term_load($dbTerm->tid);
                if ($term->term_type[LANGUAGE_NONE][0]['value'] == 'Level'){
                    $ret['tid'] = $term->tid;
                }
            }
        }
    }

    return $ret;
}


/********************************************************************
 * gj_deanhopkins_curated_seo_mail                               *
 ********************************************************************
 * Description: Implements hook_mail()                              *
 *              Add header and footer to mail                       *
 * Arguments:   $key,&$message,$params                              *
 * Return:      void                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function gj_deanhopkins_curated_seo_mail($key,&$message,$params)
{
    switch ($key) {
        case 'gj_dh':
            $message['subject']=t($params['subject']);
            $message['body'][]=get_email_header() . $params['body'] . get_email_footer();
            $message['headers']['Content-Type'] = 'text/html; charset=UTF-8; format=flowed';
    }
}