import Ember from 'ember';

export default Ember.Route.extend({
  quiltrFabric: Ember.inject.service(),
  actions: {
    getPatternParams() {
      this.get('quiltrFabric').getPatternParams();
    }
  }
});
