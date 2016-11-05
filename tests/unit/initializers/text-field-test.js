import Ember from 'ember';
import TextFieldInitializer from 'quiltr/initializers/text-field';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | text field', {
  beforeEach () {
    Ember.run(function () {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  },
});

// Replace this with your real tests.
test('it works', function (assert) {
  TextFieldInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
