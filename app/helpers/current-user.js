import Ember from 'ember';

export default Ember.Helper.extend({
  auth: Ember.inject.service(),
  compute(params, hash) {
    // expects a user id as the only param
    let auth = this.get('auth');
    console.log('auth user it', auth.get('credentials.id'));
    return parseInt(auth.get('credentials.id'), 10) === parseInt(params[0], 10);
  },
});
