import Ember from 'ember';

// project-photo --> project
export default Ember.Component.extend({
  actions: {
    removePhoto() {
      console.log('clicked delete');
      this.sendAction('removePhoto', this.get('photo'));
    }
  }
});
