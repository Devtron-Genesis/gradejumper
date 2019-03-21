<?php

/********************************************************************
 * gj_deanhopkins_curated_seo_block_info                            *
 ********************************************************************
 * Description: Implements hook_block_info()                        *
 *              Register parent search request block                *
 * Arguments:                                                       *
 * Return:      $blocks                                             *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function gj_deanhopkins_curated_seo_block_info() {
    $blocks['gj_parent_search_request'] = array(
        // info: The name of the block.
        'info' => t('GradeJumpers Parent Search Request'),
    );

    return $blocks;
}

/********************************************************************
 * gj_deanhopkins_curated_seo_block_view                            *
 ********************************************************************
 * Description: Implements hook_block_view()                        *
 *              Define parent search request block view             *
 * Arguments:   $delta                                              *
 * Return:      $block                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function gj_deanhopkins_curated_seo_block_view($delta = '') {
    // The $delta parameter tells us which block is being requested.
    switch ($delta) {
        case 'gj_parent_search_request':
            $block['subject'] = t('');
            $block['content'] = gj_deanhopkins_curated_seo_block_content();
            break;
    }

    return $block;
}

/********************************************************************
 * gj_deanhopkins_curated_seo_block_content                         *
 ********************************************************************
 * Description: Implements hook_block_content()                     *
 *              Define parent search request block content          *
 * Arguments:                                                       *
 * Return:      rendered template                                   *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function gj_deanhopkins_curated_seo_block_content(){
    module_load_include('inc', 'gj_deanhopkins_curated_seo', 'gj_deanhopkins_curated_seo.form');
    drupal_add_css(drupal_get_path("module", "gj_deanhopkins_curated_seo"). "/css/gj_deanhopkins_curated_seo.css");
    $form = drupal_get_form('gj_deanhopkins_parent_search_request_form');
    return theme('gj_deanhopkins_parent_search_request_form', array('form' => $form));
}