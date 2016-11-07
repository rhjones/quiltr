import Ember from 'ember';

export default Ember.Route.extend({
  quiltrFabric: Ember.inject.service(),
  actions: {
    generatePattern() {
      this.get('quiltrFabric').generatePattern();
      Ember.$('.store-pattern').show();
    },
  },
});
