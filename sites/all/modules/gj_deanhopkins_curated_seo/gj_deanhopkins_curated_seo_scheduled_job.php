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