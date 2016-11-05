import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'form',
  classNames: ['form-horizontal'],

  passwords: {},

  actions: {
    submit () {
      this.sendAction('submit', this.get('passwords'));
    },

    reset () {
      this.set('passwords', {});
    },
  },
});
