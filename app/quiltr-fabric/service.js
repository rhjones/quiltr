import Ember from 'ember';
/*global fabric*/

export default Ember.Service.extend({
  schemeKeys: ['neon', 'wes', 'pool'],
  colorSchemes: {
    2: {
      neon: ['rgba(112,141,145,1)'],
      pool: ['rgba(5,131,156,1)'],
      wes: ['rgba(154,50,0,1)'],
    },
    3: {
      neon: ['rgba(0,255,200,1)', 'rgba(176,255,5,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(5,131,156,1)'],
      wes: ['rgba(190,168,28,1)', 'rgba(154,50,0,1)']
    },
    4: {
      neon: ['rgba(0,255,200,1)', 'rgba(255,179,0,1)', 'rgba(176,255,5,1)', 'rgba(255,0,102,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(202,196,208,1)', 'rgba(182,241,29,1)', 'rgba(5,131,156,1)'],
      wes: ['rgba(190,168,28,1)', 'rgba(123,136,95,1)', 'rgba(83,143,105,1)', 'rgba(154,50,0,1)']
    },
    5: {
      neon: ['rgba(0,255,200,1)', 'rgba(255,179,0,1)', 'rgba(176,255,5,1)', 'rgba(255,0,102,1)', 'rgba(112,141,145,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(251,246,40,1)', 'rgba(202,196,208,1)', 'rgba(182,241,29,1)', 'rgba(5,131,156,1)'],
      wes: ['rgba(190,168,28,1)', 'rgba(123,136,95,1)', 'rgba(83,143,105,1)', 'rgba(59,70,59,1)', 'rgba(154,50,0,1)']
    },
  },
  sizes: {
    lap: {
      width: 36,
      height: 36,
    },
    twin: {
      width: 66,
      height: 96,
    },
    full: {
      width: 84,
      height: 96,
    },
    queen: {
      width: 90,
      height: 96,
    },
    king: {
      width: 102,
      height: 96,
    },
  },
  square(x, y, fillColor, patternBlockSize) {
    return new fabric.Rect({
      left: x,
      top: y,
      fill: fillColor,
      width: patternBlockSize,
      height: patternBlockSize,
    });
  },
  hstTopLeft(x, y, fillColor, patternBlockSize) {
    let path = new fabric.Path(`M ${x} ${y} L ${x + patternBlockSize} ${y} L ${x} ${y + patternBlockSize} z`);
    path.set({ fill: fillColor });
    return path;
  },
  hstTopRight(x, y, fillColor, patternBlockSize) {
    let path = new fabric.Path(`M ${x} ${y} L ${x + patternBlockSize} ${y} L ${x + patternBlockSize} ${y + patternBlockSize} z`);
    path.set({ fill: fillColor });
    return path;
  },
  hstBottomLeft(x, y, fillColor, patternBlockSize) {
    let path = new fabric.Path(`M ${x} ${y} L ${x + patternBlockSize} ${y + patternBlockSize} L ${x} ${y + patternBlockSize} z`);
    path.set({ fill: fillColor });
    return path;
  },
  hstBottomRight(x, y, fillColor, patternBlockSize) {
    let path = new fabric.Path(`M ${x + patternBlockSize} ${y} L ${x + patternBlockSize} ${y + patternBlockSize} L ${x} ${y + patternBlockSize} z`);
    path.set({ fill: fillColor });
    return path;
  },
  calculateDimensions(quiltSize, blockSize) {
    let quiltWidth = this.get('sizes')[quiltSize].width;
    let quiltHeight = this.get('sizes')[quiltSize].height;
    let columns = quiltWidth / blockSize;
    let rows = quiltHeight / blockSize;
    let dimensions = {
      quiltWidth: quiltWidth,
      quiltHeight: quiltHeight, 
      columns: columns, 
      rows: rows,
    };
    return dimensions;
  },
  getColorScheme(colors) {
    let schemeKey = this.get('schemeKeys')[Math.floor((this.get('schemeKeys').length * Math.random()) * 1)];
    return this.get('colorSchemes')[colors][schemeKey];
  },
  getPatternParams() {
    let quiltSize = Ember.$("input:radio[name='quiltSize']:checked").val();
    let colors = Ember.$("input:radio[name='colors']:checked").val();
    let blockSize = Ember.$("input:radio[name='blockSize']:checked").val();
    console.log('quiltSize', quiltSize);
    console.log('colors', colors);
    console.log('blockSize', blockSize);

    this.prepForDrawing(quiltSize, colors, blockSize);
  },
  prepForDrawing(quiltSize, colors, blockSize) {
    let dimensions = this.calculateDimensions(quiltSize, blockSize);
    let colorScheme = this.getColorScheme(colors);

    console.log('inside drawPattern');
    console.log('quiltWidth', dimensions.quiltWidth);
    console.log('quiltHeight', dimensions.quiltHeight);
    console.log('columns', dimensions.columns);
    console.log('rows', dimensions.rows);
    console.log('colorScheme is', colorScheme);

    // set up canvas & patternBlockSize
    let patternCanvas = new fabric.StaticCanvas('canvas');
    let container = Ember.$('.canvas-container');
    let canvasWidth = container.width();
    let patternBlockSize = canvasWidth / dimensions.columns; 
    let canvasHeight = patternBlockSize * dimensions.rows;
    patternCanvas.setDimensions({ width: canvasWidth, height: canvasHeight});

    this.drawPattern(patternCanvas, dimensions, colorScheme, patternBlockSize);
  },
  drawPattern(patternCanvas, dimensions, colorScheme, patternBlockSize) {
    console.log('drawing pattern!');
    let x = 0;
    let y = 0;

    let blockTypes = [this.square, this.hstTopLeft, this.hstTopRight, this.hstBottomLeft, this.hstBottomRight];

    for (let i = 0; i < dimensions.rows; i++) {
      for (let j = 0; j < dimensions.columns; j++) {
        let block = blockTypes[Math.floor(Math.random() * blockTypes.length)];
        // switch (block) {
        //   case blockTypes[0]:
        //     squares++
        //     break;
        //   case blockTypes[1]:
        //     hstsTL++;
        //     hsts++;
        //     break;
        //   case blockTypes[2]:
        //     hstsTR++;
        //     hsts++;
        //     break;
        //   case this.blockTypes[3]:
        //     hstsBL++;
        //     hsts++;
        //     break;
        //   case this.blockTypes[4]:
        //     hstsBR++;
        //     hsts++;
        //     break;
        // }
        patternCanvas.add(block(x,y, 'red', patternBlockSize));
        x += patternBlockSize;
      }
      x = 0;
      y += patternBlockSize;
    }



    // patternCanvas.add(this.hstBottomLeft(x, y, 'red', patternBlockSize));
  },
  
  
  
});
