import Ember from 'ember';

export default Ember.Route.extend({
  model (params) {
    return this.get('store').findRecord('pattern', params.pattern_id);
  },
  auth: Ember.inject.service(),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
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
