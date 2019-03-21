<?php
/**
 * @file
 * cms_core_content.features.uuid_node.inc
 */

/**
 * Implements hook_uuid_features_default_content().
 */
function cms_core_content_uuid_features_default_content() {
  $nodes = array();

  $nodes[] = array(
  'title' => 'Home',
  'log' => '',
  'status' => 1,
  'comment' => 1,
  'promote' => 0,
  'sticky' => 0,
  'type' => 'page',
  'language' => 'und',
  'created' => 1456327902,
  'tnid' => 0,
  'translate' => 0,
  'uuid' => '244f31f4-c131-441a-8cb2-5dcfc3b6ca02',
  'body' => array(
    'und' => array(
      0 => array(
        'value' => '<div class="az-element az-section" data-az-id="b2" data-azat-style="margin-top:60px;" data-azb="az_section" style="margin-top:60px;">
	<div class="az-ctnr container" data-azcnt="true">
		<div class="az-element az-row row  az-row--sm" data-az-id="b3" data-azat-device="sm" data-azb="az_row" data-azcnt="true" style="">
			<div class="az-element az-ctnr az-column  col-sm-4" data-az-id="b4" data-azat-width="1/3" data-azb="az_column" data-azcnt="true" style="">
				<div class="az-element az-text" data-az-id="b5" data-azb="az_text" data-azcnt="true" style="">
					<div>
						<h1>Glazed Drupal</h1>

						<h2>Try the Glazed Drupal Experience.</h2>
					</div>
				</div>

				<div class="az-element az-text" data-az-id="b6" data-azb="az_text" data-azcnt="true" style="">
					<div>
						<p>Enjoy a fully featured Drupal CMS with a modern theme. Glazed Drupal CMS includes content types, features, demo content, and the <em>free edition</em> of Glazed Premium Theme.</p>

						<p>Glazed theme is the most powerful theme available for Drupal. With 200 theme settings Glazed can easily be colored and customized. No coding needed!</p>
					</div>
				</div>

				<div class="az-element az-template" data-az-id="b7" data-azat-style="margin-top:15px;" data-azb="button-3d" style="margin-top:15px;">
					<div data-azcnt="true"><a class="btn btn-md btn-primary" href="http://www.drupal.org/project/cms" target="_self" type="button">Download Glazed CMS!</a></div>
				</div>
			</div>

			<div class="az-element az-ctnr az-column  col-sm-8" data-az-id="b8" data-azat-width=" 2/3" data-azb="az_column" data-azcnt="true" style="">
				<div class="az-element az-image" data-az-id="b9" data-azat-height="" data-azat-image="http://i.imgur.com/DBNsvif.jpg" data-azb="az_image"><img alt="" src="http://i.imgur.com/DBNsvif.jpg" style="width: 100%;" title=""></div>
			</div>
		</div>

		<hr class="az-element az-separator" data-az-id="b10" data-azb="az_separator" style="border: none;"></div>
</div>

<div class="az-element az-section" data-az-id="b11" data-azat-style="margin-top:60px;" data-azb="az_section" style="margin-top:60px;">
	<div class="az-ctnr container" data-azcnt="true">
		<div class="az-element az-row row  az-row--sm" data-az-id="b12" data-azat-device="sm" data-azb="az_row" data-azcnt="true" style="">
			<div class="az-element az-ctnr az-column  col-sm-8" data-az-id="b13" data-azat-width=" 2/3" data-azb="az_column" data-azcnt="true" style="">
				<div class="az-element az-image" data-az-id="b14" data-azat-height="" data-azat-image="http://i.imgur.com/EHMdH2sh.jpg" data-azb="az_image"><img alt="" src="http://i.imgur.com/EHMdH2sh.jpg" style="width: 100%;" title=""></div>
			</div>

			<div class="az-element az-ctnr az-column  col-sm-4" data-az-id="b15" data-azat-width="1/3" data-azb="az_column" data-azcnt="true" style="">
				<div class="az-element az-text" data-az-id="b16" data-azb="az_text" data-azcnt="true" style="">
					<div>
						<h1>Glazed Free</h1>

						<h2>By SooperThemes</h2>
					</div>
				</div>

				<div class="az-element" data-az-id="b17" data-azat-style="margin-top:0px;margin-bottom:0px;padding-top:0px;padding-bottom:0px;" data-azb="az_unknown" data-azcnt="true"></div>

				<div class="az-element az-text" data-az-id="b18" data-azb="az_text" data-azcnt="true" style="">
					<p>Visual Theme Settings, Unlimited Colors, Translation, SEO &amp; SEM Optimized. SooperThemes has over 10 years experience in Drupal theming and this is our flagship theme.</p>

					<p>Glazed Free lacks some of the advanced features from the premium theme but is still easily the most advanced free theme available today!</p>
				</div>

				<div class="az-element az-template" data-az-id="b19" data-azat-style="margin-top:15px;" data-azb="button-3d" style="margin-top:15px;">
					<div data-azcnt="true"><a class="btn btn-md btn-primary" href="http://www.sooperthemes.com/drupal-themes/glazed" target="_self" type="button">Learn More About Glazed</a></div>
				</div>
			</div>
		</div>
	</div>
</div>
',
        'summary' => '',
        'format' => 'wysiwyg_full',
        'safe_summary' => '',
      ),
    ),
  ),
  'field_page_attachments' => array(),
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
  'date' => '2016-02-24 16:31:42 +0100',
  'user_uuid' => '1d46b4f3-68c5-44b9-a128-450c5a952d7e',
);
  return $nodes;
}
