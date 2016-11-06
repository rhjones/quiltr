import Ember from 'ember';

export default Ember.Route.extend({
  model (params) {
    return this.get('store').findRecord('pattern', params.pattern_id);
  },
  actions: {
    toggleFavorite(pattern) {
      console.log('inside pattern/route');
      console.log(pattern.get('id'));
      console.log('favorite inside pattern/route is', pattern.get('currentFavorite'));
      // this.get('store').createRecord('favorite', {
      //   pattern: pattern
      // });
      console.log('isFavorite', pattern.get('isFavorite'));
      if (pattern.get('isFavorite')) {
        let currentFavorite = pattern.get('currentFavorite');
        console.log('currentFavorite is', currentFavorite);
        currentFavorite.deleteRecord();
        currentFavorite.save();
        console.log('successfully deleted favorite');
      }
      else {
        let favorite = this.get('store').createRecord('favorite', {
          pattern: pattern
        });
        favorite.save();
      }
      
    }
  }
});
