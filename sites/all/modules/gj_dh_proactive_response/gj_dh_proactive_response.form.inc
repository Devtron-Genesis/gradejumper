<?php

function gj_dh_tutoring_request_form($form, &$form_state) {
    $form['about_me'] = array(
        '#type' => 'textarea',
        '#required' => TRUE,
        '#rows' => 6,
        '#resizable' => FALSE,
        '#description' => "Describe why you are the ideal tutor for this role...",
        '#placeholder' => "Describe why you are the ideal tutor for this role..."
    );

    $form['availability_text'] = array(
        '#type' => 'textarea',
        '#required' => TRUE,
        '#rows' => 6,
        '#resizable' => FALSE,
        '#description' => "Describe your availability for a 15-minute meeting and ongoing tutoring...",
        '#placeholder' => "Describe your availability for a 15-minute meeting and ongoing tutoring..."
    );

    $encrypted_search_request_nid = arg()[1];
    if ($encrypted_search_request_nid){
        $search_request_nid = base64_decode($encrypted_search_request_nid);
        $parent_search_request = node_load($search_request_nid);
        if ($parent_search_request){
            $form['parent_search_request_nid'] = array('#type' => 'hidden', '#value' => $search_request_nid);
        }
    }

    $form['submit'] = array(
        '#value' => 'Submit response',
        '#type' => 'submit',
    );

    return $form;
}

function gj_dh_tutoring_request_form_validate($form, &$form_state) {
    $parent_search_request_nid = isset($form['parent_search_request_nid']['#value']) ? $form['parent_search_request_nid']['#value'] : NULL;
    if (!$parent_search_request_nid){
        form_set_error('', t('Malformed URL'));
    }
}

function gj_dh_tutoring_request_form_submit($form, &$form_state) {
    $node = _create_tutoring_request_node($form);
    drupal_set_message("Tutor Request #" . $form['parent_search_request_nid']['#value'] . " successfully applied for.");
    _notify_customer_services_of_tutoring_request($node);
    drupal_goto('/tutoring_requests');
}

function _create_tutoring_request_node($form){
    global $user;

    $about_me = $form['about_me']['#value'];
    $availability_text = $form['availability_text']['#value'];
    $parent_search_request_nid = $form['parent_search_request_nid']['#value'];
    $tutor_ad_nid = get_tutor_ad_by_user($user)->nid;

    //create the node
    $node = new stdClass();
    $node->type = "tutoring_request";
    $node->title = "Tutoring Request: " . $user->name;
    node_object_prepare($node);
    $node->uid = $user->uid;
    $node->status = NODE_NOT_PUBLISHED;

    $node->tutor_rqst_about_me['und'][]['value'] = $about_me;
    $node->tutor_rqst_avail_txt['und'][]['value'] = $availability_text;
    $node->tutor_rqst_search_request_nid['und'][]['value'] = $parent_search_request_nid;
    $node->tutor_rqst_tutor_ad_nid['und'][]['value'] = $tutor_ad_nid;

    $node = node_submit($node);
    node_save($node);

    return $node;
}

function _notify_customer_services_of_tutoring_request($node){
    $search_request_nid = $node->tutor_rqst_search_request_nid['und'][0]['value'];
    $link = l("click here", $GLOBALS['base_url'] . "/management/tutoring_request_management/" . base64_encode($search_request_nid));
    $message = 'Dear Administrator, <br /><br />';
    $message .= 'A new "Tutoring Request" has been created. <br />';
    $message .= 'Please ' . $link . ' to verify the request or not. <br />';
    $message .= 'Automated email from GradeJumpers.com';

    $params = array(
        'body' => $message,
        'subject' => 'New Tutoring Request',
        'headers'=>'simple',
    );
    $to = "gjcuratedtest@mailinator.com";
    $to = "deanhopkins@gmail.com";
    $from = "support@gradejumpers.com";

    drupal_mail('gj_dh_proactive_response', 'gj_dh', $to, language_default(), $params, $from, TRUE);
}
