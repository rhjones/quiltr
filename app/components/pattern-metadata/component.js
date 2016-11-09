import Ember from 'ember';

// pattern-metadata <-- pattern
// pattern-metadata <-- pattern-card <-- patterns | favorites | projects

export default Ember.Component.extend({
  tagName: 'p',
  plural: Ember.computed('pattern.colors', function() {
    return this.get('pattern.colors') > 1 ? 's' : '';
  })
});
