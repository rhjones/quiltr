import Ember from 'ember';

// project-photo --> project
export default Ember.Component.extend({
  actions: {
    removePhoto() {
      this.sendAction('removePhoto', this.get('photo'));
    }
  }
});
