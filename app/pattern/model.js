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
  currentUserFavorites: Ember.computed.filterBy('favorites', 'isFavoritedByCurrentUser', true),
  currentFavorite: Ember.computed('currentUserFavorites', function() {
    return this.get('currentUserFavorites').objectAt(0);
  }),
  isFavorite: Ember.computed('currentUserFavorites', function() {
    if (this.get('currentUserFavorites').length > 0) {
      return true;
    } else {
      return false;
    }
  }),
});
