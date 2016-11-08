import Ember from 'ember';

// export function currentUser(params/*, hash*/) {
//   // expects a user id
//   // auth: Ember.inject.service();
//   // let 
//   let ownerId = params[0];
//   // return ownerId === Ember.inject.service('auth').credentials.id;
//   return Ember.inject.service('auth').credentials.username;

// }

export default Ember.Helper.extend({
  auth: Ember.inject.service(),

  compute(params, hash) {
    // expects a user id as the only param
    let auth = this.get('auth');
    console.log('auth user it', auth.get('credentials.id'));
    return parseInt(auth.get('credentials.id'), 10) === parseInt(params[0], 10);
  },
});
