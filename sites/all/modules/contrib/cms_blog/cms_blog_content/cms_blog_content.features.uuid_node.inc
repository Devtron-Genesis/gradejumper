<?php
/**
 * @file
 * cms_blog_content.features.uuid_node.inc
 */

/**
 * Implements hook_uuid_features_default_content().
 */
function cms_blog_content_uuid_features_default_content() {
  $nodes = array();

  $nodes[] = array(
  'title' => 'The Evolution of Drupal Themes',
  'log' => '',
  'status' => 1,
  'comment' => 2,
  'promote' => 0,
  'sticky' => 0,
  'type' => 'blog',
  'language' => 'und',
  'created' => 1454962668,
  'tnid' => 0,
  'translate' => 0,
  'uuid' => '35d04adb-1b41-4970-8be0-19269b1d6618',
  'body' => array(
    'und' => array(
      0 => array(
        'value' => '<p>When she <em>reached</em> the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane.</p>

<p>Pityful a rethoric question ran over her cheek, then she continued her way. On her way she met a <strong>copy</strong>.</p>

<p>The copy warned the Little Blind Text, that where it came from it would have been rewritten a thousand times and everything that was left from its origin would be the word "and" and the Little Blind Text should turn around and return to its own, safe country.</p>

<p>But nothing the copy said could convince her and so it didn’t take long until a few insidious Copy Writers ambushed her, made her drunk with Longe and Parole and dragged her into their agency, where they abused her for their projects again and again.</p>

<p>And if she hasn’t been rewritten, then they are still using her.</p>

<p>Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.</p>

<p>Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.</p>
',
        'summary' => '',
        'format' => 'wysiwyg_full',
        'safe_summary' => '',
      ),
    ),
  ),
  'field_blog_category' => array(
    'und' => array(
      0 => array(
        'tid' => '60e20db5-3340-40b2-87e0-ac2b560b1355',
        'uuid' => '60e20db5-3340-40b2-87e0-ac2b560b1355',
      ),
    ),
  ),
  'field_blog_image' => array(
    'und' => array(
      0 => array(
        'file_uuid' => 'ffc16977-1c5c-43fb-aeb0-304385a94a5c',
        'alt' => NULL,
        'title' => NULL,
      ),
    ),
  ),
  'field_blog_tags' => array(
    'und' => array(
      0 => array(
        'tid' => 'e32de019-e4d5-46b6-a10d-786c6cc70756',
        'uuid' => 'e32de019-e4d5-46b6-a10d-786c6cc70756',
      ),
      1 => array(
        'tid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
        'uuid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
      ),
      2 => array(
        'tid' => 'f870ff3e-acef-4e3e-8958-1e10ef0565ed',
        'uuid' => 'f870ff3e-acef-4e3e-8958-1e10ef0565ed',
      ),
    ),
  ),
  'field_page_attachments' => array(),
  'field_glazed_content_design' => array(),
  'rdf_mapping' => array(
    'rdftype' => array(
      0 => 'sioc:Item',
      1 => 'foaf:Document',
    ),
    'title' => array(
      'predicates' => array(
        0 => 'dc:title',
      ),
    ),
    'created' => array(
      'predicates' => array(
        0 => 'dc:date',
        1 => 'dc:created',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'changed' => array(
      'predicates' => array(
        0 => 'dc:modified',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'body' => array(
      'predicates' => array(
        0 => 'content:encoded',
      ),
    ),
    'uid' => array(
      'predicates' => array(
        0 => 'sioc:has_creator',
      ),
      'type' => 'rel',
    ),
    'name' => array(
      'predicates' => array(
        0 => 'foaf:name',
      ),
    ),
    'comment_count' => array(
      'predicates' => array(
        0 => 'sioc:num_replies',
      ),
      'datatype' => 'xsd:integer',
    ),
    'last_activity' => array(
      'predicates' => array(
        0 => 'sioc:last_activity_date',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
  ),
  'path' => array(
    'pathauto' => 1,
  ),
  'comment_count' => 0,
  'pathauto_perform_alias' => FALSE,
  'date' => '2016-02-08 20:17:48 +0000',
  'user_uuid' => 'f3a5fbb6-f1ba-4c51-956c-a81a485017f7',
);
  $nodes[] = array(
  'title' => '6 bits of Drupal programming advice that will land you in prison',
  'log' => '',
  'status' => 1,
  'comment' => 2,
  'promote' => 1,
  'sticky' => 0,
  'type' => 'blog',
  'language' => 'und',
  'created' => 1454962922,
  'tnid' => 0,
  'translate' => 0,
  'uuid' => '6d6675ff-9e0d-454d-ab16-9caec36d2682',
  'body' => array(
    'und' => array(
      0 => array(
        'value' => '<p>Copy Writers ambushed her, made her drunk with Longe and Parole and dragged her into their agency, where they abused her for their projects again and again.</p>

<p>And if she hasn’t been rewritten, then they are still using her. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.</p>

<p>Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>

<p>It is a paradisematic country, in which roasted parts of sentences fly into your mouth.</p>

<p>Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.</p>
',
        'summary' => '',
        'format' => 'wysiwyg_simple',
        'safe_summary' => '',
      ),
    ),
  ),
  'field_blog_category' => array(
    'und' => array(
      0 => array(
        'tid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
        'uuid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
      ),
    ),
  ),
  'field_blog_image' => array(
    'und' => array(
      0 => array(
        'file_uuid' => '06a2cb45-1224-4567-bb58-a29b68912338',
        'alt' => NULL,
        'title' => NULL,
      ),
    ),
  ),
  'field_blog_tags' => array(
    'und' => array(
      0 => array(
        'tid' => 'f870ff3e-acef-4e3e-8958-1e10ef0565ed',
        'uuid' => 'f870ff3e-acef-4e3e-8958-1e10ef0565ed',
      ),
      1 => array(
        'tid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
        'uuid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
      ),
    ),
  ),
  'field_page_attachments' => array(),
  'field_glazed_content_design' => array(),
  'rdf_mapping' => array(
    'rdftype' => array(
      0 => 'sioc:Item',
      1 => 'foaf:Document',
    ),
    'title' => array(
      'predicates' => array(
        0 => 'dc:title',
      ),
    ),
    'created' => array(
      'predicates' => array(
        0 => 'dc:date',
        1 => 'dc:created',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'changed' => array(
      'predicates' => array(
        0 => 'dc:modified',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'body' => array(
      'predicates' => array(
        0 => 'content:encoded',
      ),
    ),
    'uid' => array(
      'predicates' => array(
        0 => 'sioc:has_creator',
      ),
      'type' => 'rel',
    ),
    'name' => array(
      'predicates' => array(
        0 => 'foaf:name',
      ),
    ),
    'comment_count' => array(
      'predicates' => array(
        0 => 'sioc:num_replies',
      ),
      'datatype' => 'xsd:integer',
    ),
    'last_activity' => array(
      'predicates' => array(
        0 => 'sioc:last_activity_date',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
  ),
  'path' => array(
    'pathauto' => 1,
  ),
  'comment_count' => 0,
  'pathauto_perform_alias' => FALSE,
  'date' => '2016-02-08 20:22:02 +0000',
  'user_uuid' => 'f3a5fbb6-f1ba-4c51-956c-a81a485017f7',
);
  $nodes[] = array(
  'title' => 'Why A SooperThemes Subscription Will Boost Your Drupal Business',
  'log' => '',
  'status' => 1,
  'comment' => 2,
  'promote' => 1,
  'sticky' => 0,
  'type' => 'blog',
  'language' => 'und',
  'created' => 1454963128,
  'tnid' => 0,
  'translate' => 0,
  'uuid' => '8f3425d7-4df9-4546-b6f3-03de30f998a9',
  'body' => array(
    'und' => array(
      0 => array(
        'value' => '<p>But nothing the copy said could convince her and so it didn’t take long until a few insidious Copy Writers ambushed her, made her drunk with Longe and Parole and dragged her into their agency, where they abused her for their projects again and again. And if she hasn’t been rewritten, then they are still using her.</p>

<p>Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.</p>

<p>A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far</p>
',
        'summary' => '',
        'format' => 'wysiwyg_simple',
        'safe_summary' => '',
      ),
    ),
  ),
  'field_blog_category' => array(
    'und' => array(
      0 => array(
        'tid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
        'uuid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
      ),
    ),
  ),
  'field_blog_image' => array(
    'und' => array(
      0 => array(
        'file_uuid' => '63f25ea3-fc89-4806-ab3b-8a8a9880f040',
        'alt' => NULL,
        'title' => NULL,
      ),
    ),
  ),
  'field_blog_tags' => array(
    'und' => array(
      0 => array(
        'tid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
        'uuid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
      ),
    ),
  ),
  'field_page_attachments' => array(),
  'field_glazed_content_design' => array(),
  'rdf_mapping' => array(
    'rdftype' => array(
      0 => 'sioc:Item',
      1 => 'foaf:Document',
    ),
    'title' => array(
      'predicates' => array(
        0 => 'dc:title',
      ),
    ),
    'created' => array(
      'predicates' => array(
        0 => 'dc:date',
        1 => 'dc:created',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'changed' => array(
      'predicates' => array(
        0 => 'dc:modified',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'body' => array(
      'predicates' => array(
        0 => 'content:encoded',
      ),
    ),
    'uid' => array(
      'predicates' => array(
        0 => 'sioc:has_creator',
      ),
      'type' => 'rel',
    ),
    'name' => array(
      'predicates' => array(
        0 => 'foaf:name',
      ),
    ),
    'comment_count' => array(
      'predicates' => array(
        0 => 'sioc:num_replies',
      ),
      'datatype' => 'xsd:integer',
    ),
    'last_activity' => array(
      'predicates' => array(
        0 => 'sioc:last_activity_date',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
  ),
  'path' => array(
    'pathauto' => 1,
  ),
  'comment_count' => 0,
  'pathauto_perform_alias' => FALSE,
  'date' => '2016-02-08 20:25:28 +0000',
  'user_uuid' => 'f3a5fbb6-f1ba-4c51-956c-a81a485017f7',
);
  $nodes[] = array(
  'title' => '10 reasons you\'d want to be stuck in an elevator with Dries',
  'log' => '',
  'status' => 1,
  'comment' => 2,
  'promote' => 1,
  'sticky' => 0,
  'type' => 'blog',
  'language' => 'und',
  'created' => 1454962668,
  'tnid' => 0,
  'translate' => 0,
  'uuid' => '9654aea3-2f24-4f83-b13d-c9e2f8f4617f',
  'body' => array(
    'und' => array(
      0 => array(
        'value' => '<p>ven the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.</p>

<p>The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen.</p>

<p>She packed her seven versalia, put her initial into the belt and made herself on the way.</p>

<p>When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane.</p>

<p>Pityful a rethoric question ran over her cheek, then she continued her way. On her way she met a copy.</p>

<p>The copy warned the Little Blind Text, that where it came from it would have been rewritten a thousand times and everything that was left from its origin would be the word "and" and the Little Blind Text should turn around and return to its own, safe country.</p>
',
        'summary' => '',
        'format' => 'wysiwyg_simple',
        'safe_summary' => '',
      ),
    ),
  ),
  'field_blog_category' => array(
    'und' => array(
      0 => array(
        'tid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
        'uuid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
      ),
    ),
  ),
  'field_blog_image' => array(
    'und' => array(
      0 => array(
        'file_uuid' => '85d716a5-4ddf-4881-b4ea-489befc2d013',
        'alt' => NULL,
        'title' => NULL,
      ),
    ),
  ),
  'field_blog_tags' => array(
    'und' => array(
      0 => array(
        'tid' => 'c8507d08-9e00-4f1a-938a-5b97d82f8813',
        'uuid' => 'c8507d08-9e00-4f1a-938a-5b97d82f8813',
      ),
      1 => array(
        'tid' => 'f870ff3e-acef-4e3e-8958-1e10ef0565ed',
        'uuid' => 'f870ff3e-acef-4e3e-8958-1e10ef0565ed',
      ),
    ),
  ),
  'field_page_attachments' => array(),
  'field_glazed_content_design' => array(),
  'rdf_mapping' => array(
    'rdftype' => array(
      0 => 'sioc:Item',
      1 => 'foaf:Document',
    ),
    'title' => array(
      'predicates' => array(
        0 => 'dc:title',
      ),
    ),
    'created' => array(
      'predicates' => array(
        0 => 'dc:date',
        1 => 'dc:created',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'changed' => array(
      'predicates' => array(
        0 => 'dc:modified',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'body' => array(
      'predicates' => array(
        0 => 'content:encoded',
      ),
    ),
    'uid' => array(
      'predicates' => array(
        0 => 'sioc:has_creator',
      ),
      'type' => 'rel',
    ),
    'name' => array(
      'predicates' => array(
        0 => 'foaf:name',
      ),
    ),
    'comment_count' => array(
      'predicates' => array(
        0 => 'sioc:num_replies',
      ),
      'datatype' => 'xsd:integer',
    ),
    'last_activity' => array(
      'predicates' => array(
        0 => 'sioc:last_activity_date',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
  ),
  'path' => array(
    'pathauto' => 1,
  ),
  'comment_count' => 0,
  'pathauto_perform_alias' => FALSE,
  'date' => '2016-02-08 20:17:48 +0000',
  'user_uuid' => 'f3a5fbb6-f1ba-4c51-956c-a81a485017f7',
);
  $nodes[] = array(
  'title' => 'Examples of the most controversial Drupal modules',
  'log' => '',
  'status' => 1,
  'comment' => 2,
  'promote' => 1,
  'sticky' => 0,
  'type' => 'blog',
  'language' => 'und',
  'created' => 1454962828,
  'tnid' => 0,
  'translate' => 0,
  'uuid' => 'a69d4901-b830-47fc-8b55-138cc0aa7eda',
  'body' => array(
    'und' => array(
      0 => array(
        'value' => '<p>When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane.</p>

<p>Pityful a rethoric question ran over her cheek, then she continued her way. On her way she met a copy.</p>

<p>The copy warned the Little Blind Text, that where it came from it would have been rewritten a thousand times and everything that was left from its origin would be the word "and" and the Little Blind Text should turn around and return to its own, safe country.</p>

<p>But nothing the copy said could convince her and so it didn’t take long until a few insidious Copy Writers ambushed her, made her drunk with Longe and Parole and dragged her into their agency, where they abused her for their projects again and again.</p>

<p>And if she hasn’t been rewritten, then they are still using her. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.</p>

<p>Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.</p>

<p>A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.</p>
',
        'summary' => '',
        'format' => 'wysiwyg_simple',
        'safe_summary' => '',
      ),
    ),
  ),
  'field_blog_category' => array(
    'und' => array(
      0 => array(
        'tid' => '60e20db5-3340-40b2-87e0-ac2b560b1355',
        'uuid' => '60e20db5-3340-40b2-87e0-ac2b560b1355',
      ),
    ),
  ),
  'field_blog_image' => array(
    'und' => array(
      0 => array(
        'file_uuid' => '63198bff-44bf-46f2-b600-5dd2c95d5d7e',
        'alt' => NULL,
        'title' => NULL,
      ),
    ),
  ),
  'field_blog_tags' => array(
    'und' => array(
      0 => array(
        'tid' => '3f81c575-06ff-43cb-8339-d4790fa56ede',
        'uuid' => '3f81c575-06ff-43cb-8339-d4790fa56ede',
      ),
      1 => array(
        'tid' => 'c8507d08-9e00-4f1a-938a-5b97d82f8813',
        'uuid' => 'c8507d08-9e00-4f1a-938a-5b97d82f8813',
      ),
    ),
  ),
  'field_page_attachments' => array(),
  'field_glazed_content_design' => array(),
  'rdf_mapping' => array(
    'rdftype' => array(
      0 => 'sioc:Item',
      1 => 'foaf:Document',
    ),
    'title' => array(
      'predicates' => array(
        0 => 'dc:title',
      ),
    ),
    'created' => array(
      'predicates' => array(
        0 => 'dc:date',
        1 => 'dc:created',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'changed' => array(
      'predicates' => array(
        0 => 'dc:modified',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'body' => array(
      'predicates' => array(
        0 => 'content:encoded',
      ),
    ),
    'uid' => array(
      'predicates' => array(
        0 => 'sioc:has_creator',
      ),
      'type' => 'rel',
    ),
    'name' => array(
      'predicates' => array(
        0 => 'foaf:name',
      ),
    ),
    'comment_count' => array(
      'predicates' => array(
        0 => 'sioc:num_replies',
      ),
      'datatype' => 'xsd:integer',
    ),
    'last_activity' => array(
      'predicates' => array(
        0 => 'sioc:last_activity_date',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
  ),
  'path' => array(
    'pathauto' => 1,
  ),
  'comment_count' => 0,
  'pathauto_perform_alias' => FALSE,
  'date' => '2016-02-08 20:20:28 +0000',
  'user_uuid' => 'f3a5fbb6-f1ba-4c51-956c-a81a485017f7',
);
  $nodes[] = array(
  'title' => '10 ways people have gotten rich with Drupal',
  'log' => '',
  'status' => 1,
  'comment' => 2,
  'promote' => 1,
  'sticky' => 0,
  'type' => 'blog',
  'language' => 'und',
  'created' => 1454962986,
  'tnid' => 0,
  'translate' => 0,
  'uuid' => 'a81f759f-9584-4092-8310-afcdd8f0417d',
  'body' => array(
    'und' => array(
      0 => array(
        'value' => '<p>Little Blind Text, that where it came from it would have been rewritten a thousand times and everything that was left from its origin would be the word "and" and the Little Blind Text should turn around and return to its own, safe country.</p>

<p>But nothing the copy said could convince her and so it didn’t take long until a few insidious Copy Writers ambushed her, made her drunk with Longe and Parole and dragged her into their agency, where they abused her for their projects again and again.</p>

<p>And if she hasn’t been rewritten, then they are still using her. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.</p>

<p>Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>

<p>It is a paradisematic country, in which roasted parts of sentences fly into your mouth.</p>

<p>Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.</p>
',
        'summary' => '',
        'format' => 'wysiwyg_simple',
        'safe_summary' => '',
      ),
    ),
  ),
  'field_blog_category' => array(
    'und' => array(
      0 => array(
        'tid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
        'uuid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
      ),
    ),
  ),
  'field_blog_image' => array(
    'und' => array(
      0 => array(
        'file_uuid' => '29a20c3d-4a71-42a5-aebf-2f7b657fd331',
        'alt' => NULL,
        'title' => NULL,
      ),
    ),
  ),
  'field_blog_tags' => array(
    'und' => array(
      0 => array(
        'tid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
        'uuid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
      ),
      1 => array(
        'tid' => '3f81c575-06ff-43cb-8339-d4790fa56ede',
        'uuid' => '3f81c575-06ff-43cb-8339-d4790fa56ede',
      ),
    ),
  ),
  'field_page_attachments' => array(),
  'field_glazed_content_design' => array(),
  'rdf_mapping' => array(
    'rdftype' => array(
      0 => 'sioc:Item',
      1 => 'foaf:Document',
    ),
    'title' => array(
      'predicates' => array(
        0 => 'dc:title',
      ),
    ),
    'created' => array(
      'predicates' => array(
        0 => 'dc:date',
        1 => 'dc:created',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'changed' => array(
      'predicates' => array(
        0 => 'dc:modified',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'body' => array(
      'predicates' => array(
        0 => 'content:encoded',
      ),
    ),
    'uid' => array(
      'predicates' => array(
        0 => 'sioc:has_creator',
      ),
      'type' => 'rel',
    ),
    'name' => array(
      'predicates' => array(
        0 => 'foaf:name',
      ),
    ),
    'comment_count' => array(
      'predicates' => array(
        0 => 'sioc:num_replies',
      ),
      'datatype' => 'xsd:integer',
    ),
    'last_activity' => array(
      'predicates' => array(
        0 => 'sioc:last_activity_date',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
  ),
  'path' => array(
    'pathauto' => 1,
  ),
  'comment_count' => 0,
  'pathauto_perform_alias' => FALSE,
  'date' => '2016-02-08 20:23:06 +0000',
  'user_uuid' => 'f3a5fbb6-f1ba-4c51-956c-a81a485017f7',
);
  $nodes[] = array(
  'title' => '5 amazing things you probably didn\'t know about Drupal',
  'log' => '',
  'status' => 1,
  'comment' => 2,
  'promote' => 1,
  'sticky' => 0,
  'type' => 'blog',
  'language' => 'und',
  'created' => 1454963061,
  'tnid' => 0,
  'translate' => 0,
  'uuid' => 'd09b2f9c-76e9-4676-8407-6b5fb6dce071',
  'body' => array(
    'und' => array(
      0 => array(
        'value' => '<p>And if she hasn’t been rewritten, then they are still using her. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.</p>

<p>Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>

<p>It is a paradisematic country, in which roasted parts of sentences fly into your mouth.</p>

<p>Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.</p>

<p>The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen. She packed her seven versalia, put her initial into the belt and made herself on the way.</p>

<p>When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane. Pityful a rethoric question ran over her cheek, then she continued her way.</p>
',
        'summary' => '',
        'format' => 'wysiwyg_simple',
        'safe_summary' => '',
      ),
    ),
  ),
  'field_blog_category' => array(
    'und' => array(
      0 => array(
        'tid' => '60e20db5-3340-40b2-87e0-ac2b560b1355',
        'uuid' => '60e20db5-3340-40b2-87e0-ac2b560b1355',
      ),
    ),
  ),
  'field_blog_image' => array(
    'und' => array(
      0 => array(
        'file_uuid' => 'ebd89af3-12f3-4316-8c97-84e0182ad497',
        'alt' => NULL,
        'title' => NULL,
      ),
    ),
  ),
  'field_blog_tags' => array(
    'und' => array(
      0 => array(
        'tid' => 'f870ff3e-acef-4e3e-8958-1e10ef0565ed',
        'uuid' => 'f870ff3e-acef-4e3e-8958-1e10ef0565ed',
      ),
    ),
  ),
  'field_page_attachments' => array(),
  'field_glazed_content_design' => array(),
  'rdf_mapping' => array(
    'rdftype' => array(
      0 => 'sioc:Item',
      1 => 'foaf:Document',
    ),
    'title' => array(
      'predicates' => array(
        0 => 'dc:title',
      ),
    ),
    'created' => array(
      'predicates' => array(
        0 => 'dc:date',
        1 => 'dc:created',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'changed' => array(
      'predicates' => array(
        0 => 'dc:modified',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'body' => array(
      'predicates' => array(
        0 => 'content:encoded',
      ),
    ),
    'uid' => array(
      'predicates' => array(
        0 => 'sioc:has_creator',
      ),
      'type' => 'rel',
    ),
    'name' => array(
      'predicates' => array(
        0 => 'foaf:name',
      ),
    ),
    'comment_count' => array(
      'predicates' => array(
        0 => 'sioc:num_replies',
      ),
      'datatype' => 'xsd:integer',
    ),
    'last_activity' => array(
      'predicates' => array(
        0 => 'sioc:last_activity_date',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
  ),
  'path' => array(
    'pathauto' => 1,
  ),
  'comment_count' => 0,
  'pathauto_perform_alias' => FALSE,
  'date' => '2016-02-08 20:24:21 +0000',
  'user_uuid' => 'f3a5fbb6-f1ba-4c51-956c-a81a485017f7',
);
  $nodes[] = array(
  'title' => '7 ways to grow your Drupal business',
  'log' => '',
  'status' => 1,
  'comment' => 2,
  'promote' => 0,
  'sticky' => 0,
  'type' => 'blog',
  'language' => 'und',
  'created' => 1454962668,
  'tnid' => 0,
  'translate' => 0,
  'uuid' => 'f386b493-4347-4570-bc22-382db8c2df88',
  'body' => array(
    'und' => array(
      0 => array(
        'value' => '<p>The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen.</p>

<p>She packed her seven versalia, put her initial into the belt and made herself on the way.</p>

<p>When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane.</p>

<p>Pityful a rethoric question ran over her cheek, then she continued her way. On her way she met a copy.</p>

<p>The copy warned the Little Blind Text, that where it came from it would have been rewritten a thousand times and everything that was left from its origin would be the word "and" and the Little Blind Text should turn around and return to its own, safe country.</p>

<p>But nothing the copy said could convince her and so it didn’t take long until a few insidious Copy Writers ambushed her, made her drunk with Longe and Parole and dragged her into their agency, where they abused her for their projects again and again.</p>
',
        'summary' => '',
        'format' => 'wysiwyg_full',
        'safe_summary' => '',
      ),
    ),
  ),
  'field_blog_category' => array(
    'und' => array(
      0 => array(
        'tid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
        'uuid' => '3456efe3-c665-49de-abc8-0fd9f5075ee5',
      ),
    ),
  ),
  'field_blog_image' => array(
    'und' => array(
      0 => array(
        'file_uuid' => 'b69d1559-9d07-4288-8912-e12e3e048485',
        'alt' => NULL,
        'title' => NULL,
      ),
    ),
  ),
  'field_blog_tags' => array(
    'und' => array(
      0 => array(
        'tid' => 'e32de019-e4d5-46b6-a10d-786c6cc70756',
        'uuid' => 'e32de019-e4d5-46b6-a10d-786c6cc70756',
      ),
      1 => array(
        'tid' => 'c8507d08-9e00-4f1a-938a-5b97d82f8813',
        'uuid' => 'c8507d08-9e00-4f1a-938a-5b97d82f8813',
      ),
      2 => array(
        'tid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
        'uuid' => '9ee3da11-283d-45d3-85ed-a7e96547ad49',
      ),
      3 => array(
        'tid' => '3f81c575-06ff-43cb-8339-d4790fa56ede',
        'uuid' => '3f81c575-06ff-43cb-8339-d4790fa56ede',
      ),
    ),
  ),
  'field_page_attachments' => array(),
  'field_glazed_content_design' => array(),
  'rdf_mapping' => array(
    'rdftype' => array(
      0 => 'sioc:Item',
      1 => 'foaf:Document',
    ),
    'title' => array(
      'predicates' => array(
        0 => 'dc:title',
      ),
    ),
    'created' => array(
      'predicates' => array(
        0 => 'dc:date',
        1 => 'dc:created',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'changed' => array(
      'predicates' => array(
        0 => 'dc:modified',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
    'body' => array(
      'predicates' => array(
        0 => 'content:encoded',
      ),
    ),
    'uid' => array(
      'predicates' => array(
        0 => 'sioc:has_creator',
      ),
      'type' => 'rel',
    ),
    'name' => array(
      'predicates' => array(
        0 => 'foaf:name',
      ),
    ),
    'comment_count' => array(
      'predicates' => array(
        0 => 'sioc:num_replies',
      ),
      'datatype' => 'xsd:integer',
    ),
    'last_activity' => array(
      'predicates' => array(
        0 => 'sioc:last_activity_date',
      ),
      'datatype' => 'xsd:dateTime',
      'callback' => 'date_iso8601',
    ),
  ),
  'path' => array(
    'pathauto' => 1,
  ),
  'comment_count' => 0,
  'pathauto_perform_alias' => FALSE,
  'date' => '2016-02-08 20:17:48 +0000',
  'user_uuid' => 'f3a5fbb6-f1ba-4c51-956c-a81a485017f7',
);
  return $nodes;
}
