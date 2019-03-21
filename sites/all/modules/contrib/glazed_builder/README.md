# Glazed Builder

SooperThemes Drupal Drag and Drop builder module. Built as companion for our Glazed Theme product but also works as standalone module to add drag and drop content on any entity textfield. For a quick live demo of the product visit http://www.trysooperthemes.com/

For testing and development it is preferred that your installation is based on the Main Demo installation profile. For the best experience you should use a Bootstrap 3 based theme in your environment. You can download it here: https://www.sooperthemes.com/download

## Workflow

* Develop and Test locally on your own machine
* Push  code to a development, feature or issue branch. Create pull request.
* I will test and give feedback
* If code is OK I will merge with the 7.x branch.
* Branches should be named 7.x-yourname-branchname

Branch naming examples:
```
7.x-jur-dev
```
```
7.x-jur-issue_777789
```
```
7.x-jur-undo_redo_history
```


### Prerequisites

* [Drupal 7](https://www.drupal.org/project/drupal)
* [CTools](https://www.drupal.org/project/ctools)
* [Entity](https://www.drupal.org/project/entity)
* [File Entity](https://www.drupal.org/project/file_entity)
* [jQuery Update](https://www.drupal.org/project/jquery_update) - Set to load 2.1 on frontend pages and 1.8 on seven theme)
* [Media](https://www.drupal.org/project/media) - 7.x-2.0 latest beta
* [Views](https://www.drupal.org/project/views)

### Installing

Installs like any other module.

```
drush en glazed_builder -y
```

To enable the module on a field, set Glazed Builder formatter on any entity textfield. For example on Basic Page body field (example.com/admin/structure/types/manage/page/display). The builder should show when viewing a node of this type (not on de node/add or node/edit form).

### Developing

[Grunt](http://gruntjs.com/) is used to parse sass to CSS and combine JS files. Don't run npm install, development modules are included.

```
cd glazed_builder
grunt
```

## Built With

* [Drupal 7](https://www.drupal.org/project/drupal) - The web framework used
* [jQuery](https://jquery.com/) - JS Framework
* [underscore](http://underscorejs.org/) - JS Tools
* [jQuery UI](https://jqueryui.com/) - Drag and Drop
* [Grunt](http://gruntjs.com/) - Combining JS and CSS files, adding CSS prefixes

## Versioning

This project follows [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/jjroelofs/glazed/tags).

### Code Standards and Best Practices

* https://trello.com/b/LdWR68Cm/sooperthemes-drupal-wiki
* https://www.drupal.org/coding-standards
