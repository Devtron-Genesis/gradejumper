<?php

function gj_deanhopkins_search_tutor_block_form($form, &$form_state) {
    $build = $form_state['build_info']['args'];
    $args = reset($build);

    $form['search_text'] = array(
        '#type' => 'term_ref_autocomplete_field',
        '#required' => TRUE,
        '#autocomplete_path' => 'gj_deanhopkins_search/autocomplete/',
        '#attributes' => array('class'=> array('field-search-text'),
                                'placeholder' => t(' Enter a subject...')),
    );

    $form['submit'] = array(
        '#value' => 'Find tutors',
        '#type' => 'submit',
    );

    $form['#action'] = url('search/tutor');
    $form['#method'] = 'POST';

    return $form;
}
