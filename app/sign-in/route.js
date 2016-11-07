import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),
  flashMessages: Ember.inject.service(),

  actions: {
    signIn (credentials) {
      return this.get('auth').signIn(credentials)
      .then(() => {
        let previousTransition = this.get('previousTransition');

        if (previousTransition) {
          this.set('previousTransition', null);
          previousTransition.retry();
        } 

        else {
          this.transitionTo('application');
        }
      })
      .then(() => this.get('flashMessages').success('Thanks for signing in!'))
      .catch(() => {
        this.get('flashMessages')
        .danger('There was a problem. Please try again.');
      });
    },
  },
});
