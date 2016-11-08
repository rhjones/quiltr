import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  notes: DS.attr('string'),
  startDate: DS.attr('date'),
  finishDate: DS.attr('date'),
  finished: DS.attr('boolean'),
  pattern: DS.belongsTo('pattern'),
  user: DS.belongsTo('user'),
  projectUploads: DS.hasMany('projectUpload'),
});
