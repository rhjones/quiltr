import Ember from 'ember';

export function initialize() {
  Ember.TextField.reopen({
    classNames: ['form-control'],
  });
}

export default {
  name: 'text-field',
  initialize,
};
