import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['delete-button'],
  actions: {
    deleteProject() {
      this.sendAction('deleteProject', this.get('project'));
    }
  }
});
