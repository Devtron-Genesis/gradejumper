<h3><b>Parent Search Request Management Overview</b></h3>

<table class="table table-bordered">
    <thead>
        <th>ID</th>
        <th>Title</th>
        <th>Date Created</th>
        <th># of Responses</th>
        <th>Response Mail Sent</th>
    </thead>
    <tbody>
    <?php foreach($search_requests as $search_request): ?>
            <tr>
                <td><a href="<?php print url('/management/tutoring_request_management/') . base64_encode($search_request->nid);?>"><?php print $search_request->nid; ?></a></td>
                <td><a href="<?php print url('/management/tutoring_request_management/') . base64_encode($search_request->nid);?>"><?php print $search_request->title; ?></a></td>
                <td><?php print date("d/m/Y H:i", $search_request->created); ?></td>
                <td><?php print sizeof(_get_search_request_responses_sent($search_request->nid)); ?></td>
                <td><?php print _search_request_parent_mail_already_sent($search_request) ? "Yes" : "No"; ?></td>
            </tr>
    <?php endforeach; ?>
    </tbody>
</table>