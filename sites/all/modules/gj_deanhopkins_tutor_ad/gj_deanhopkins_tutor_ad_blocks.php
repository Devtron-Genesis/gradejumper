<?php

/**
 * Implements hook_block_info().
 *
 * This hook declares what blocks are provided by the module.
 */
function gj_deanhopkins_tutor_ad_block_info() {
    // This hook returns an array, each component of which is an array of block
    // information. The array keys are the 'delta' values used in other block
    // hooks.

    $blocks['txt_complete_your_app_form'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Complete your application form'),
    );

    $blocks['txt_edit_your_app_form'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Edit your application form'),
    );

    $blocks['txt_profile_img'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Profile image'),
    );

    $blocks['txt_profile_video'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Profile video'),
    );

    $blocks['txt_qualifications'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Qualifications'),
    );

    $blocks['txt_alevels'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: A-Levels'),
    );

    $blocks['txt_dbscert'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: DBS Certificate'),
    );

    $blocks['txt_subject_level_pricing'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Subjects, levels and pricing'),
    );

    $blocks['txt_references'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: References'),
    );

    $blocks['txt_accepttos'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Accept TOS'),
    );

    $blocks['txt_preview_before_submit'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Preview before submit'),
    );

    $blocks['txt_about_me_placeholder'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: About Me (Placeholder)'),
    );

    $blocks['txt_about_sessions_placeholder'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: About My Sessions (Placeholder)'),
    );

    $blocks['txt_review_text_placeholder'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Review text (Placeholder)'),
    );

    $blocks['txt_personally_interviewed_block'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Personally Interviewed'),
    );

    $blocks['txt_personally_interviewed_block'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Personally Interviewed'),
    );

    $blocks['txt_satisfaction_guaranteed'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Satisfaction Guaranteed'),
    );

    $blocks['txt_no_hidden_fees'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: No Hidden Fees'),
    );

    $blocks['txt_preview_search_listing'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Preview Search Listing'),
    );

    $blocks['txt_preview_full_profile'] = array(
        // info: The name of the block.
        'info' => t('Tutor Ad Static Text: Preview Full Profile'),
    );

    return $blocks;
}

/**
 * Implements hook_block_configure().
 *
 * This hook declares configuration options for blocks provided by this module.
 */
