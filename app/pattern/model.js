import DS from 'ember-data';

export default DS.Model.extend({
  svg: DS.attr('string'),
  colors: DS.attr('number'),
  quiltSize: DS.attr('string'),
  blockSize: DS.attr('number'),
});
