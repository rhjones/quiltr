import Ember from 'ember';

// project-upload <-- project
export default Ember.Component.extend({
  classNames: ['meta', 'photo-upload-meta'],
  actions: {
    uploadPhoto() {
      console.log('submitted form to upload photo');
      let data = new FormData(document.getElementById('project-upload-form'));
      // let newPattern = this.get('newPattern');
      // newPattern.quiltSize = data.get('pattern[quiltSize]');
      // newPattern.upload = data.get('pattern[patternImage]');    
      console.log('data is', data);  
      console.log('photo is', data.get('project_upload[photo]'));
      this.sendAction('uploadPhoto', data);
      // clear input
      // this.set('newPhoto', null);
    },
  }
});
