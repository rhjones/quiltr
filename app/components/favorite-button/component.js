import Ember from 'ember';

// favorite-button <-- pattern-card <-- gallery (patterns)
// favorite-button <-- pattern
export default Ember.Component.extend({
  tagName: 'span',
  classNameBindings: ['isFavorite'],
  isFavorite: Ember.computed.alias('pattern.isFavorite'),
  currentFavorite: Ember.computed.alias('pattern.currentFavorite'),
  auth: Ember.inject.service(),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
  actions: {
    toggleFavorite() {
      // TODO if not authenticated, force sign in & then continue
      this.sendAction('toggleFavorite', this.get('pattern'));
    }
  }

});
