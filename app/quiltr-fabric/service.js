import Ember from 'ember';
/*global fabric*/

export default Ember.Service.extend({
  patternData: {},
  colorSchemes: [
    {
      neon: ['rgba(112,141,145,1)'],
      pool: ['rgba(5,131,156,1)'],
      greenAndOrange: ['#f1081f'],
    },
    {
      neon: ['rgba(0,255,200,1)', 'rgba(176,255,5,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(5,131,156,1)'],
      greenAndOrange: ['#f1081f', '#fa564d']
    },
    {
      neon: ['rgba(0,255,200,1)', 'rgba(176,255,5,1)', 'rgba(255,0,102,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(202,196,208,1)', 'rgba(182,241,29,1)'],
      greenAndOrange: ['#f1081f', '#fa564d', '#77e401']
    },
    {
      neon: ['rgba(0,255,200,1)', 'rgba(255,179,0,1)', 'rgba(176,255,5,1)', 'rgba(255,0,102,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(202,196,208,1)', 'rgba(182,241,29,1)', 'rgba(5,131,156,1)'],
      greenAndOrange: ['#f1081f', '#fa564d', '#77e401', '#08ad28'],
    },
    {
      neon: ['rgba(0,255,200,1)', 'rgba(255,179,0,1)', 'rgba(176,255,5,1)', 'rgba(255,0,102,1)', 'rgba(112,141,145,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(251,246,40,1)', 'rgba(202,196,208,1)', 'rgba(182,241,29,1)', 'rgba(5,131,156,1)'],
      greenAndOrange: ['#f1081f', '#fa564d', '#77e401', '#08ad28', '#fabc07'],
    },
  ],
  sizes: {
    lap: {
      width: 36,
      height: 36,
    },
    baby: {
      width: 36,
      height: 60,
    },
    twin: {
      width: 72,
      height: 96,
    },
    full: {
      width: 84,
      height: 96,
    },
    queen: {
      width: 96,
      height: 96,
    },
    king: {
      width: 108,
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
    console.log('inside calculate dimensions');
    console.log('quiltWidth', this.get('sizes')[quiltSize].width);
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
    let schemeKeys = Object.keys(this.get('colorSchemes')[0]);
    console.log('schemeKeys is', schemeKeys);
    // let schemeKey = this.get('schemeKeys')[Math.floor((this.get('schemeKeys').length * Math.random()) * 1)];
    let schemeKey = schemeKeys[Math.floor((schemeKeys.length * Math.random()) * 1)];
    this.get('patternData').colorScheme = schemeKey;
    return this.get('colorSchemes')[colors - 1][schemeKey];
  },
  generatePattern() {
    let quiltSize = Ember.$("input:radio[name='quiltSize']:checked").val();
    let colors = Ember.$("input:radio[name='colors']:checked").val();
    let blockSize = Ember.$("input:radio[name='blockSize']:checked").val();
    console.log('quiltSize', quiltSize);
    console.log('colors', colors);
    console.log('blockSize', blockSize);

    this.prepForDrawing(quiltSize, colors, blockSize);
  },
  prepForDrawing(quiltSize, colors, blockSize) {
    console.log('patternData is', this.get('patternData'));
    this.get('patternData').quiltSize = quiltSize;
    this.get('patternData').colors = colors;
    this.get('patternData').blockSize = blockSize;
    let dimensions = this.calculateDimensions(quiltSize, blockSize);
    let colorScheme = this.getColorScheme(colors);

    console.log('patternData is', this.get('patternData'));

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
    console.log('colorScheme', colorScheme);
    let x = 0;
    let y = 0;

    let blockTypes = {
      square: {
        block: this.square,
        color: colorScheme[0],
        count: 0,
      },
      hstTopLeft: {
        block: this.hstTopLeft,
        color: colorScheme[1] || colorScheme[0],
        count: 0,
      },
      hstTopRight: {
        block: this.hstTopRight,
        color: colorScheme[2] || colorScheme[Math.floor(Math.random()*2)] || colorScheme[0],
        count: 0,
      },
      hstBottomLeft: {
        block: this.hstBottomLeft,
        color: colorScheme[3] || colorScheme[Math.floor(Math.random()*3)] || colorScheme[0],
        count: 0,
      },
      hstBottomRight: {
        block: this.hstBottomRight,
        color: colorScheme[4] || colorScheme[Math.floor(Math.random()*4)] || colorScheme[0],
        count: 0,
      },
    };

    let blockKeys = Object.keys(blockTypes);
    console.log(blockKeys);

    for (let i = 0; i < dimensions.rows; i++) {
      for (let j = 0; j < dimensions.columns; j++) {
        let blockKey = blockKeys[Math.floor((blockKeys.length * Math.random()) * 1)];
        let blockType = blockTypes[blockKey];
        // let block = blockType.block;
        patternCanvas.add(blockType.block(x, y, blockType.color, patternBlockSize));
        blockTypes[blockKey].count++;
        x += patternBlockSize;
      }
      x = 0;
      y += patternBlockSize;
    }

    this.get('patternData').svg = patternCanvas.toSVG();
  },
});
