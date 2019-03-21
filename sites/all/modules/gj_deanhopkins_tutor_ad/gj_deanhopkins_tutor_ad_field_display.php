<?php

/********************************************************************
 * get_tutor_ad_first_name                                          *
 ********************************************************************
 * Description: Returns tutor first name, upper case first letter   *
 * Arguments:   $node                                               *
 * Return:      String                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_first_name($node){
    return ucfirst($node->field_tutor_first_name['und'][0]['value']);
}

/********************************************************************
 * get_tutor_ad_last_name                                          *
 ********************************************************************
 * Description: Returns tutor last name, upper case first letter   *
 * Arguments:   $node                                               *
 * Return:      String                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_last_name($node)
{
    return ucfirst($node->field_tutor_second_name['und'][0]['value']);
}

/********************************************************************
 * get_tutor_ad_last_initial                                        *
 ********************************************************************
 * Description: Returns first letter of tutor last name, upper case *
 * Arguments:   $node                                               *
 * Return:      String                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_last_initial($node){
    $last_name = get_tutor_ad_last_name($node);
    if ($last_name){
        return $last_name[0];
    } else {
        return "";
    }
}

function get_tutor_ad_name_initial_formatted($node){
    return '<p class="tutor-ad-header-name">' . get_tutor_ad_first_name($node) . ' ' . get_tutor_ad_last_initial($node) . '.' . '</p>';
}

/********************************************************************
 * get_tutor_ad_first_degree                                        *
 ********************************************************************
 * Description: First degree, string formatted as "Degree - Uni"    *
 * Arguments:   $node                                               *
 * Return:      String                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_first_degree($node){
    if ($node->op == "Preview"){
        $degree = $node->field_col_add_degree['und']['0']['field_degree_name']['und'][0]['value'];
        $uni = $node->field_col_add_degree['und']['0']['field_degree_university']['und'][0]['value'];
    } else {
        $field_col_id = $node->field_col_add_degree['und'][0]['value'];
        $fields = entity_load_unchanged('field_collection_item', $field_col_id);
        $degree = $fields->field_degree_name['und']['0']['value'];
        $uni = $fields->field_degree_university['und']['0']['value'];
    }
    return $degree . " - " . $uni;
}

/********************************************************************
 * get_tutor_ad_first_uni                                           *
 ********************************************************************
 * Description: First degree uni                                    *
 * Arguments:   $node                                               *
 * Return:      String                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_first_uni($node){
    $field_col_id = $node->field_col_add_degree['und'][0]['value'];
    $fields = entity_load_unchanged('field_collection_item', $field_col_id);
    $uni = $fields->field_degree_university['und']['0']['value'];
    return $uni;
}

/********************************************************************
 * get_tutor_ad_star_rating                                         *
 ********************************************************************
 * Description: Return rendered star rating element for tutor ad    *
 * Arguments:   $node                                               *
 * Return:      rendered field                                      *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_star_rating($node){
    $field_col = field_view_field('node', $node, 'field_col_add_reference','basic');
    $field = reset($field_col[0]['entity']['field_collection_item'])['field_reference_star_rating'];
    return render($field);
}

/********************************************************************
 * get_tutor_ad_star_rating_display                                 *
 ********************************************************************
 * Description: Return rendered star rating element for tutor ad    *
                in display mode                                     *
 * Arguments:   $node                                               *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_star_rating_display($node, $messaging=false){
    if ($node->op == "Preview"){
        $field_cols = array();
        foreach ($node->field_col_add_reference['und'] as $field_col_array){
            array_push($field_cols, (object)$field_col_array);
        }
    } else {
        $field_cols = array();
        foreach ($node->field_col_add_reference['und'] as $field_col_id){
            array_push($field_cols, entity_load_unchanged('field_collection_item', $field_col_id['value']));
        }
    }

    $total = 0;
    $count = 0;
    foreach ($field_cols as $field_col){
        $rating = floatval($field_col->field_reference_star_rating['und'][0]['rating']);
        $total += $rating;
        $count += 1;
    }

    $avg_rating = $total / $count;
    $rating_out_of_five = $avg_rating / 20;
    $rating_round = round($rating_out_of_five, 1, PHP_ROUND_HALF_DOWN);
    $num_ratings = sizeof($node->field_col_add_reference['und']);

    $html = get_fivestar_display($avg_rating, $messaging);
    $html .= "<span class='tutor-ad-rating-text'>";
    $html .= "<span class='tutor-ad-rating-value'> " . number_format($rating_round, 1) . "</span>";
    $html .= "<span class='tutor-ad-rating-num'> (" . $num_ratings . ")</span>";
    $html .= "</span>";

    return $html;
}

function get_tutor_ad_star_rating_email_display($node, $messaging=false){
    if ($node->op == "Preview"){
        $field_cols = array();
        foreach ($node->field_col_add_reference['und'] as $field_col_array){
            array_push($field_cols, (object)$field_col_array);
        }
    } else {
        $field_cols = array();
        foreach ($node->field_col_add_reference['und'] as $field_col_id){
            array_push($field_cols, entity_load_unchanged('field_collection_item', $field_col_id['value']));
        }
    }

    $total = 0;
    $count = 0;
    foreach ($field_cols as $field_col){
        $rating = floatval($field_col->field_reference_star_rating['und'][0]['rating']);
        $total += $rating;
        $count += 1;
    }

    $avg_rating = $total / $count;
    $rating_out_of_five = $avg_rating / 20;
    $rating_round = round($rating_out_of_five, 1, PHP_ROUND_HALF_DOWN);
    $num_ratings = sizeof($node->field_col_add_reference['und']);

    $html = get_fivestar_email_display($avg_rating, $messaging);
    $html .= "<span class='tutor-ad-rating-text'>";
    $html .= "<span class='tutor-ad-rating-value'> " . number_format($rating_round, 1) . "</span>";
    $html .= "<span class='tutor-ad-rating-num'> (" . $num_ratings . ")</span>";
    $html .= "</span>";

    return $html;
}

/********************************************************************
 * get_tutor_ad_average_rating                                      *
 ********************************************************************
 * Description: Return average rating for tutor ad references       *
 * Arguments:   $node                                               *
 * Return:      numeric                                             *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-23                                          *
 ********************************************************************/
