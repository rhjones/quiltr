import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['canvas-container'],

  didInsertElement() {
    this._super(...arguments);
    // let container = this.$();
    // let vanilla = document.getElementsByClassName('canvas-container')[0];
    // console.log('container', container);
    // console.log('container.height', container.height());
    // console.log('vanilla', vanilla);
    // console.log('vanilla.height', vanilla.height);
    // let canvas = this.$('#canvas');
    // console.log('canvas', canvas);
    // resizeCanvas.resize(container, canvas);
  },
});
