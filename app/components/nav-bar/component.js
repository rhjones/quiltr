import Ember from 'ember';

export default Ember.Component.extend({
  auth: Ember.inject.service(),

  currentUserEmail: Ember.computed.alias('auth.credentials.email'),
  currentUsername: Ember.computed.alias('auth.credentials.username'),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
  actions: {
    signOut () {
      this.sendAction('signOut');
    },
  },
});
