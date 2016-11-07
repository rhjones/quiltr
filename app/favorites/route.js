import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    // return this.get('store').findAll('favorite');
    return Ember.RSVP.hash({
      favorites: this.store.findAll('favorite'),
      patterns: this.store.findAll('pattern'),
    });
  },

});
