import Ember from 'ember';


// project-form <-- newproject

export default Ember.Component.extend({
  project: {
    name: null,
    notes: null,
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
      let newProject = {
        name: this.get('project.name'),
        startDate: new Date(this.$('#startDate').val()),
        finishDate: new Date(this.$('#finishDate').val()),
        finished: this.$('#finished').val(),
        notes: this.get('project.notes'),
        pattern: this.get('pattern'),
      };
      console.log(newProject);
      this.sendAction('storeNewProject', newProject);
    }
  }
});
