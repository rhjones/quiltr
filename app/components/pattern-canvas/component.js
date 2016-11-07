import Ember from 'ember';
/*global fabric*/

// pattern-canvas <-- generate
// pattern-canvas <-- pattern

export default Ember.Component.extend({
  classNames: ['canvas-container'],
  quiltrFabric: Ember.inject.service(),
  didRender() {
    if(this.get('pattern')) {
      let patternCanvas = new fabric.StaticCanvas(canvas);
      let svgString = this.get('pattern.svg');
      // set canvas width & height based on pattern data
      let dimensions = this.get('quiltrFabric').calculateDimensions(this.get('pattern.quiltSize'), this.get('pattern.blockSize'));

      // set up canvas size for appopriate scaling
      let container = Ember.$('.canvas-container');
      let canvasWidth = container.width();
      let patternBlockSize = canvasWidth / dimensions.columns; 
      let canvasHeight = patternBlockSize * dimensions.rows;
      patternCanvas.setDimensions({ width: canvasWidth, height: canvasHeight});
      fabric.loadSVGFromString(this.get('pattern.svg'), function(objects, options) {
        let obj = fabric.util.groupSVGElements(objects, options);
        obj.set({
          top: 0,
          left: 0,
          scaleY: patternCanvas.height / obj.height,
          scaleX: patternCanvas.width / obj.width
        });
        patternCanvas.add(obj).renderAll();
      });
    }
    
  },
});
