import Ember from 'ember';

// pattern-card <-- patterns
// pattern-card <-- favorites
export default Ember.Component.extend({

  actions: {
    toggleFavorite() {
      this.sendAction('toggleFavorite', this.get('pattern'));
    }
  }
});
