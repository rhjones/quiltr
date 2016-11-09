import Ember from 'ember';

// pattern-card <-- patterns (gallery) 
// pattern-card <-- favorites
// pattern-card <-- project

// pattern-card --> make-button
// pattern-card --> favorite-button
// pattern-card --> pattern-canvas


export default Ember.Component.extend({
  plural: Ember.computed('pattern.colors', function() {
    return this.get('pattern.colors') > 1 ? 's' : '';
  })
});
