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
      ;
    }
  },
  actions: {
    storeNewProject(newProject) {
      let project = this.get('store').createRecord('project', newProject);
      project.save()
      .then((project) => {
        this.transitionTo('project', project);
      });
    },
  }
});