function get_tutor_ad_average_rating($node){

    $field_cols = array();
    foreach ($node->field_col_add_reference['und'] as $field_col_id){
        array_push($field_cols, entity_load_unchanged('field_collection_item', $field_col_id['value']));
    }

    $total = 0;
    $count = 0;
    foreach ($field_cols as $field_col){
        $rating = floatval($field_col->field_reference_star_rating['und'][0]['rating']);
        $total += $rating;
        $count += 1;
    }

    $avg_rating = $total / $count;

    return $avg_rating;
}

/********************************************************************
 * get_tutor_ad_rating_count                                        *
 ********************************************************************
 * Description: Return number of ratings for tutor ad references    *
 * Arguments:   $node                                               *
 * Return:      numeric                                             *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        2019-02-23                                          *
 ********************************************************************/
function get_tutor_ad_rating_count($node){
    return sizeof($node->field_col_add_reference['und']);
}

/********************************************************************
 * get_tutor_ad_full_description                                    *
 ********************************************************************
 * Description: Return string value of tutor full desc (About me)   *
 * Arguments:   $node                                               *
 * Return:      string                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_full_description($node){
    $desc_text =$node->field_tutor_full_description['und'][0]['value'];
    $html = "<div id='tutor-ad-full-desc-visible'>";

    if (strlen($desc_text) > 299) {
        $html .= substr($desc_text, 0, 300) . "...";
    } else {
        $html .= $desc_text;
    }

    $html .= "</div>";

    if (strlen($desc_text) > 299){
        $html .= "<div id='tutor-ad-full-desc-show-more'>";
        $html .= $desc_text;
        $html .= "</div>";

        $html .= "<a class='tutor-ad-show-more-btn' id='tutor-ad-full-desc-show-more-btn' onclick='toggleTutorAdFullDescShowMore(this)'>Show more</a>";
    }

    return $html;
}

/********************************************************************
 * get_tutor_ad_teaser_description                                  *
 ********************************************************************
 * Description: Return first 370 chars of tutor description         *
 * Arguments:   $node                                               *
 * Return:      string                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_teaser_description($node){
    if ($node->op == "Preview"){
        $link = "<a>read more</a>";
    } else {
        $link = l('read more', 'node/'. $node->nid, array('query' => array('readmore' => TRUE)));
    }

    return substr($node->field_tutor_full_description['und'][0]['value'], 0, 370) . "... " . $link . ".";
}

function get_tutor_ad_profile_video($content){
    return render($content['field_enter_a_youtube_profile_vi']);
}

/********************************************************************
 * get_tutor_ad_about_sessions                                      *
 ********************************************************************
 * Description: Return string value of tutor about_sessions         *
 * Arguments:   $node                                               *
 * Return:      string                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_about_sessions($node){
    $desc_text = $node->field_tutor_about_sessions['und'][0]['value'];
    $html = "<div id='tutor-ad-about-sessions-visible'>";

    if (strlen($desc_text) > 299) {
        $html .= substr($desc_text, 0, 300) . "...";
    } else {
        $html .= $desc_text;
    }

    $html .= "</div>";

    if (strlen($desc_text) > 299) {
        $html .= "<div id='tutor-ad-about-sessions-show-more'>";
        $html .= $desc_text;
        $html .= "</div>";

        $html .= "<a class='tutor-ad-show-more-btn' onclick='toggleTutorAdAboutSessionsShowMore(this)'>Show more</a>";
    }

    return $html;

    $html .= "</div>";

    if (strlen($desc_text) > 299){
        $html .= "<div id='tutor-ad-full-desc-show-more'>";
        $html .= $desc_text;
        $html .= "</div>";

        $html .= "<a class='tutor-ad-show-more-btn' id='tutor-ad-full-desc-show-more-btn' onclick='toggleTutorAdFullDescShowMore(this)'>Show more</a>";
    }

    return $html;
}

/********************************************************************
 * get_tutor_ad_reference_count                                     *
 ********************************************************************
 * Description: Return number of references on given tutor ad (int) *
 * Arguments:   $node                                               *
 * Return:      integer                                             *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_reference_count($node){
    return sizeof($node->field_col_add_reference['und']);
}

function cmpreference($a, $b){
    $a_rating = (int)$a->field_reference_star_rating['und'][0]['rating'];
    $b_rating = (int)$b->field_reference_star_rating['und'][0]['rating'];
    if($a_rating == $b_rating){ return 0 ; }
    return ($a_rating > $b_rating) ? -1 : 1;
}
/********************************************************************
 * get_tutor_ad_references_display                                  *
 ********************************************************************
 * Description: Return rendered tutor ad references output          *
 * Arguments:   $node                                               *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_references_display($node){
    if ($node->op == "Preview"){
        $field_cols = array();
        foreach ($node->field_col_add_reference['und'] as $field_col_array){
            array_push($field_cols, (object)$field_col_array);
        }
    } else {
        $field_cols = array();
        foreach ($node->field_col_add_reference['und'] as $field_col_id){
            array_push($field_cols, entity_load_unchanged('field_collection_item', $field_col_id['value']));
        }
    }

    //Sort references by star rating descending
    usort($field_cols, 'cmpreference');

    $html = "<hr />";
    $html .= "<div id='tutor-ad-references-visible'>";

    $counter = 0;
    foreach ($field_cols as $field_col) {
        $rating = $field_col->field_reference_star_rating['und'][0]['rating'];
        $rating_out_of_five = $rating / 20;
        $rating_round = round($rating_out_of_five, 1, PHP_ROUND_HALF_DOWN);

        $first_name = $field_col->field_reference_first_name['und'][0]['value'];
        $last_name_init = $field_col->field_reference_last_name_init['und'][0]['value'];
        $reference_text = $field_col->field_reference_text['und'][0]['value'];

        $html .= get_fivestar_display($rating);
        $html .= "<span class='tutor-ad-rating-text'>";
        $html .= "<span class='tutor-ad-rating-value'> " . number_format($rating_round, 1) . "</span>";
        $html .= "</span>";
        $html .= "<p class='tutor-ad-review-by'>Review by " . $first_name . " " . $last_name_init . ".</p>";
        $html .= "<p class='tutor-ad-review'>" . $reference_text . "</p>";
        $html .= "<br />";

        //hide reviews after 3 until show more is clicked.
        if ($counter == 2){
            $html .= "</div>";
            $html .= "<div id='tutor-ad-references-show-more'>";
        }

        $counter++;
    }

    $html .= "</div>";

    if (sizeof($field_cols) > 3){
        $html .= "<a class='ref-show-more' onclick='toggleTutorAdReferencesShowMore(this)'>Show more</a>";
    }

    return $html;
}

/********************************************************************
 * get_tutor_ad_references_edit                                     *
 ********************************************************************
 * Description: Return rendered tutor ad references form field      *
 * Arguments:   &$form                                              *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_references_edit(&$form){
    return render($form['field_col_add_reference']);
}

/********************************************************************
 * get_tutor_ad_subjects_offered                                    *
 ********************************************************************
 * Description: Return rendered tutor ad subjects offered output    *
 * Arguments:   $node                                               *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_subjects_offered($node){
    $html = "<table id=\"tutor-ad-subjects-offered-table\" class=\"table\">";
    $html .= "";
    $html .= "<thead>
                <tr>
                    <th>Subject</th>
                    <th>Qualification</th>
                    <th>Prices</th>
                </tr>
              </thead>
              <tbody>";


    if ($node->op == "Preview"){
        $field_cols = array();
        foreach ($node->field_col_subject_level_pricing['und'] as $field_col_array){
            array_push($field_cols, (object)$field_col_array);
        }
    } else {
        $field_cols = array();
        foreach ($node->field_col_subject_level_pricing['und'] as $field_col_id){
            array_push($field_cols, entity_load_unchanged('field_collection_item', $field_col_id['value']));
        }
    }

    foreach ($field_cols as $field_col){
        $subject_tid = $field_col->field_offered_subject['und'][0]['tid'];
        $level_tid = $field_col->field_offered_level['und'][0]['tid'];
        $price_tid = $field_col->field_subject_level_price['und'][0]['value'];

        $subject_name = taxonomy_term_load($subject_tid)->name;
        $level_name = taxonomy_term_load($level_tid)->name;
        $price_name = taxonomy_term_load($price_tid)->name;

        $html .= "<tr>";
        $html .= "<td>" . $subject_name . "</td>";
        $html .= "<td>" . $level_name . "</td>";
        $html .= "<td>£" . $price_name . " /hr</td>";
        $html .= "</tr>";
    }


    $html .= "</tbody></table>";

    return $html;
}

/********************************************************************
 * get_tutor_ad_subjects_offered_edit                               *
 ********************************************************************
 * Description: Return rendered tutor ad subjects offered formfield *
 * Arguments:   &$form                                              *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_subjects_offered_edit(&$form){
    return render($form['field_col_subject_level_pricing']);
}

/********************************************************************
 * get_tutor_ad_teaser_subjects_offered                             *
 ********************************************************************
 * Description: Return rendered tutor ad subjects offered output    *
                for node teasers                                    *
 * Arguments:   $node                                               *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_teaser_subjects_offered($node){
    $search_type = arg()[0];

    $output_subject_name = "";
    $output_level_name = "";

    if ($node->op == "Preview"){
        $field_cols = array();
        foreach ($node->field_col_subject_level_pricing['und'] as $field_col_array){
            array_push($field_cols, (object)$field_col_array);
        }
    } else {
        $field_cols = array();
        foreach ($node->field_col_subject_level_pricing['und'] as $field_col_id){
            array_push($field_cols, entity_load_unchanged('field_collection_item', $field_col_id['value']));
        }
    }

    foreach ($field_cols as $field_col){
        $subject_level_tid = $field_col->field_offered_level['und'][0]['tid'];
        $subject_level_term = taxonomy_term_load($subject_level_tid);

        if ($subject_level_term->term_type['und'][0]['value'] == "Level"){
            $level_name = $subject_level_term->name;
            $parents = taxonomy_get_parents($subject_level_tid);
            $subject_level_term = array_pop($parents);
            $subject_name = $subject_level_term->name;
        } else {
            $subject_name = $subject_level_term->name;
        }

        if ($search_type == "subject") {
            if (strtolower($subject_name) == strtolower(arg()[1])){
                $output_subject_name = arg()[1];
                if (strlen($output_level_name) > 0){
                    $output_level_name .= ", " . $level_name;
                } else {
                    $output_level_name = $level_name;
                }
            }
        } else if ($search_type == "level-subject") {
            if (strtolower($subject_name) == strtolower(arg()[2])){
                $output_subject_name = arg()[2];
                if (strlen($output_level_name) > 0){
                    $output_level_name .= ", " . $level_name;
                } else {
                    $output_level_name = $level_name;
                }
            }
        } else {
            if (!strlen($output_level_name) > 0){
                $output_subject_name = $subject_name;
            }

            if ($subject_name == $output_subject_name){
                if (strlen($output_level_name) > 0){
                    $output_level_name .= ", " . $level_name;
                } else {
                    $output_level_name = $level_name;
                }
            }

        }

    }

    $ret = "";
    if ($output_subject_name) {
        $ret = $output_subject_name;
    }
    if ($output_level_name) {
        $ret .= " (" . $output_level_name . ")";
    }

    return $ret;
}

/********************************************************************
 * get_tutor_ad_lowest_price                                        *
 ********************************************************************
 * Description: Return unformatted tutor ad lowest price            *
 * Arguments:   $node                                               *
 * Return:      integer                                             *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_lowest_price($node){
    $lowest = PHP_INT_MAX;

    if ($node->op == "Preview"){
        $field_cols = array();
        foreach ($node->field_col_subject_level_pricing['und'] as $field_col_array){
            array_push($field_cols, (object)$field_col_array);
        }
    } else {
        $field_cols = array();
        foreach ($node->field_col_subject_level_pricing['und'] as $field_col_id){
            array_push($field_cols, entity_load_unchanged('field_collection_item', $field_col_id['value']));
        }
    }

    foreach ($field_cols as $field_col){
        $price_tid = $field_col->field_subject_level_price['und'][0]['value'];
        $price = taxonomy_term_load($price_tid)->name;
        if ($price < $lowest){
            $lowest = $price;
        }
    }

    return $lowest;
}

/********************************************************************
 * get_tutor_ad_highest_price                                       *
 ********************************************************************
 * Description: Return unformatted tutor ad highest price           *
 * Arguments:   $node                                               *
 * Return:      integer                                             *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_highest_price($node){
    $highest = 0;

    if ($node->op == "Preview"){
        $field_cols = array();
        foreach ($node->field_col_subject_level_pricing['und'] as $field_col_array){
            array_push($field_cols, (object)$field_col_array);
        }
    } else {
        $field_cols = array();
        foreach ($node->field_col_subject_level_pricing['und'] as $field_col_id){
            array_push($field_cols, entity_load_unchanged('field_collection_item', $field_col_id['value']));
        }
    }

    foreach ($field_cols as $field_col){
        $price_tid = $field_col->field_subject_level_price['und'][0]['value'];
        $price = taxonomy_term_load($price_tid)->name;
        if ($price > $highest){
            $highest = $price;
        }
    }

    return $highest;
}

/********************************************************************
 * get_tutor_ad_teaser_price_display                                *
 ********************************************************************
 * Description: Return rendered tutor ad price range. Format:       *
 *              Lowest - Highest                                    *
 * Arguments:   $node                                               *
 * Return:      string                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_teaser_price_display($node){
    $lowest = get_tutor_ad_lowest_price($node);
    $highest = get_tutor_ad_highest_price($node);

    if ($lowest == $highest) {
        return $lowest;
    } else {
        return $lowest . "-" . $highest;
    }
}

/********************************************************************
 * get_tutor_ad_qualifications                                      *
 ********************************************************************
 * Description: Return rendered tutor ad qualifications output      *
 * Arguments:   $node                                               *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_qualifications($node){
    $html = "<table id=\"tutor-ad-subjects-offered-table\" class=\"table\">";
    $html .= "";
    $html .= "<thead>
                <tr>
                    <th>Subject</th>
                    <th>Qualification</th>
                    <th>Grade</th>
                </tr>
              </thead>
              <tbody>";


    if ($node->op == "Preview"){
        $field_cols = array();
        foreach ($node->field_col_add_an_a_level_grade['und'] as $field_col_array){
            array_push($field_cols, (object)$field_col_array);
        }
    } else {
        $field_cols = array();
        foreach ($node->field_col_add_an_a_level_grade['und'] as $field_col_id){
            array_push($field_cols, entity_load_unchanged('field_collection_item', $field_col_id['value']));
        }
    }

    foreach ($field_cols as $field_col){
        $subject_name = taxonomy_term_load($field_col->field_alevel_subject['und'][0]['tid'])->name;
        $level_name = "A-Level";
        $grade = taxonomy_term_load($field_col->field_alevel_grade['und'][0]['tid'])->name;

        $html .= "<tr>";
        $html .= "<td>" . $subject_name . "</td>";
        $html .= "<td>" . $level_name . "</td>";
        $html .= "<td>" . $grade . "</td>";
        $html .= "</tr>";
    }


    $html .= "</tbody></table>";
    return $html;
}

/********************************************************************
 * get_tutor_ad_qualifications_edit                                 *
 ********************************************************************
 * Description: Return rendered tutor ad qualifications form field  *
 * Arguments:   &$form                                              *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_qualifications_edit(&$form){
    $html = "<div class='row'>";
    $html .= "<div class='col-md-6' style='display:inline-block; width:50%; padding-left:20px'>";
    $html .= "<span class='tutor-ad-edit-label'> University</span>";
    $html .= "</div>";
    $html .= "<div class='col-md-6' style='padding-left:10px; display:inline-block; width:50%;'>";
    $html .= "<span class='tutor-ad-edit-label'> Degree</span>";
    $html .= "</div>";
    $html .= "</div>";
    $html .= render($form['field_col_add_degree']);

    $html .= drupal_render(_block_get_renderable_array(_block_render_blocks(array(block_load('gj_deanhopkins_tutor_ad', 'txt_alevels')))));
    $html .= "<br />";


    $html .= "<div class='row'>";
    $html .= "<div class='col-md-6' style='display:inline-block; width:50%; padding-left:20px'>";
    $html .= "<span class='tutor-ad-edit-label'> A Level subject</span>";
    $html .= "</div>";
    $html .= "<div class='col-md-6' style='padding-left:10px; display:inline-block; width:50%;'>";
    $html .= "<span class='tutor-ad-edit-label'>Grade</span>";
    $html .= "</div>";
    $html .= "</div>";
    $html .= render($form['field_col_add_an_a_level_grade']);

    return $html;
}

/********************************************************************
 * get_tutor_ad_availability_text                                   *
 ********************************************************************
 * Description: Return unformatted tutor ad availability string     *
 * Arguments:   $node                                               *
 * Return:      string                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_availability_text($node){
    return $node->field_my_availability_for_tutori['und'][0]['value'];
}

/********************************************************************
 * get_tutor_ad_availability_hidden_field                           *
 ********************************************************************
 * Description: Return rendered HTML hidden field for availability  *
 *              Controlled by the custom availability table.        *
 * Arguments:   $node                                               *
 * Return:      rendered HTML string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_availability_hidden_field($node){
    $field_val = $node->field_my_availability_for_tutori['und'][0]['value'];
    $html = "<div style=\"display:none;\">
                <div class=\"field-type-text field-name-field-my-availability-for-tutori field-widget-text-textfield form-wrapper\" id=\"edit-field-my-availability-for-tutori\">
                    <input type='text' value='" . $field_val . "'>its this</input>
                        </div>
                        </div>";
    return $html;
}

/********************************************************************
 * get_tutor_ad_picture_uri                                         *
 ********************************************************************
 * Description: Return unformatted tutor ad image URI               *
 * Arguments:   $node                                               *
 * Return:      string                                              *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_picture_uri($node){
    return $node->field_tutor_upload_profile_image['und'][0]['uri'];
}

/********************************************************************
 * get_fivestar_display                                             *
 ********************************************************************
 * Description: Return rendered tutor ad five star rating element   *
 * Arguments:   $rating, $messaging                                 *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_fivestar_display($rating, $messaging=false, $header=false){
    $rating_out_of_five = $rating / 20;
    $rating_round = round($rating_out_of_five, 1, PHP_ROUND_HALF_DOWN);
    $fraction = $rating_round - floor($rating_round);
    $percent = round((float)$fraction * 100 ) . '%';

    $html = '<div class="fivestar-fontawesome-star">';
    $html .= '<div class="fivestar-widget-static fivestar-widget-static-vote fivestar-widget-static-5 clearfix">';

    $count = 1;
    $fraction_outputted = FALSE;
    while ($count <= 5){
        $first = ($count == 1 ? "star-first" : "");
        $last = ($count == floor($rating_round) && !($fraction > 0) ? "star-last" : "");
        $even_odd = ($count % 2 == 0 ? "star-even" : "star-odd");

        if ($count < floor($rating_round)){
            $html .= '<div class="star star-' . $count . ' ' . $even_odd . ' ' . $first . $last . '"><span class="on"></span></div>';
        } else {
            if ($count == floor($rating_round)) {
                $html .= '<div class="star star-' . $count . ' ' . $even_odd . ' ' . $first . $last . '"><span class="on"></span></div>';
                if ($fraction > 0) {
                    $count++;
                    $html .= '<div class="star star-' . $count . ' ' . ($count % 2 == 0 ? "star-even" : "star-odd") . ' star-last"><span class="on" style="width:' . $percent . '"></span></div>';
                }
            } else if ($count <= 5 && !$header){
                $html .= '<div class="star star-' . $count . ' ' . $even_odd . ' ' . $first . $last . '"><span class="on" style="width:0px"></span></div>';
            }
        }
        $count++;
    }

    $html .= '</div>';
    $html .= '</div>';

    return $html;

}

function get_fivestar_email_display($rating, $messaging=false, $header=false){
    $star_style = "background-image: none;
                    display: inline-block;
                    font: normal normal normal 16px/1 FontAwesome;
                    text-rendering: auto;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-indent: 0;
                    position: relative;
                    margin-right: 3px;
                    ";

    $star_full = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p10.svg") . '">';
    $star_empty = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p0.svg") . '">';
    $star_p1 = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p1.svg") . '">';
    $star_p2 = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p2.svg") . '">';
    $star_p3 = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p3.svg") . '">';
    $star_p4 = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p4.svg") . '">';
    $star_p5 = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p5.svg") . '">';
    $star_p6 = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p6.svg") . '">';
    $star_p7 = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p7.svg") . '">';
    $star_p8 = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p8.svg") . '">';
    $star_p9 = '<img style="width: 24px; height: 24px; position: relative; top: 5px;" src="' . file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/star_p9.svg") . '">';

    $rating_out_of_five = $rating / 20;
    $rating_round = round($rating_out_of_five, 1, PHP_ROUND_HALF_DOWN);
    $fraction = $rating_round - floor($rating_round);
    $percent = round((float)$fraction * 100 );

    if ($percent < 10){
        $star_percent = $star_empty;
    }
    if ($percent >= 10 && $percent < 20){
        $star_percent = $star_p1;
    }
    if ($percent >= 20 && $percent < 30){
        $star_percent = $star_p2;
    }
    if ($percent >= 30 && $percent < 40){
        $star_percent = $star_p3;
    }
    if ($percent >= 40 && $percent < 50){
        $star_percent = $star_p4;
    }
    if ($percent >= 50 && $percent < 60){
        $star_percent = $star_p5;
    }
    if ($percent >= 60 && $percent < 70){
        $star_percent = $star_p6;
    }
    if ($percent >= 70 && $percent < 80){
        $star_percent = $star_p7;
    }
    if ($percent >= 80 && $percent < 90){
        $star_percent = $star_p8;
    }
    if ($percent >= 90 && $percent < 100){
        $star_percent = $star_p9;
    }
    if ($percent >= 100){
        $star_percent = $star_p1;
    }

    $html = '<div style="display: inline-block;">';
    $html .= '<div>';

    $count = 1;
    $fraction_outputted = FALSE;
    while ($count <= 5){
        $first = ($count == 1 ? "star-first" : "");
        $last = ($count == floor($rating_round) && !($fraction > 0) ? "star-last" : "");
        $even_odd = ($count % 2 == 0 ? "star-even" : "star-odd");

        if ($count < floor($rating_round)){
            $html .= '<div style="' . $star_style . '" class="star-' . $count . ' ' . $even_odd . ' ' . $first . $last . '">' . $star_full . '</div>';
        } else {
            if ($count == floor($rating_round)) {
                $html .= '<div style="' . $star_style . '" class="star-' . $count . ' ' . $even_odd . ' ' . $first . $last . '">' . $star_full . '</div>';
                if ($fraction > 0) {
                    $count++;
                    $html .= '<div style="' . $star_style . '" class="star-' . $count . ' ' . ($count % 2 == 0 ? "star-even" : "star-odd") . ' star-last">' . $star_percent . '</div>';
                }
            } else if ($count <= 5 && !$header){
                $html .= '<div style="' . $star_style . '" class="star-' . $count . ' ' . $even_odd . ' ' . $first . $last . '">' . $star_empty . '</div>';
            }
        }
        $count++;
    }

    $html .= '</div>';
    $html .= '</div>';

    return $html;

}

/********************************************************************
 * get_tutor_ad_personally_interviewed_div                          *
 ********************************************************************
 * Description: Return rendered "Personally Intereviewed" html      *
 * Arguments:   $title, $text                                       *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_personally_interviewed_div($title, $text){
    $html = "<div class='tutor-ad-personally-interviewed-container'>
                <div class='col-md-2 tutor-ad-personally-interviewed-image'>
                    <p><img src='" . file_create_url(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . "/img/vector-person-interview.svg") . "' /></p>
                </div>
                <div class='col-md-10 tutor-ad-personally-interviewed-content'>
                    <span>
                        <span class='tutor-ad-personally-interviewed-header'>$title</span>
                        <p>$text</p>
                    </span>
                </div>
             </div>";

    return $html;
}

/********************************************************************
 * get_tutor_ad_dbs_check_div                                       *
 ********************************************************************
 * Description: Return rendered "DBS Check"               html      *
 * Arguments:   $date                                               *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_dbs_check_div($node){
    $dbs_type = $node->field_tutor_dbs_certificate['und'][0]['value'];
    if ($dbs_type == "No"){
        $html = "";
    } else {
        $label = "";
        if ($dbs_type == "Basic"){
            $label = "Basic DBS Check";
        } else if ($dbs_type == "Enhanced"){
            $label = "Enhanced DBS Check";
        }
        $html = " <div class='tutor-ad-dbs-check-container'>
                            <img src='" . file_create_url(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . "/img/dbs_check.svg") . "' />
                            <b>" . $label . "</b>
                    </div>";

    }
    return $html;
}

/********************************************************************
 * get_tutor_ad_submit_tos_div                                      *
 ********************************************************************
 * Description: Return rendered "Submit TOS" container HTML         *
 * Arguments:   &$form, $edit_mode                                  *
 * Return:      rendered html string                                *
 ********************************************************************
 * Author:      Dean Hopkins                                        *
 * Date:        08-01-2019                                          *
 ********************************************************************/
