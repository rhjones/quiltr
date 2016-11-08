import Ember from 'ember';

export default Ember.Route.extend({
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
    updateProject(project) {
      project.save()
      .then((project) => {
        this.transitionTo('project', project);
      });
    },
  },
});
