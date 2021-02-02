/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const app = express();
const port = 9094;

app.use("/", express.static("build"));
app.use("/devkit", express.static("devkit"));

app.listen(port, () => {
  console.log(
    `Server listening at http://localhost:${port}. Devkit: http://localhost:${port}/devkit`
  );
});
