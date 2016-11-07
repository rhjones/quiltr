import Ember from 'ember';

// store-pattern <-- generate

export default Ember.Component.extend({
  classNames: ['store-pattern'],
  auth: Ember.inject.service(),
  isAuthenticated: Ember.computed.alias('auth.isAuthenticated'),
  actions: {
    storeAndFavoritePattern() {
      // store pattern IFF AUTHENTICATED
      console.log('store and favorite pattern');
    },
  },
});
