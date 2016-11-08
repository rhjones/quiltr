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
    toggleFavorite(pattern) {
      if (pattern.get('isFavorite')) {
        let currentFavorite = pattern.get('currentFavorite');
        currentFavorite.deleteRecord();
        currentFavorite.save();
      }
      else {
        let favorite = this.get('store').createRecord('favorite', {
          pattern: pattern
        });
        favorite.save();
      } 
    },
    createNewProject(pattern) {
      this.transitionTo('newproject', pattern);
    },
  }
});
