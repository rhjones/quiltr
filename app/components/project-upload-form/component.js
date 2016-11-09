import Ember from 'ember';

// project-upload <-- project
export default Ember.Component.extend({
  classNames: ['meta', 'photo-upload-meta'],
  actions: {
    uploadPhoto() {
      let data = new FormData(document.getElementById('project-upload-form'));
      this.sendAction('uploadPhoto', data);
    },
  }
});
