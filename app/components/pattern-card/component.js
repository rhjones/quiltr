import Ember from 'ember';

// pattern-card <-- patterns
export default Ember.Component.extend({

  actions: {
    toggleFavorite() {
      this.sendAction('toggleFavorite', this.get('pattern'));
    }
  }
});
