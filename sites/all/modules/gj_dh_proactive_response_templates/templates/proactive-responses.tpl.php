<div class="gj-pr-header">Proactive Responses</div>

<?php foreach($search_requests as $search_request): ?>
    <div class="gj-pr-tutor-request-container">
        <div class="gj-pr-tutor-request-header">
            <div class="gj-pr-tutor-request-title">
                Tutor Request <?php print $search_request->nid; ?>
            </div>
            <div class="gj-pr-tutor-request-counter-container">
                <div class="gj-pr-tutor-request-counter">
                    <?php
                        $count = _search_request_num_responses_display($search_request->nid);
                        $output = $count . " response";
                        if ($count > 1 || $count == 0){ $output .= "s"; }
                        print $output;
                    ?>
                </div>
            </div>
        </div>


        <div class="gj-pr-tutor-request-body">
            <div class="gj-pr-tutor-request-details-container">
                <div class="gj-pr-tutor-request-detail">
                    <div class="gj-pr-tutor-request-label">Name:</div>
                    <div class="gj-pr-tutor-request-value"><?php print _get_search_request_display_name($search_request); ?> </div>
                </div>
                <div class="gj-pr-tutor-request-detail">
                    <div class="gj-pr-tutor-request-label">Subject:</div>
                    <div class="gj-pr-tutor-request-value"><?php print _get_subject_level_term_display_name(taxonomy_term_load($search_request->field_search_request_tid['und'][0]['value'])); ?> </div>
                </div>
                <div class="gj-pr-tutor-request-detail">
                    <div class="gj-pr-tutor-request-label">Posted:</div>
                    <div class="gj-pr-tutor-request-value"><?php print date("d/m/Y H:i", $search_request->created); ?></div>
                </div>
            </div>

            <div class="gj-pr-tutor-request-info-container">
                <div class="gj-pr-tutor-request-apply-now">
                    <a href="/proactive_response/<?php print base64_encode($search_request->nid) . "/" . base64_encode($search_request->created); ?>" class="btn btn-primary btn-md gj-pr-tutor-request-apply-now-button">View Responses</a>
                </div>
            </div>
        </div>
    </div>
<?php endforeach; ?>

<?php if (sizeof($search_requests) < 1): ?>
    <div class="gj-pr-noresults">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ultricies suscipit elit, quis interdum sapien bibendum a. Donec nisl massa, venenatis eu ante vel, pharetra aliquet turpis. Phasellus eget tellus a mi venenatis feugiat a at augue. Cras pharetra condimentum ligula, ut volutpat massa condimentum sed. Quisque tristique diam molestie enim maximus lobortis. Aenean euismod diam et massa tristique faucibus. Fusce neque mauris, blandit quis diam vitae, porttitor finibus sapien. In dignissim convallis nulla. </p>
        <br />
        <p>In consectetur nunc mauris, non tempor risus facilisis et. Maecenas venenatis elit sit amet orci efficitur, finibus commodo risus placerat. Etiam euismod ante id justo lacinia tempus. Vestibulum efficitur, justo at vulputate lacinia, erat leo fringilla elit, quis maximus orci risus non nisl. Nam dui est, lacinia vel aliquet ut, interdum at arcu. Ut tristique mi a venenatis ornare. Nullam viverra ullamcorper orci, eget suscipit augue porttitor euismod. Nullam efficitur pretium rhoncus. Vestibulum quis risus ut augue finibus commodo vel eget nibh. Quisque justo leo, viverra quis orci a, eleifend facilisis purus. Sed porttitor mollis turpis, in egestas nulla convallis sed. </p>
    </div>
<?php endif; ?>

<div class="gj-pr-trust-container">
    <div class="gj-pr-trust-pilot">
        <img src="<?php print file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/trustpilot.svg"); ?>">
    </div>
    <div class="gj-pr-trust-seperator">
        <img src="<?php print file_create_url(drupal_get_path('module', 'gj_dh_proactive_response_templates') . "/img/seperator.svg"); ?>">
    </div>
    <div class="gj-pr-trust-excelent">
        "Excellent"
    </div>
</div>