function gj_deanhopkins_tutor_ad_block_configure($delta = '') {

    $lorem_ipsum = get_lorem_ipsum();

    $form = array();
    if ($delta == 'txt_profile_img') {
        $form['var_txt_profile_img'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_profile_img', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_profile_video') {
        $form['var_txt_profile_video'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_profile_video', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_qualifications') {
        $form['var_txt_qualifications'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_qualifications', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_alevels') {
        $form['var_txt_alevels'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_alevels', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_dbscert') {
        $form['var_txt_dbscert'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_dbscert', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_subject_level_pricing') {
        $form['var_txt_subject_level_pricing'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_subject_level_pricing', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_references') {
        $form['var_txt_references'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_references', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_accepttos') {
        $form['var_txt_accepttos'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_accepttos', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_preview_before_submit') {
        $form['var_txt_preview_before_submit'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_preview_before_submit', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_about_me_placeholder') {
        $form['var_txt_about_me_placeholder'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_about_me_placeholder', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_about_sessions_placeholder') {
        $form['var_txt_about_sessions_placeholder'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_about_sessions_placeholder', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_review_text_placeholder') {
        $form['var_txt_review_text_placeholder'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_review_text_placeholder', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_complete_your_app_form') {
        $form['var_txt_complete_your_app_form'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_complete_your_app_form', t($lorem_ipsum)),
        );
    }


    if ($delta == 'txt_edit_your_app_form') {
        $form['var_txt_edit_your_app_form'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_edit_your_app_form', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_personally_interviewed_block') {
        $form['var_txt_personally_interviewed_block'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_personally_interviewed_block', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_satisfaction_guaranteed') {
        $form['var_txt_satisfaction_guaranteed'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_satisfaction_guaranteed', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_no_hidden_fees') {
        $form['var_txt_no_hidden_fees'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_no_hidden_fees', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_preview_search_listing') {
        $form['var_txt_preview_search_listing'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_preview_search_listing', t($lorem_ipsum)),
        );
    }

    if ($delta == 'txt_preview_full_profile') {
        $form['var_txt_preview_full_profile'] = array(
            '#type' => 'textarea',
            '#title' => t('Block contents'),
            '#default_value' => variable_get('var_txt_preview_full_profile', t($lorem_ipsum)),
        );
    }

    return $form;
}

/**
 * Implements hook_block_save().
 *
 * This hook declares how the configured options for a block
 * provided by this module are saved.
 */
function gj_deanhopkins_tutor_ad_block_save($delta = '', $edit = array()) {
    // We need to save settings from the configuration form.
    // We need to check $delta to make sure we are saving the right block.
    if ($delta == 'txt_complete_your_app_form') {
        variable_set('var_txt_complete_your_app_form', $edit['var_txt_complete_your_app_form']);
    }

    if ($delta == 'txt_edit_your_app_form') {
        variable_set('var_txt_edit_your_app_form', $edit['var_txt_edit_your_app_form']);
    }

    if ($delta == 'txt_profile_img') {
        variable_set('var_txt_profile_img', $edit['var_txt_profile_img']);
    }

    if ($delta == 'txt_profile_video') {
        variable_set('var_txt_profile_video', $edit['var_txt_profile_video']);
    }

    if ($delta == 'txt_qualifications') {
        variable_set('var_txt_qualifications', $edit['var_txt_qualifications']);
    }

    if ($delta == 'txt_alevels') {
        variable_set('var_txt_alevels', $edit['var_txt_alevels']);
    }

    if ($delta == 'txt_dbscert') {
        variable_set('var_txt_dbscert', $edit['var_txt_dbscert']);
    }

    if ($delta == 'txt_subject_level_pricing') {
        variable_set('var_txt_subject_level_pricing', $edit['var_txt_subject_level_pricing']);
    }

    if ($delta == 'txt_references') {
        variable_set('var_txt_references', $edit['var_txt_references']);
    }

    if ($delta == 'txt_accepttos') {
        variable_set('var_txt_accepttos', $edit['var_txt_accepttos']);
    }

    if ($delta == 'txt_preview_before_submit') {
        variable_set('var_txt_preview_before_submit', $edit['var_txt_preview_before_submit']);
    }

    if ($delta == 'txt_about_me_placeholder') {
        variable_set('var_txt_about_me_placeholder', $edit['var_txt_about_me_placeholder']);
    }

    if ($delta == 'txt_about_sessions_placeholder') {
        variable_set('var_txt_about_sessions_placeholder', $edit['var_txt_about_sessions_placeholder']);
    }

    if ($delta == 'txt_review_text_placeholder') {
        variable_set('var_txt_review_text_placeholder', $edit['var_txt_review_text_placeholder']);
    }

    if ($delta == 'txt_personally_interviewed_block') {
        variable_set('var_txt_personally_interviewed_block', $edit['var_txt_personally_interviewed_block']);
    }

    if ($delta == 'txt_satisfaction_guaranteed') {
        variable_set('var_txt_satisfaction_guaranteed', $edit['var_txt_satisfaction_guaranteed']);
    }

    if ($delta == 'txt_no_hidden_fees') {
        variable_set('var_txt_no_hidden_fees', $edit['var_txt_no_hidden_fees']);
    }

    if ($delta == 'txt_preview_search_listing') {
        variable_set('var_txt_preview_search_listing', $edit['var_txt_preview_search_listing']);
    }

    if ($delta == 'txt_preview_full_profile') {
        variable_set('var_txt_preview_full_profile', $edit['var_txt_preview_full_profile']);
    }
}

/**
 * Implements hook_block_view().
 *
 * This hook generates the contents of the blocks themselves.
 */
function gj_deanhopkins_tutor_ad_block_view($delta = '') {
    // The $delta parameter tells us which block is being requested.
    switch ($delta) {
        case 'txt_complete_your_app_form':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_complete_your_app_form', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_edit_your_app_form':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_edit_your_app_form', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_profile_img':
            $block['subject'] = t('Profile image');
            $block['content'] = array(
                '#markup' => variable_get('var_txt_profile_img', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_profile_video':
            $block['subject'] = t('Profile video');
            $block['content'] = array(
                '#markup' => variable_get('var_txt_profile_video', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_qualifications':
            $block['subject'] = t('Qualifications');
            $block['content'] = array(
                '#markup' => variable_get('var_txt_qualifications', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_alevels':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_alevels', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_dbscert':
            $block['subject'] = t('DBS Certificate');
            $block['content'] = array(
                '#markup' => variable_get('var_txt_dbscert', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_subject_level_pricing':
            $block['subject'] = t('Subjects, levels and pricing');
            $block['content'] = array(
                '#markup' => variable_get('var_txt_subject_level_pricing', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_references':
            $block['subject'] = t('Add references');
            $block['content'] = array(
                '#markup' => variable_get('var_txt_references', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_accepttos':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_accepttos', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_preview_before_submit':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_preview_before_submit', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_about_me_placeholder':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_about_me_placeholder', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_about_sessions_placeholder':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_about_sessions_placeholder', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_review_text_placeholder':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_review_text_placeholder', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_personally_interviewed_block':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_personally_interviewed_block', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_satisfaction_guaranteed':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_satisfaction_guaranteed', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_no_hidden_fees':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_no_hidden_fees', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_preview_search_listing':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_preview_search_listing', t(get_lorem_ipsum()))
            );
            break;
        case 'txt_preview_full_profile':
            $block['content'] = array(
                '#markup' => variable_get('var_txt_preview_full_profile', t(get_lorem_ipsum()))
            );
            break;
    }

    return $block;
}


function get_lorem_ipsum(){
    return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vitae quam rutrum, consectetur odio eget, semper leo. Donec varius sem non auctor tempor. Nam eu viverra dolor, faucibus tempor enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
}