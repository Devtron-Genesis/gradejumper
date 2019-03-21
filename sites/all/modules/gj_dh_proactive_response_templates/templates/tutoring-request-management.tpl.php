<h3><b>Parent Search Request Management</b></h3>

<div class="gj_dh_mgmt_request_container">
    <span><b>Name: </b><?php print _get_search_request_display_name($search_request) . " " . _get_search_request_display_user_role($search_request) ?></span> <br />
    <span><b>Subject & Level: </b><?php print _get_search_request_display_subject_level($search_request); ?></span> <br />
    <span><b>Email: </b><?php print _get_search_request_display_email($search_request); ?></span> <br />
    <span><b>Telephone Number: </b><?php print _get_search_request_display_phone($search_request); ?></span> <br />
    <span><b>Request Created: </b><?php print _get_search_request_display_time_created($search_request); ?></span> <br />
</div>

<br />
<h4><b>Responses:</b></h4>

<table style="width:100%;">
    <thead style="border-bottom: 1px solid;">
        <th style="width:60%;"> Name</th>
        <th style="width:10%;"> Approved</th>
        <th style="width:30%;"> Dates</th>
    </thead>
    <tbody>
        <?php foreach($tutor_responses as $tutor_response): ?>
            <tr style="border-bottom: 2px solid; padding-bottom: 5px;" <?php if (_get_tutor_response_date_parent_responded_display($tutor_response)){ print "class='gj-pr-gray'"; } ?>>
                <td style="width:60%; border-right: 1px solid; padding-top:10px;"><?php print _get_tutor_response_management_display($tutor_response); ?></td>
                <td style="width:10%; border-right: 1px solid; text-align: center; vertical-align: top; padding-top: 10px;">
                    <?php if(!_is_tutor_response_approved_and_sent($tutor_response)): ?>
                        <?php print drupal_render($tutor_response->check_form); ?>
                    <?php else: ?>
                        <div class="gj_dh_approved_sent">SENT</div>
                    <?php endif; ?>
                </td>
                <td style="width:30%; vertical-align: top; padding: 10px;">
                    <p><b>Created:</b> <?php print _get_search_request_display_time_created($tutor_response); ?></p>
                    <?php if(_get_tutor_response_date_advert_sent_display($tutor_response)): ?>
                        <p><b>Sent:</b> <?php print _get_tutor_response_date_advert_sent_display($tutor_response); ?></p>
                    <?php endif; ?>
                    <?php if(_get_tutor_response_date_parent_responded_display($tutor_response)): ?>
                        <p><b>Replied:</b> <?php print _get_tutor_response_date_parent_responded_display($tutor_response); ?></p>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<br />
<h4><b>Action:</b></h4>
<a href="<?php print url('/management/tutoring_request_management/send_unsent_emails/') . base64_encode($search_request->nid);?>" class="btn btn-success btn-md">Send unsent emails</a>
<br />

