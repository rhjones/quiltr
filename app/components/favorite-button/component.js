import Ember from 'ember';

// favorite-button <-- pattern-card <-- gallery (patterns)
// favorite-button <-- pattern
// favorite-button <-- pattern-card <-- favorites


// 
export default Ember.Component.extend({
  auth: Ember.inject.service(),
  store: Ember.inject.service(),
  tagName: 'span',
  classNameBindings: ['isFavorite'],
  isFavoritedByCurrentUser: Ember.computed.alias('pattern.isFavoritedByCurrentUser'),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
  actions: {
    toggleFavorite() {
      let favorite = this.get('favorite');
      if (favorite) {
        favorite.destroyRecord()
        .catch(() => {
          this.get('flashMessages').danger('There was an error. Please try again.');
        })
      }
      else {
        let favorite = this.get('store').createRecord('favorite', {
          pattern: this.get('pattern'),
        });
        favorite.save()
        .catch(() => {
          this.get('flashMessages').danger('There was an error. Please try again.');
        })
      }
    }
  }

});
