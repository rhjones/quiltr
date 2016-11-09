import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'form',

  credentials: {},

  didInsertElement() {
    this.$().parents('#app-wrapper').addClass('welcome');
  },

  willDestroyElement() {
    Ember.$('#app-wrapper').removeClass('welcome');
  },

  actions: {
    submit () {
      this.sendAction('submit', this.get('credentials'));
    },

    reset () {
      this.set('credentials', {});
    },
  },
});
