import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'form',

  credentials: {},

  didInsertElement() {
    this.$().parents('.main').addClass('welcome');
  },

  willDestroyElement() {
    Ember.$('.main').removeClass('welcome');
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
