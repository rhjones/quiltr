import Ember from 'ember';

// store-pattern <-- generate

export default Ember.Component.extend({
  classNames: ['store-pattern'],
  auth: Ember.inject.service(),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
  quiltrFabric: Ember.inject.service(),
  actions: {
    storeAndFavoritePattern() {
      console.log('store and favorite pattern');
      let patternData = this.get('quiltrFabric').patternData;
      console.log(patternData);

      // this.sendAction('storeAndFavoritePattern', svgString);
    },
  },
});
