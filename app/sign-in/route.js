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
    signIn (credentials) {
      return this.get('auth').signIn(credentials)
      // .then(() => {
      //   let previousTransition = this.get('previousTransition');
      //   if (previousTransition) {
      //     console.log('previous transition before sign-in!');
      //     this.set('previousTransition', null);
      //     previousTransition.retry();
      //   } 
      //   else {
      //     this.transitionTo('application');
      //   }
      // })
      .then(() => {
        Ember.$('#app-wrapper').removeClass('welcome');
        Ember.$('nav').removeClass('welcome-nav');
      })
      .then(() => this.transitionTo('application'))
      .then(() => this.get('flashMessages').success('Thanks for signing in!'))
      .catch(() => {
        this.get('flashMessages')
        .danger('There was a problem. Please try again.');
      });
    },
  },
});
