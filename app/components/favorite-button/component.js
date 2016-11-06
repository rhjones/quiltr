import Ember from 'ember';

// favorite-button <-- pattern-card <-- gallery
// favorite-button <-- pattern
export default Ember.Component.extend({
  auth: Ember.inject.service(),
  tagName: 'span',
  classNameBindings: ['isFavorite'],
  isFavorite: Ember.computed.alias('pattern.isFavorite'),
  actions: {
    clickme() {
      console.log('inside of favorite-button component');
      console.log(this.get('pattern'));
      this.sendAction('clickme', this.get('pattern'));
    }
  }

});
