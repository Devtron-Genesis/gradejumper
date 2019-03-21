
Description
===============================================================================

Minify Source HTML was developed to replace the implementation of the Minify
module (https://www.drupal.org/project/minify) which would only minify the html
in the content area of the page, not the html of the entire page. This module
hooks in at the very end of the page render process and minifies everything.

Installation
===============================================================================

  1. Place the entire minifyhtml/ folder into sites/all/modules/ directory.

  2. Enable the Minify HTML module.

  3. Go to the Performance page: Configuration > Performance. Check the
     Minified Source HTML checkbox and Save configuration.
