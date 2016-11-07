/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: [
        'bower_components/bootstrap-sass/assets/stylesheets'
      ]
    }
  });

  app.import('bower_components/bootstrap-sass/assets/javascripts/bootstrap.js');

  app.import('bower_components/fabric.js/dist/fabric.min.js');

  app.import('bower_components/jquery-ui/jquery-ui.js');
  app.import('bower_components/jquery-ui/themes/smoothness/jquery-ui.min.css');

  app.import('bower_components/moment/moment.js');

  return app.toTree();
};
