import DS from 'ember-data';

export default DS.Model.extend({
  photoUrl: DS.attr('string'),
  project: DS.belongsTo('project'),
});
