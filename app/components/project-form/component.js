import Ember from 'ember';

export default Ember.Component.extend({
  project: {
    name: null,
  },
  didInsertElement() {
    // use jQuery UI datepicker in browsers that don't handle HTML5 date inputs 
    let testInput = document.createElement('input');
    testInput.setAttribute('type', 'date');
    if ( testInput.type === 'text' ) {
       this.$('#startDate').datepicker();
       this.$('#finishDate').datepicker();
    }
  },
  actions: {
    storeNewProject() {
      console.log('name', this.get('project.name'));
      console.log('startDate', this.$('#startDate').val());
      console.log('finishDate', this.$('#finishDate').val());
      console.log('finished', this.$('#finished').val());
      console.log('notes', this.get('project.notes'));
    }
  }
});
