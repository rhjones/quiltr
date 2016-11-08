import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    deleteProject() {
      this.sendAction('deleteProject', this.get('project'));
    }
  }
});
