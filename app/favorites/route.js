import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),
  flashMessages: Ember.inject.service(),
  beforeModel() {
    if (!this.get('auth.credentials.token')) {
      this.transitionTo('sign-in')
      .then(() => {
        this.get('flashMessages')
        .warning('You must sign in to access that page.');
      })
    }
  },
  model() {
    // return this.get('store').findAll('favorite');
    return Ember.RSVP.hash({
      favorites: this.store.findAll('favorite'),
      patterns: this.store.findAll('pattern'),
    });
  },
  // afterModel(model, transition) {
  //   // return model.each.get('pattern');
  //   Ember.RSVP.all(model.getEach('pattern'));
  // },
});
