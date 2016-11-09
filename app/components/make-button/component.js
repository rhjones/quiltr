import Ember from 'ember';

// make-button <-- pattern-card <-- gallery (patterns)
// make-button <-- pattern-card <-- project
// make-button <-- pattern-card <-- favorites
// make-button <-- pattern

export default Ember.Component.extend({
  tagName: 'span',
  auth: Ember.inject.service(),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
});
