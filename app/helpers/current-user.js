import Ember from 'ember';

export default Ember.Helper.extend({
  auth: Ember.inject.service(),
  compute(params) {
    // expects a user id as the only param
    let auth = this.get('auth');
    return parseInt(auth.get('credentials.id'), 10) === parseInt(params[0], 10);
  },
});
