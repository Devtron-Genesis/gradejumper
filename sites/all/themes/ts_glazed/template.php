<?php

//test comment

function ts_glazed_menu_tree(&$vars) {
  return '<ul class="menu nav navbar-nav">' . $vars['tree'] . '</ul>';
}

function ts_glazed_preprocess_page(&$vars, $hook) {
  if (isset($vars['node']->type) && $vars['node']->type == 'cb_drag_drop_page') {
    unset($vars['title_prefix']);
    unset($vars['title_suffix']);
  }
  if (!(isset($vars['node']->type) && $vars['node']->type == 'cb_drag_drop_page')) {
    $vars['container_class'] = 'section-wrapper';
  }
  /* Version one of the search form
  $vars['seo_form'] = drupal_get_form('gj_deanhopkins_search_subject_form'); */
  //Get the v2 search block as an renderable array (n.b the rendering is done in the .tpl.php)
  $blockObject = block_load('gj_search_frm_v2', 'gj_search_subject_v2');
  $vars['seo_form'] = _block_get_renderable_array(_block_render_blocks(array($blockObject)));


  if (isset($vars['node']) && $vars['node']->type != "") {
    $vars['template_files'][] = "page-node-" . $vars['node']->type;
    $vars['theme_hook_suggestions'][] = "page__node__" . $vars['node']->type;
  }
  foreach ($vars['primary_nav'] as $key => $nav) {
    if (isset($nav['#theme']) && $nav['#theme'] == 'menu_link__management') {
      unset($vars['primary_nav'][$key]);
    }
  }
  $vars['footer']['links'] = ts_glazed_get_footer_link();
}

function ts_glazed_theme() {
  $hook_theme = array(
    'user_login' => array(
      'render element' => 'form',
      'path' => drupal_get_path('theme', 'ts_glazed') . '/templates/user',
      'template' => 'user-login',
      'preprocess functions' => array('ts_glazed_preprocess_user_login'),
    ),
    'user_register_form' => array(
      'render element' => 'form',
      'path' => drupal_get_path('theme', 'ts_glazed') . '/templates/user',
      'template' => 'user-register-form',
      'preprocess functions' => array('ts_glazed_preprocess_user_register_form'),
    ),
    'user_pass' => array(
      'render element' => 'form',
      'path' => drupal_get_path('theme', 'ts_glazed') . '/templates/user',
      'template' => 'user-pass',
      'preprocess functions' => array('ts_glazed_preprocess_user_pass'),
    ),
    'user_pass_reset' => array(
      'render element' => 'form',
      'path' => drupal_get_path('theme', 'ts_glazed') . '/templates/user',
      'template' => 'user-pass-reset',
      'preprocess functions' => array('ts_glazed_preprocess_user_pass_reset'),
    ),
  );

  return $hook_theme;
}

function ts_glazed_preprocess_user_register_form(&$vars) {
  unset($vars['form']['actions']['submit']['#prefix']);
}

