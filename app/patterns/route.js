import Ember from 'ember';

export default Ember.Route.extend({
  model () {
    return this.get('store').findAll('pattern');
  },
  actions: {
    clickme(pattern) {
      console.log('inside of patterns');
      console.log('pattern is', pattern);
    }
  }
});
