import Ember from 'ember';

// project --> project-photo
// project --> project-delete-button
// project --> project-upload-form

// project --> pattern-card

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
      return this.get('uploads').saveUpload(data, '/project_uploads')
       .then(() => this.refresh()) 
       .catch((error) => console.error(error));
    },
    removePhoto(photo) {
      let currentPhoto = photo;
        currentPhoto.deleteRecord();
        currentPhoto.save()
        .then(() => {
          this.get('flashMessages').success('Photo deleted.');
        });
    },
    deleteProject(project) {
      project.deleteRecord();
      project.save()
      .then(() => this.transitionTo('projects'))
      .then(() => this.get('flashMessages').success('Project deleted.'))
      .catch(() => this.get('flashMessages').danger('There was a problem. Please try again.'));
    }
  }
});
