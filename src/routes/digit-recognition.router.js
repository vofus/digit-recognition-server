const digitRecognitionRouter = require("express").Router();
const { recognize } = require("../api/digit-recognition.controller");

digitRecognitionRouter.post("/", async (req, res) => {
  console.log("recognition-router");

  try {
    const { inputs } = req.body;
    const result = await recognize(inputs);

    return res.send({ result });
  } catch (e) {
    return res.status(400).send({ code: 400, message: e.message });
  }
});

module.exports = digitRecognitionRouter;
