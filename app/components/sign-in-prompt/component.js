import Ember from 'ember';

// sign-in-prompt <-- generate
export default Ember.Component.extend({
  tagName: 'span',
  auth: Ember.inject.service(),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
});
