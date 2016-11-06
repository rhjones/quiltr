import Ember from 'ember';

// pattern-card <-- patterns
export default Ember.Component.extend({

  actions: {
    clickme() {
      console.log('inside of pattern-card component clickme()');
      console.log(this.get('pattern'));
      this.sendAction('clickme', this.get('pattern'));
    }
  }
});
