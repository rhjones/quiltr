import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),
  flashMessages: Ember.inject.service(),
  beforeModel() {
    if (this.get('auth.credentials.token')) {
      this.transitionTo('application');
    }
  },
  actions: {
    signUp (credentials) {
      this.get('auth').signUp(credentials)
      .then(() => this.get('auth').signIn(credentials))
      .then(() => {
        Ember.$('#app-wrapper').removeClass('welcome');
        Ember.$('nav').removeClass('welcome-nav');
      })
      .then(() => this.transitionTo('application'))
      .then(() => {
        this.get('flashMessages')
        .success('Successfully signed-up! You have also been signed-in.');
      })
      .catch(() => {
        this.get('flashMessages')
        .danger('Your email address and username must be unique. Please try again.');
      });
    },
  },
});
