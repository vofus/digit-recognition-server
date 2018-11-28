const express = require("express");
const bodyParser = require("body-parser");
const apiRouter = require("./routes");

const PORT = process.env.PORT || 3000;
const app = express();

try {
  app.use(bodyParser.json());
  app.use("/api", apiRouter);

  app.listen(PORT, () => {
    global.console.log(`Server started on ${PORT} port...`);
  });
} catch (e) {
  global.console.error(e);
}