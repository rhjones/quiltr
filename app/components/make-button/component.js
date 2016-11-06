import Ember from 'ember';

// make-button <-- pattern-card <-- gallery (patterns)
// make-button <-- pattern

export default Ember.Component.extend({
  auth: Ember.inject.service(),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
});
