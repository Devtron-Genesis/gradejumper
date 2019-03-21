<footer id="footer" class="section-black">
  <div class="container">
    <div class="row">
      <div class="col col-sm-3">
        <?php if (isset($footer['links']['gradejumpers'])): ?>
          <div class="group">
            <h4> <?php print t('GradeJumpers'); ?> </h4>
            <ul>
              <?php foreach ($footer['links']['gradejumpers'] as $link): ?>
                <li>
                  <a href="<?php print $link['link']; ?>" <?php print isset($link['classes']) ? "class=" . $link['classes'] : ''; ?>>
                    <?php print t($link['name']); ?>
                  </a>
                </li>
              <?php endforeach; ?>
            </ul>
          </div>
        <?php endif; ?>
        <?php if (isset($footer['links']['resources'])): ?>
          <div class="group">
            <h4> <?php print t('Resources'); ?> </h4>
            <ul>
              <?php foreach ($footer['links']['resources'] as $link): ?>
                <li>
                  <a href="<?php print $link['link']; ?>" <?php print isset($link['classes']) ? "class=" . $link['classes'] : ''; ?>>
                    <?php print t($link['name']); ?>
                  </a>
                </li>
              <?php endforeach; ?>
            </ul>
          </div>
        <?php endif; ?>
      </div>

      <!-- <div class="col col-sm-3">
        <?php if (isset($footer['links']['popular_subjects'])): ?>
          <div class="group">
            <h4> <?php print t('Popular subjects'); ?> </h4>
            <ul>
              <?php foreach ($footer['links']['popular_subjects'] as $link): ?>
                <li>
                  <a href="<?php print $link['link']; ?>" <?php print isset($link['classes']) ? "class=" . $link['classes'] : ''; ?>>
                    <?php print t($link['name']); ?>
                  </a>
                </li>
              <?php endforeach; ?>
            </ul>
          </div>
        <?php endif; ?>
        <?php if (isset($footer['links']['popular_levels'])): ?>
          <div class="group">
            <h4> <?php print t('Popular levels'); ?> </h4>
            <ul>
              <?php foreach ($footer['links']['popular_levels'] as $link): ?>
                <li>
                  <a href="<?php print $link['link']; ?>" <?php print isset($link['classes']) ? "class=" . $link['classes'] : ''; ?>>
                    <?php print t($link['name']); ?>
                  </a>
                </li>
              <?php endforeach; ?>
            </ul>
          </div>
        <?php endif; ?>
      </div>

      <div class="col col-sm-3">
        <?php if (isset($footer['links']['popular_searches'])): ?>
          <h4> <?php print t('Popular searches'); ?> </h4>
          <ul>
            <?php foreach ($footer['links']['popular_searches'] as $link): ?>
              <li>
                <a href="<?php print $link['link']; ?>" <?php print isset($link['classes']) ? "class=" . $link['classes'] : ''; ?>>
                  <?php print t($link['name']); ?>
                </a>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      </div> -->

      <div class="col col-sm-3">
        <?php if (isset($footer['links']['popular_searches1'])): ?>
          <h4> <?php print t('Popular searches'); ?> </h4>
          <ul>
            <?php foreach ($footer['links']['popular_searches1'] as $link): ?>
              <li>
                <a href="<?php print $link['link']; ?>" <?php print isset($link['classes']) ? "class=" . $link['classes'] : ''; ?>>
                  <?php print t($link['name']); ?>
                </a>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      </div>

      <div class="col col-sm-3">
        <?php if (isset($footer['links']['popular_searches2'])): ?>
          <h4> <?php print t('Popular searches'); ?> </h4>
          <ul>
            <?php foreach ($footer['links']['popular_searches2'] as $link): ?>
              <li>
                <a href="<?php print $link['link']; ?>" <?php print isset($link['classes']) ? "class=" . $link['classes'] : ''; ?>>
                  <?php print t($link['name']); ?>
                </a>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      </div>

      <div class="col col-sm-3">
        <h4> <?php print t('We\'re here to help'); ?> </h4>
        <a href="/contact" class="top-contact use-ajax ctools-modal-custom-popup-class btn btn-primary btn-lg">
          <?php print t('Contact us'); ?>
        </a>
        <ul class="social">
          <li class="first">
            <a href="https://www.facebook.com/gradejumpers" target="_blank">
              <i class="fa fa-facebook-square" aria-hidden="true"></i>
            </a>
          </li>
          <li class="last">
            <a href="https://twitter.com/Gradejumpers" target="_blank">
              <i class="fa fa-twitter-square" aria-hidden="true"></i>
            </a>
          </li>
        </ul>
      </div>
      <div class="col-sm-12">
        <p class="copyright"><?php print t('©GradeJumpers 2018-19.'); ?></p>
      </div>
    </div>
  </div>
</footer>
