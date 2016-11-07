import Ember from 'ember';

// project --> pattern-card
export default Ember.Route.extend({
  model (params) {
    return this.get('store').findRecord('project', params.project_id);
  },
  afterModel(model) {
    return model.get('pattern');
  }
});
