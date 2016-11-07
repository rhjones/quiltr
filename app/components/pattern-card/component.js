import Ember from 'ember';

// pattern-card <-- patterns
// pattern-card <-- favorites

// pattern-card --> make-button
// pattern-card --> favorite-button
// pattern-card --> pattern-canvas
export default Ember.Component.extend({

  actions: {
    toggleFavorite() {
      this.sendAction('toggleFavorite', this.get('pattern'));
    },
    createNewProject() {
      this.sendAction('createNewProject', this.get('pattern'));
    }
  }
});