function get_tutor_ad_submit_tos_div(&$form, $edit_mode){
    $html = "";

    if ($edit_mode){
        $html = "<div class='row'>
                    <div class='tutor-ad-tos-button'>";

        $html .=    render($form['actions']['submit']);
        $html .=    render($form['actions']['preview']);

        $html .= "        </div>
                </div>";
    } else {
        $html = "<div class='col-md-8 col-md-offset-2 tutor-ad-tos-container'>
                <div class='row'>
                    <div class='col-md-12 tutor-ad-tos-header'>
                        <p>Submit your application</p>
                    </div>
                </div>
                <div class='row tutor-ad-tos-content'>
                    <div class='col-xs-1 col-sm-1' style='padding-left:15px !important;'>";

        $html .= render($form['field_tutor_accept_tos']);
        $html .= "          </div>
                    <div class='col-xs-9 col-sm-11'>
                    " . drupal_render(_block_get_renderable_array(_block_render_blocks(array(block_load('gj_deanhopkins_tutor_ad', 'txt_accepttos'))))) . "
                       </div>
                </div>
                <br />";


        /*@todo preview text if you want to revert*/
        /*$html .= "<div class='row tutor-ad-tos-content'>
                    <div class='col-xs-12'>
                        " . drupal_render(_block_get_renderable_array(_block_render_blocks(array(block_load('gj_deanhopkins_tutor_ad', 'txt_preview_before_submit'))))) . "
                    </div>
                  </div>";*/


        $html .= "<div class=''>
                    <div class='tutor-ad-tos-button'>";

        $html .=    render($form['actions']['preview']);
        $html .=    render($form['actions']['submit']);

        $html .= "        </div>
                </div>
                </div>";
    }

    return $html;
}

