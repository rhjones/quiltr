import Ember from 'ember';

// favorite-button <-- pattern
// favorite-button <-- pattern-card <-- gallery (patterns)
// favorite-button <-- pattern-card <-- favorites


export default Ember.Component.extend({
  tagName: 'span',
  auth: Ember.inject.service(),
  store: Ember.inject.service(),
  classNameBindings: ['isFavorite'],
  isFavorite: Ember.computed.bool('pattern.currentUserFavorite'),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
  actions: {
    toggleFavorite() {
      let favorite = this.get('favorite');
      if (favorite) {
        favorite.destroyRecord()
        .catch(() => {
          this.get('flashMessages').danger('There was an error. Please try again.');
        })
        ;
      }
      else {
        let favorite = this.get('store').createRecord('favorite', {
          pattern: this.get('pattern'),
        });
        favorite.save()
        .catch(() => {
          this.get('flashMessages').danger('There was an error. Please try again.');
        })
        ;
      }
    }
  }

});
