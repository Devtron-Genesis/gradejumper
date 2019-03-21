<?php

/********************************************************************
 * gj_deanhopkins_curated_seo_admin_callback                        *
 ********************************************************************
 * Description: Page callback for admin/curated_seo'                *
 * Arguments:                                                       *
 * Return:      rendered template                                   *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function gj_deanhopkins_curated_seo_admin_callback() {
    return [
        '#theme' => 'curated_seo_admin_page_content',
    ];
}

/********************************************************************
 * theme_curated_seo_admin_page_content                             *
 ********************************************************************
 * Description: Page content for admin/curated_seo'                 *
 *              Table to switch between active/curated for all      *
 *              subject / level terms                               *
 * Arguments:                                                       *
 * Return:      html                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function theme_curated_seo_admin_page_content() {
    $active_subject_levels = _get_active_subject_level_terms();

    $html = "
        <style>
        .curated_col {
          float: left;
          width: 48%;
        }
        
        .curated_col:first-of-type{
            padding-right: 12px;
            border-right: 1px dotted #000000;
        }
        
        .curated_col:last-of-type{
            padding-left: 12px;
        }
        
        .curated_container:after {
          content: '';
          display: table;
          clear: both;
        }
        </style>
        
        
        <div class='curated_container'>";

    $html .= "<div class='curated_col'>";

    $html .= "<h1>Active Subject / Levels:</h1><hr />";
    $html .= "<p>Active Subjects use the original SEO results pages.</p>";

    $html .= "
        <table>
            <thead>
                <th>Subject</th>
                <th>Level</th>
                <th>Threshold Met</th>
                <th>Disable (Use Curated SEO Page)</th>
            </thead>
            <tbody>";

    foreach ($active_subject_levels as $term){
        $delete_form = drupal_get_form('gj_deanhopkins_curated_seo_delete_form', $term->tid);

        $html .= "<tr>";
        if ($term->term_type['und'][0]['value'] == "Subject"){
            $html .= "<td>" . $term->name . "</td>";
            $html .= "<td></td>";
        } else if ($term->term_type['und'][0]['value'] == "Level"){
            $subject_term = array_pop(taxonomy_get_parents($term->tid));
            $html .= "<td>" . $subject_term->name . "</td>";
            $html .= "<td>" . $term->name . "</td>";
        }
        if (is_term_over_threshold($term)){
            $html .= "<td style='color:green;'>Yes</td>";
        } else {
            $html .= "<td class='warning'>No</td>";
        }
        $html .= "<td>" . l(t('Disable (Use Curated SEO Page)'), 'admin/config/gj_deanhopkins_curated_seo/curated_seo/switch_to_curated/' . $term->tid) . "</td>";
        $html .= "</tr>";
    }

    $html .= "        
            </tbody>
        </table>
    ";
    $html .= "</div>";



    $curated_subject_levels = _get_curated_subject_level_terms();

    $html .= "<div class='curated_col'>";

    $html .= "<h1>Curated Subject / Levels:</h1><hr />";
    $html .= "<p>Curated Subjects use the Curated SEO pages, rather than the actual search results pages used when set as active.</p>";

    $html .= "
        <table>
            <thead>
                <th>Subject</th>
                <th>Level</th>
                <th>Threshold Met</th>
                <th>Enable (Use SEO results page)</th>
            </thead>
            <tbody>";

    foreach ($curated_subject_levels as $term){
        $delete_form = drupal_get_form('gj_deanhopkins_curated_seo_delete_form', $term->tid);

        $html .= "<tr>";
        if ($term->term_type['und'][0]['value'] == "Subject"){
            $html .= "<td>" . $term->name . "</td>";
            $html .= "<td></td>";
        } else if ($term->term_type['und'][0]['value'] == "Level"){
            $subject_term = array_pop(taxonomy_get_parents($term->tid));
            $html .= "<td>" . $subject_term->name . "</td>";
            $html .= "<td>" . $term->name . "</td>";
        }
        if (is_term_over_threshold($term)){
            $html .= "<td style='color:green;'>Yes</td>";
        } else {
            $html .= "<td class='warning'>No</td>";
        }
        $html .= "<td>" . l(t('Enable (Use SEO results page)'), 'admin/config/gj_deanhopkins_curated_seo/curated_seo/switch_to_active/' . $term->tid) . "</td>";
        $html .= "</tr>";
    }

    $html .= "        
            </tbody>
        </table>
    ";

    $html .= "</div>";

    $html .= "</div>";


    return $html;
}

/********************************************************************
 * gj_deanhopkins_curated_seo_admin_switch_to_curated_callback      *
 ********************************************************************
 * Description: Callback for switching a term to curated            *
 *              Updates db table markign term as curated            *
 * Arguments:   $tid                                                *
 * Return:      void                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function gj_deanhopkins_curated_seo_admin_switch_to_curated_callback($tid) {
    //check if term is already excluded
    $result = db_select('gj_seo_curated_subjects', 'scs')
        ->fields('scs')
        ->condition('tax_sub_lev_tid', $tid,'=')
        ->execute();

    if ($result->rowCount() < 1){
        //insert link to node
        $txn = db_transaction();
        try {
            db_insert('gj_seo_curated_subjects')
                ->fields(array(
                    'tax_sub_lev_tid' => $tid,
                    'show_curated_page' => 1,
                ))
                ->execute();
        } catch (Exception $e) {
            $txn->rollback();
            watchdog_exception('type', $e);
        }
    }

    drupal_set_message(t('Set record to use CURATED SEO pages.'));
    drupal_goto('admin/config/gj_deanhopkins_curated_seo/curated_seo');
}

/********************************************************************
 * gj_deanhopkins_curated_seo_admin_switch_to_active_callback       *
 ********************************************************************
 * Description: Callback for switching a term to active             *
 *              Updates db table marking term as active             *
 * Arguments:   $tid                                                *
 * Return:      void                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function gj_deanhopkins_curated_seo_admin_switch_to_active_callback($tid) {
    $num_deleted = db_delete('gj_seo_curated_subjects')
        ->condition('tax_sub_lev_tid', $tid)
        ->execute();

    drupal_set_message(t('Set ' . (string)$num_deleted . ' record to use ACTIVE SEO pages.'));
    drupal_goto('admin/config/gj_deanhopkins_curated_seo/curated_seo');
}

/********************************************************************
 * _get_active_subject_level_terms                                  *
 ********************************************************************
 * Description: Returns all subject level terms who are active      *
 *              (not curated)                                       *
 * Arguments:   $tid                                                *
 * Return:      void                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function _get_active_subject_level_terms(){
    $vocab = taxonomy_vocabulary_machine_name_load('taxonomy_subject_levels');
    $active_subject_levels = array();

    $active_rows = db_query("SELECT TTD.tid from taxonomy_term_data TTD where TTD.tid NOT IN (select tax_sub_lev_tid FROM gj_seo_curated_subjects where show_curated_page = 1) and TTD.vid = " . $vocab->vid);

    foreach ($active_rows as $record){
        $term = taxonomy_term_load($record->tid);
        array_push($active_subject_levels, $term);
    }

    return $active_subject_levels;
}

/********************************************************************
 * _get_curated_subject_level_terms                                 *
 ********************************************************************
 * Description: Returns all subject level terms who are curated     *
 *              (not active)                                        *
 * Arguments:   $tid                                                *
 * Return:      void                                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-12                                          *
 ********************************************************************/
function _get_curated_subject_level_terms(){
    $curated_subject_levels = array();
    $curated_rows = db_query("select tax_sub_lev_tid FROM gj_seo_curated_subjects where show_curated_page = 1");

    foreach ($curated_rows as $record){
        $term = taxonomy_term_load($record->tax_sub_lev_tid);
        array_push($curated_subject_levels, $term);
    }

    return $curated_subject_levels;
}