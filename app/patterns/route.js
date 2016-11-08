import Ember from 'ember';

// patterns --> pattern-card --> pattern-canvas
// patterns --> pattern-card --> favorite-button
// patterns --> pattern-card --> make-button

export default Ember.Route.extend({
  model () {
    return this.get('store').findAll('pattern');
  },
});
