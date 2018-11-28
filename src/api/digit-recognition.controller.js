const { Network, DigitRecognition } = require("digits-recognition-neural-network");
const path = require("path");
const modelPath = "../models/network.json";
let recognizer = null;

/**
 * Метод распознавания
 * @param inputs
 * @return {Promise<void>}
 */
async function recognize(inputs) {
  if (!Boolean(recognizer)) {
    const network = await Network.deserialize(path.resolve(__dirname, modelPath));
    recognizer = new DigitRecognition(network);
  }

  return recognizer.manualTest(inputs);
}

module.exports = {
  recognize
};