function ts_glazed_get_footer_link() {
    $gradejumpers = array(
        array(
            'link' => '/about',
            'name' => 'About us',
        ),
        array(
            'link' => '/contact',
            'name' => 'Contact us',
        ),
        array(
            'link' => '/how-it-works',
            'name' => 'How it works',
        ),
        array(
            'link' => '/help-centre',
            'name' => 'Help Centre',
        ),
        array(
            'link' => '/trust-and-safety',
            'name' => 'Trust & Safety',
        ),
        array(
            'link' => '/how-to-revise',
            'name' => 'How to Revise guide',
        ),
    );

    $resources = array(
        array(
            'link' => '/terms-of-use',
            'name' => 'Terms of Use',
        ),
        array(
            'link' => '/your-privacy',
            'name' => 'Privacy Policy'
        )
    );

    $popular_searches1 = array(
      array(
        'link' => '/level-subject/A-Level/Maths',
        'name' => 'Maths A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/Maths',
        'name' => 'Maths GCSE'
      ),
      array(
        'link' => '/level-subject/A-Level/Economics',
        'name' => 'Economics A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/Economics',
        'name' => 'Economics GCSE'
      ),
      array(
        'link' => '/level-subject/A-Level/Physics',
        'name' => 'Physics A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/Physics',
        'name' => 'Physics GCSE'
      ),
      array(
        'link' => '/level-subject/A-Level/Chemistry',
        'name' => 'Chemistry A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/Chemistry',
        'name' => 'Chemistry GCSE'
      ),
      array(
        'link' => '/level-subject/A-Level/Biology',
        'name' => 'Biology A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/Biology',
        'name' => 'Biology GCSE'
      ),
    );

    $popular_searches2 = array(
      array(
        'link' => '/level-subject/A-Level/English',
        'name' => 'English A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/English',
        'name' => 'English GCSE'
      ),
      array(
        'link' => '/level-subject/A-Level/French',
        'name' => 'French A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/French',
        'name' => 'French GCSE'
      ),
      array(
        'link' => '/level-subject/A-Level/German',
        'name' => 'German A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/German',
        'name' => 'German GCSE'
      ),
      array(
        'link' => '/level-subject/A-Level/Spanish',
        'name' => 'Spanish A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/Spanish',
        'name' => 'Spanish GCSE'
      ),
      array(
        'link' => '/level-subject/A-Level/Science',
        'name' => 'Science A-Level'
      ),
      array(
        'link' => '/level-subject/GCSE/Science',
        'name' => 'Science GCSE'
      ),
    );
    /* RPF 2019-02-26 - Removed DH generated work as no longer needed
    $popular_subjects = array();
    $vocabulary = taxonomy_vocabulary_machine_name_load('taxonomy_popular_subjects');
    $terms = entity_load('taxonomy_term', FALSE, array('vid' => $vocabulary->vid));
    foreach ($terms as $term){
        $name = $term->name;
        $link = '/subject/' . $name;
        array_push($popular_subjects, array('link' => $link, 'name' => $name));
    }

    $popular_levels = array();
    $vocabulary = taxonomy_vocabulary_machine_name_load('taxonomy_popular_levels');
    $terms = entity_load('taxonomy_term', FALSE, array('vid' => $vocabulary->vid));
    foreach ($terms as $term){
        $name = $term->name;
        $link = '/level/' . $name;
        array_push($popular_levels, array('link' => $link, 'name' => $name));
    }

    $popular_searches = array();
    $vocabulary = taxonomy_vocabulary_machine_name_load('taxonomy_popular_subjects');
    $subject_terms = entity_load('taxonomy_term', FALSE, array('vid' => $vocabulary->vid));
    $level_names = array("A-Level", "GCSE");
    foreach ($subject_terms as $subject_term){
        foreach ($level_names as $level_name){
            $name = $subject_term->name . " " . $level_name;
            $link = '/level-subject/' . $level_name . '/' . $subject_term->name;
            array_push($popular_searches, array('link' => $link, 'name' => $name));
        }
    }
    */
    return array(
        'gradejumpers' => $gradejumpers,
        'resources' => $resources,
          // RPF 2019-02-26 - Removed DH generated work as no longer needed
        //'popular_subjects' => $popular_subjects,
        //'popular_levels' => $popular_levels,
        //'popular_searches' => $popular_searches,
        'popular_searches1' => $popular_searches1,
        'popular_searches2' => $popular_searches2,
    );
}


function ts_glazed_menu_link(array $variables) {
    //if its a tutor cruncher URL, inject correct server key for dev/test/live
    $search_str = 'secure.tutorcruncher.com';
    $element_url = $variables["element"]["#href"];
    if (strpos($element_url, $search_str) !== false){
        if (module_exists("gj_dh_deployment")){
            $variables["element"]["#href"] = gj_transform_tc_url($element_url);
        } else {
            $variables["element"]["#href"] = "";
        }
    }

    return theme_menu_link($variables);
}