import Ember from 'ember';

export default Ember.Service.extend({
  ajax: Ember.inject.service(),

  saveUpload (data, endpoint) {
    return this.get('ajax').post(endpoint, {
      data,
      contentType: false,
      processData: false,
    });
  },
});