/*******************************************************************
 * get_tutor_ad_time_table_data                                             *
 *******************************************************************
 * Description: Generate data structure for availability timetable *
 * Arguments:                                                      *
 * Return:      array(weekdays, time_periods)                      *
 *******************************************************************
 * Author:      Dean Hopkins                                       *
 * Date:        10-12-2018                                         *
 *******************************************************************/
function get_tutor_ad_time_table_data() {
    $week_days = array(
        'mon' => t('Monday'),
        'tue' => t('Tuesday'),
        'wed' => t('Wednesday'),
        'thu' => t('Thursday'),
        'fri' => t('Friday'),
        'sat' => t('Saturday'),
        'sun' => t('Sunday'),
    );

    $morning_img = "<span><img src='" . file_create_url(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . "/img/morning.svg") . "'' /></span>";
    $afternoon_img = "<span><img src='" . file_create_url(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . "/img/afternoon.svg") . "'' /></span>";
    $evening_img = "<span><img src='" . file_create_url(drupal_get_path('module', 'gj_deanhopkins_tutor_ad') . "/img/evening.svg") . "'' /></span>";

    $time_periods = array(
        'morning' => t($morning_img . "<br><span class='tutor-ad-availability-table-header'>Before 12pm</span>"),
        'afternoon' => t($afternoon_img . "<br><span class='tutor-ad-availability-table-header'>12pm - 5pm</span>"),
        'evening' => t($evening_img . "<br><span class='tutor-ad-availability-table-header'>After 5pm</span>"),
    );

    return array('week_days' => $week_days, 'time_periods' => $time_periods);
}

