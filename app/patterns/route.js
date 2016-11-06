import Ember from 'ember';

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
      
    }
  }
});
