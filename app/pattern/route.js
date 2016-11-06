import Ember from 'ember';

export default Ember.Route.extend({
  model (params) {
    return this.get('store').findRecord('pattern', params.pattern_id);
  },
  actions: {
    clickme(pattern) {
      console.log('inside of pattern');
      console.log('pattern is', pattern);
    }
  }
});
