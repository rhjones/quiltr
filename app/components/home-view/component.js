import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement() {
    this.$().parents('.main').addClass('welcome');
  },

  willDestroyElement() {
    Ember.$('.main').removeClass('welcome');
  },
});
