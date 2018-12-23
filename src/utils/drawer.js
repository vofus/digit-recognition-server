const { createCanvas } = require("canvas");
const { centerImage, getBoundingRectangle, imageDataToGrayscale } = require("./imageUtils");

const WIDTH = 280;
const HEIGHT = 280;

class Drawer {
  constructor() {
    this.canvas = createCanvas(WIDTH, HEIGHT);
    this.context = this.canvas.getContext("2d");
  }

  /**
   * Отрисовываем путь
   * @param path
   * @param width
   */
  drawPath(path, width = 20) {
    this.context.beginPath();
    this.context.lineWidth = width;
    this.context.lineCap = "round";
    this.context.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
      if (Boolean(path[i])) {
        this.context.lineTo(path[i].x, path[i].y);
        this.context.stroke();
      }
    }
  }

  /**
   * Очищаем Canvas
   */
  clear() {
    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, WIDTH, HEIGHT);
  }

  /**
   * Возвращаем массив, подготовленный к распознаванию
   * @return {Array}
   */
  getPreparedData() {
    let imgData = this.context.getImageData(0, 0, WIDTH, HEIGHT);
    let grayscaleImg = imageDataToGrayscale(imgData);
    const boundingRectangle = getBoundingRectangle(grayscaleImg, 0.01);
    const trans = centerImage(grayscaleImg); // [dX, dY] to center of mass

    // copy image to hidden canvas, translate to center-of-mass, then
    // scale to fit into a 200x200 box (see MNIST calibration notes on
    // Yann LeCun's website)
    const canvasCopy = createCanvas(imgData.width, imgData.height);
    const copyCtx = canvasCopy.getContext("2d");
    const brW = boundingRectangle.maxX + 1 - boundingRectangle.minX;
    const brH = boundingRectangle.maxY + 1 - boundingRectangle.minY;
    const scaling = 190 / (brW > brH ? brW : brH);
    // scale
    copyCtx.translate(this.canvas.width / 2, this.canvas.height / 2);
    copyCtx.scale(scaling, scaling);
    copyCtx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    // translate to center of mass
    copyCtx.translate(trans.transX, trans.transY);

    copyCtx.drawImage(this.context.canvas, 0, 0);

    // now bin image into 10x10 blocks (giving a 28x28 image)
    imgData = copyCtx.getImageData(0, 0, WIDTH, HEIGHT);
    grayscaleImg = imageDataToGrayscale(imgData);

    const nnInput = new Array(784);
    const nnInput2 = [];

    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        let mean = 0;

        for (let v = 0; v < 10; v++) {
          for (let h = 0; h < 10; h++) {
            mean += grayscaleImg[(y * 10) + v][(x * 10) + h];
          }
        }

        mean = (1 - (mean / 100)); // average and invert
        nnInput[(x * 28) + y] = (mean - 0.5) / 0.5;
      }
    }


    // for visualization/debugging: paint the input to the neural net.
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(copyCtx.canvas, 0, 0);

    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        const block = this.context.getImageData(x * 10, y * 10, 10, 10);
        const newVal = 255 * (0.5 - (nnInput[(x * 28) + y] / 2));
        nnInput2.push(Math.round((255 - newVal) / 255 * 100) / 100);
        for (let i = 0; i < 4 * 10 * 10; i += 4) {
          block.data[i] = newVal;
          block.data[i + 1] = newVal;
          block.data[i + 2] = newVal;
          block.data[i + 3] = 255;
        }
        this.context.putImageData(block, x * 10, y * 10);
      }
    }

    return nnInput2;
  }
}

module.exports = {
  Drawer
};
