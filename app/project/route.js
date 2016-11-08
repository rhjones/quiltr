import Ember from 'ember';

// project --> pattern-card
// project --> project-photo
export default Ember.Route.extend({
  uploads: Ember.inject.service(),
  model (params) {
    return this.get('store').findRecord('project', params.project_id);
  },
  afterModel(model) {
    return Ember.RSVP.hash({
      projectUploads: model.get('projectUploads'),
      pattern: model.get('pattern'),
    });
  },
  actions: {
    uploadPhoto(data) {
      console.log('inside project/route');
      console.log(data.get('project_upload[photo]'));
      return this.get('uploads').saveUpload(data, '/project_uploads')
      // revisit this: want to stay on project page with photo
       // .then(() => this.transitionTo('projects')) 
       .catch((error) => console.error(error));
    },
    removePhoto(photo) {
      console.log('inside of project/route');
      console.log(photo);
      let currentPhoto = photo;
        currentPhoto.deleteRecord();
        currentPhoto.save()
        .then(() => {
          this.get('flashMessages').success('Photo deleted.');
        });
    },
  }
});
