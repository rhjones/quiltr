import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  svg: DS.attr('string'),
  colors: DS.attr('number'),
  quiltSize: DS.attr('string'),
  blockSize: DS.attr('number'),
  colorScheme: DS.attr('string'),
  projects: DS.hasMany('project'),
  favorites: DS.hasMany('favorite'),
  currentUserFavorite: Ember.computed('favorites.@each.belongsToCurrentUser', function() {
    // shortcut to the specific favorite attached to this pattern that belongs to the current user
    // used to toggle favorite throughout app
    return this.get('favorites').filterBy('belongsToCurrentUser', true).objectAt(0);
  }),
  isFavoriteOfCurrentUser: Ember.computed.bool('currentUserFavorite'),
});
