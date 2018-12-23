const digitRecognitionRouter = require("express").Router();
const { recognize } = require("../api/digit-recognition.controller");
const { Drawer } = require("../utils/drawer");
let drawer = null;

digitRecognitionRouter.post("/", async (req, res) => {
  try {
    const { inputs } = req.body;
    const result = await recognize(inputs);

    return res.send({ result });
  } catch (e) {
    return res.status(400).send({ code: 400, message: e.message });
  }
});

digitRecognitionRouter.post("/from_path", async (req, res) => {
  try {
    const { path, width } = req.body;

    if (!Boolean(drawer)) {
      drawer = new Drawer();
    }

    drawer.clear();
    drawer.drawPath(path, width);
    const inputs = drawer.getPreparedData();

    const result = await recognize(inputs);

    return res.send({ result });
  } catch (e) {
    return res.status(400).send({ code: 400, message: e.message });
  }
});

module.exports = digitRecognitionRouter;
