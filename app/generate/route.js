import Ember from 'ember';

export default Ember.Route.extend({
  quiltrFabric: Ember.inject.service(),
  actions: {
    generatePattern() {
      this.get('quiltrFabric').generatePattern();
      Ember.$('.store-pattern').show();
    },
    storeAndFavoritePattern(patternData) {
      // creating a new pattern automatically creates a favorite in Rails
      let newPattern = this.get('store').createRecord('pattern', patternData);
      let savedPattern = newPattern.save();
      this.transitionTo('pattern', savedPattern);
    }
  },
        
});
