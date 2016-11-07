import Ember from 'ember';

export default Ember.Route.extend({
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
  actions: {
    toggleFavorite(pattern) {
      if (pattern.get('isFavorite')) {
        let currentFavorite = pattern.get('currentFavorite');
        currentFavorite.deleteRecord();
        currentFavorite.save()
        .then(() => {
          this.get('flashMessages').success('Favorite removed.');
        });
      }
      else {
        let favorite = this.get('store').createRecord('favorite', {
          pattern: pattern
        });
        favorite.save();
      }
    },
    createNewProject(pattern) {
      this.transitionTo('newproject', pattern);
    },
  }

});
