import Ember from 'ember';

export default Ember.Route.extend({
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
