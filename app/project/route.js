import Ember from 'ember';

// project --> pattern-card
export default Ember.Route.extend({
  uploads: Ember.inject.service(),
  model (params) {
    return this.get('store').findRecord('project', params.project_id);
  },
  afterModel(model) {
    return model.get('pattern');
  },
  actions: {
    uploadPhoto(data) {
      console.log('inside project/route');
      console.log(data.get('project_upload[photo]'));
      return this.get('uploads').saveUpload(data, '/project_uploads')
      // revisit this: want to stay on project page with photo
       .then(() => this.transitionTo('projects')) 
       .catch((error) => console.error(error));
    }
  }
});
