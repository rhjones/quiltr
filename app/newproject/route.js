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
  actions: {
    storeNewProject(newProject) {
      console.log('inside newproject/route');
      console.log(newProject);
      let project = this.get('store').createRecord('project', newProject);
      project.save()
      .then((project) => {
        console.log('saved project');
        this.transitionTo('project', project);
      });
    },
  }
});
