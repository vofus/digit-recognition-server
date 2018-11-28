const apiRouter = require("express").Router();
const digitRecognitionRouter = require("./digit-recognition.router");

console.log("router");
apiRouter.use("/recognition", digitRecognitionRouter);

module.exports = apiRouter;
