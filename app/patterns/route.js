import Ember from 'ember';

export default Ember.Route.extend({
  model () {
    return this.get('store').findAll('pattern');
  },
  actions: {
    toggleFavorite(pattern) {
      console.log(pattern.get('id'));
      let favorite = this.get('store').createRecord('favorite', {
        pattern: pattern
      });
      favorite.save();
      console.log('inside of patterns');
      console.log('pattern is', pattern);
    }
  }
});
