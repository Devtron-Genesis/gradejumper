<?php

/********************************************************************
 * gj_deanhopkins_curated_seo_process_thresholds                    *
 ********************************************************************
 * Description: Main entry point for the subject level threshold    *
 *              scheduled job                                       *
 *              Checks for active subjects that no longer meet      *
 *              threshold, and curated subjects that do now meet    *
 *              the threshold.                                      *
 *              Sends email report to manager                       *
 * Arguments:                                                       *
 * Return:      void                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function gj_deanhopkins_curated_seo_process_thresholds(){
    _process_thresholds();
}

/********************************************************************
 * _process_thresholds                                              *
 ********************************************************************
 * Description: Main entry point for the subject level threshold    *
 *              scheduled job after role validation                 *
 *              Checks for active subjects that no longer meet      *
 *              threshold, and curated subjects that do now meet    *
 *              the threshold.                                      *
 *              Sends email report to manager                       *
 * Arguments:                                                       *
 * Return:      void                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function _process_thresholds(){
    $curated_terms = _get_curated_subject_level_terms();
    $active_terms = _get_active_subject_level_terms();
    $curated_terms_over_threshold = array();
    $active_terms_under_threshold = array();

    foreach ($curated_terms as $term){
        if (is_term_over_threshold($term)){
            array_push($curated_terms_over_threshold, $term);
        }
    }

    foreach ($active_terms as $term){
        if (!is_term_over_threshold($term)){
            array_push($active_terms_under_threshold, $term);
        }
    }

    $message = "<h2>The following ACTIVE terms are now BELOW the threshold:</h2> <br />";
    if (sizeof($active_terms_under_threshold) > 0){
        foreach ($active_terms_under_threshold as $term){
            $message .= _get_subject_level_term_display_name($term) . "<br />";
        }
    } else {
        $message .= "None. <br />";
    }

    $message .= "<h2>The following CURATED terms are now ABOVE the threshold:</h2>";
    if (sizeof($curated_terms_over_threshold) > 0){
        foreach ($curated_terms_over_threshold as $term){
            $message .= _get_subject_level_term_display_name($term) . "<br />";
        }
    } else {
        $message .= "None. <br />";
    }

    $message .= "<br />To make changes to the Curated SEO system, visit the following link: <br />";
    $message .= l("Curated SEO Management", "management/curated_seo");

    $params = array(
        'body' => $message,
        'subject' => 'GradeJumpers Curated SEO Threshold Report',
        'headers'=>'simple',
    );
    $to = "simon.hood@tutorsave.com";
    $from = "support@gradejumpers.com";

    drupal_mail('gj_deanhopkins_availability', 'send_link', $to, language_default(), $params, $from, TRUE);
}

/********************************************************************
 * is_term_over_threshold                                           *
 ********************************************************************
 * Description: Essentially a wrapper for                           *
 *              is_subject_level_over_threshold when we only have   *
 *              tid rather than the subject / level strings         *
 * Arguments:   $term                                               *
 * Return:      void                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function is_term_over_threshold($term){
    $term_type = $term->term_type[LANGUAGE_NONE][0]['value'];

    if ($term_type == "Subject"){
        $subject = $term->name;
        $level = NULL;
    } else {
        $subject = array_pop(taxonomy_get_parents($term->tid))->name;
        $level = $term->name;
    }

    return is_subject_level_over_threshold($subject, $level, $term->tid);
}

/********************************************************************
 * is_term_over_threshold                                           *
 ********************************************************************
 * Description: Joins a subject level term into string ie           *
 *              Maths (A-Level)                                     *
 * Arguments:   $term                                               *
 * Return:      string                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function _get_subject_level_term_display_name($term){
    if ($term->term_type['und'][0]['value'] == "Subject"){
        return $term->name;
    } else {
        $parent_term = array_pop(taxonomy_get_parents($term->tid));
        return $parent_term->name . " (" . $term->name . ")";
    }
}

/********************************************************************
 * gj_deanhopkins_curated_seo_send_tutor_emails                     *
 ********************************************************************
 * Description: Main entry point for the send search request emails *
 *              scheduled job. Finds all search requests where      *
 *              emails_sent == 0. Finds relevant tutors, sends      *
 *              emails to relevant tutorsthen update emails_sent=1  *
 * Arguments:                                                       *
 * Return:      void                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-03-28                                         *
 ********************************************************************/
function gj_deanhopkins_curated_seo_send_tutor_emails(){
    $search_requests = _get_parent_search_requests_with_unsent_emails();

    foreach ($search_requests as $search_request){
        _notify_relevant_tutors($search_request);
        $search_request->field_search_request_emails_sent['und'][0]['value'] = 1;
        node_save($search_request);
    }
}

function _notify_relevant_tutors($parent_search_request){
    $tid = $parent_search_request->field_search_request_tid['und'][0]['value'];

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