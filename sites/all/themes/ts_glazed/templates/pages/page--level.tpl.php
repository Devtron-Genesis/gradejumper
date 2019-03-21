<header id="header" role="banner" class="<?php print $navbar_classes; ?>">
  <div class="navbar-header">
    <?php if ($logo): ?>
      <a class="logo navbar-btn pull-left" href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>">
        <img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" />
      </a>
    <?php endif; ?>

    <?php if (!empty($primary_nav) || !empty($secondary_nav) || !empty($page['navigation'])): ?>
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar-collapse">
        <span class="sr-only"><?php print t('Toggle navigation'); ?></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
    <?php endif; ?>

    <div class="pull-right visible-xs nav-link">
      <a href="/user/login" class="#">
        <?php print t('Login'); ?>
      </a>
    </div>
  </div>

  <?php if (!empty($primary_nav) || !empty($secondary_nav) || !empty($page['navigation'])): ?>
    <div class="navbar-collapse collapse" id="navbar-collapse">
      <nav role="navigation">
        <?php if (!empty($primary_nav)): ?>
          <?php print render($primary_nav); ?>
        <?php endif; ?>
        <?php if (!empty($secondary_nav)): ?>
          <?php print render($secondary_nav); ?>
        <?php endif; ?>
        <?php if (!empty($page['navigation'])): ?>
          <?php print render($page['navigation']); ?>
        <?php endif; ?>
      </nav>
    </div>
  <?php endif; ?>
</header>

<div id="wrapper" class="gj-full-width">
  <section class="titlebar">
    <div class="container">
      <?php if ($title): ?>
        <h1 id="page-title"><?php print $title; ?></h1>
      <?php endif; ?>
      <?php if ($breadcrumb): ?>
        <nav id="breadcrumbs">
          <?php print $breadcrumb; ?>
        </nav>
      <?php endif; ?>
        <?php if (!isset($page['content']['system_main']['gj_deanhopkins_search_subject']['#hide_search_block'])): ?>
        <?php if ($seo_form): ?>
            <?php print drupal_render($seo_form); ?>
        <?php endif; ?>
        <div class="serch-extra-check">
            <span class="check white desktop-only">
              <i class="fa fa-check"></i>
              <?php print t('Meet our tutors free'); ?>
            </span>
            <span class="check white">
              <i class="fa fa-check"></i>
              <?php print t('No hidden fees'); ?>
            </span>
            <span class="check white">
              <i class="fa fa-check"></i>
              <?php print t('Satisfaction guarantee'); ?>
            </span>
        </div>
        <?php print get_search_results_average_rating_display($page['content']['system_main']['results']); ?>
    </div>
      <?php endif; ?>
  </section>
</div>

<div class="main-container <?php print $container_class; ?>">

  <?php if ($page['header']): ?>
    <header role="banner" id="page-header">
      <?php if (!empty($site_slogan)): ?>
        <p class="lead"><?php print $site_slogan; ?></p>
      <?php endif; ?>

      <?php print render($page['header']); ?>
    </header> <!-- /#page-header -->
  <?php endif; ?>

  <div class="row">

    <?php if (!empty($page['sidebar_first'])): ?>
      <aside class="col-sm-3" role="complementary">
        <?php print render($page['sidebar_first']); ?>
      </aside>  <!-- /#sidebar-first -->
    <?php endif; ?>

    <section>
      <?php if (!empty($page['highlighted'])): ?>
        <div class="highlighted jumbotron"><?php print render($page['highlighted']); ?></div>
      <?php endif; ?>
      <?php print $messages; ?>
      <?php if (!empty($tabs)): ?>
        <?php print render($tabs); ?>
      <?php endif; ?>
      <?php if (!empty($page['help'])): ?>
        <?php print render($page['help']); ?>
      <?php endif; ?>
      <?php if (!empty($action_links)): ?>
        <ul class="action-links"><?php print render($action_links); ?></ul>
      <?php endif; ?>
      <?php print render($page['content']); ?>
    </section>

    <?php if (!empty($page['sidebar_second'])): ?>
      <aside class="col-sm-3" role="complementary">
        <?php print render($page['sidebar_second']); ?>
      </aside>  <!-- /#sidebar-second -->
    <?php endif; ?>

  </div>
</div>

<?php include drupal_get_path('theme', 'ts_glazed') . '/templates/system/footer.tpl.php'; ?>

<?php if (!empty($page['footer'])): ?>
    <footer class="footer <?php print $container_class; ?>">
        <?php print render($page['footer']); ?>
    </footer>
<?php endif; ?>