/*******************************************************************
 * create_availability_table                                       *
 *******************************************************************
 * Description: Generate availability timetable html               *
 * Arguments:   $existing_data (db value), $edit (editmode)        *
 * Return:      $timetable_output (html)                           *
 *******************************************************************
 * Author:      Dean Hopkins                                       *
 * Date:        10-12-2018                                         *
 *******************************************************************/
function create_availability_table($existing_data = '', $edit = false) {
    $timetable_output = "";
    $time_table_grid = get_tutor_ad_time_table_data();
    $cols = $time_table_grid['time_periods'];
    $rows = $time_table_grid['week_days'];


    $timetable_output = "<table class='timetable_wrapper table'>";
    $timetable_output .= '<thead>';
    $timetable_output .= '<tr>';
    $timetable_output .= '<th class="tutor_ad_availability_table_header_row"></th>';

    foreach ($cols as $k_col => $v_col) {
        $timetable_output .= '<th class = "tsqcavail_th tutor_ad_availability_table_header_row">' . $v_col . '</th>';
    }

    $timetable_output .= '</tr>';
    $timetable_output .= '</thead>';
    $timetable_output .= '<tbody>';

    foreach ($rows as $k_row => $v_row) {
        $timetable_output .= '<tr>';
        $timetable_output .= '<td class="tutor-ad-availability-table-header tutor-ad-availability-table-days">' . ucwords($v_row) . '</td>';
        foreach ($cols as $k_col => $v_col)
        {
            $checked = '';
            if($existing_data){
                $selected_values = explode(',',$existing_data);
                $str_val = $k_col . '_' . $k_row;
                if(in_array($str_val,(array)$selected_values)) {
                    $checked = 'checked=checked';
                }
                if (!$edit){
                    $checked .= ' disabled=disabled';
                }
            }
            $timetable_output .= '<td class="tutor-ad-availability-td"">
								  <div class="input-check">
									<input type="checkbox" id="create_batch_' . $k_col . '_' . $k_row . '" name="create_batch" '.$checked.'>
									<label for="create_batch_' . $k_col . '_' . $k_row . '"></label>
								  </div>
								</td>';
        }
        $timetable_output .= '</tr>';
    }

    $timetable_output .= '</tbody>';
    $timetable_output .= '</table>';

    //$timetable_output .= 'Selected Values: <div id="selection"></div>';

    return $timetable_output;
}
