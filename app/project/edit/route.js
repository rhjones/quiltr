import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),
  flashMessages: Ember.inject.service(),
  beforeModel() {
    if (!this.get('auth.credentials.token')) {
      this.transitionTo('sign-in')
      .then(() => {
        this.get('flashMessages')
        .warning('You must sign in to access that page.');
      })
    }
  },
  model (params) {
    return this.get('store').findRecord('project', params.project_id);
  },
  afterModel(model) {
    if (parseInt(this.get('auth.credentials.token'), 10) !== parseInt(model.get('user.id'), 10)) {
      this.transitionTo('projects')
      .then(() => {
        this.get('flashMessages')
        .warning('You can only edit projects you created.');
      })
    }
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
