import Ember from 'ember';


// project-form <-- newproject
// project-form <-- project/edit

export default Ember.Component.extend({
  project: {
    name: null,
    notes: null,
  },
  classNames: ['project-form'],
  // didInsertElement() {
  //   // use jQuery UI datepicker in browsers that don't handle HTML5 date inputs 
  //   let testInput = document.createElement('input');
  //   testInput.setAttribute('type', 'date');
  //   if ( testInput.type === 'text' ) {
  //      this.$('#startDate').datepicker();
  //      this.$('#finishDate').datepicker();
  //   }
  // },
  actions: {
    saveProject() {
      let start = this.$('#startDate').val();
      let finish = this.$('#finishDate').val();
      let startDate = start ? new Date(start) : '';
      let finishDate = finish ? new Date(finish) : '';
      if(this.get('project.id')) {
        this.get('project').set('startDate', startDate);
        this.get('project').set('finishDate', finishDate);
        this.get('project').set('finished', this.$('#finished').val());
        this.sendAction('updateProject', this.get('project'));
      } else {
        let newProject = {

          name: this.get('project.name'),
          startDate: startDate,
          finishDate: finishDate,
          finished: this.$('#finished').val(),
          notes: this.get('project.notes'),
          pattern: this.get('pattern'),
        };
        console.log(newProject);
        this.sendAction('storeNewProject', newProject);
      }
      
    }
  }
});
