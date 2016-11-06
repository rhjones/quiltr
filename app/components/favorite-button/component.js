import Ember from 'ember';

// favorite-button <-- pattern-card <-- gallery (patterns)
// favorite-button <-- pattern
export default Ember.Component.extend({
  auth: Ember.inject.service(),
  tagName: 'span',
  classNameBindings: ['isFavorite'],
  isFavorite: Ember.computed.alias('pattern.isFavorite'),
  currentFavorite: Ember.computed.alias('pattern.currentFavorite'),
  actions: {
    toggleFavorite() {
      console.log('inside of favorite-button component');
      console.log(this.get('pattern'));
      if (this.get('isFavorite')) {
        console.log('favorited!');
        console.log('current fave is', this.get('currentFavorite'));
      } 
      this.sendAction('toggleFavorite', this.get('pattern'));
    }
  }

});
