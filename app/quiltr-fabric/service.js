import Ember from 'ember';
/*global fabric*/

export default Ember.Service.extend({
  drawPattern() {
      console.log('drawing pattern!');
      let patternCanvas = new fabric.Canvas('canvas');
      
      console.log(patternCanvas);
    },
  getPatternParams() {
    let quiltSize = Ember.$("input:radio[name='quiltSize']:checked").val();
    let colors = Ember.$("input:radio[name='colors']:checked").val();
    let blockSize = Ember.$("input:radio[name='blockSize']:checked").val();
    console.log('quiltSize', quiltSize);
    console.log('colors', colors);
    console.log('blockSize', blockSize);

    this.drawPattern();
  },
});
