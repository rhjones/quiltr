import DS from 'ember-data';

export default DS.Model.extend({
  email: DS.attr('string'),
  username: DS.attr('string'),
  favorites: DS.hasMany('favorites'),
  projects: DS.hasMany('project'),
});
