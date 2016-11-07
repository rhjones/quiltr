import Ember from 'ember';

// patterns --> pattern-card --> pattern-canvas
// patterns --> pattern-card --> favorite-button
// patterns --> pattern-card --> make-button

export default Ember.Route.extend({
  model () {
    return this.get('store').findAll('pattern');
  },
  actions: {
    toggleFavorite(pattern) {
      if (pattern.get('isFavorite')) {
        let currentFavorite = pattern.get('currentFavorite');
        currentFavorite.deleteRecord();
        currentFavorite.save();
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
