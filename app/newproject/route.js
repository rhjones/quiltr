import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    storeNewProject(newProject) {
      console.log('inside newproject/route');
      console.log(newProject);
      let project = this.get('store').createRecord('project', newProject);
      let savedProject = project.save();
      console.log('saved project', savedProject);
      // this.transitionTo('project', savedProject);
    },
  }
});
