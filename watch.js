/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const { spawn } = require("child_process");
const chokidar = require("chokidar");

function build() {
  // noinspection JSCheckFunctionSignatures
  const process = spawn("npm", ["run", "--silent", "build-minified"], { stdio: "inherit" });
  process.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Done");
    } else {
      console.log("❌ Error");
    }
  });
}

console.log("👷 Building");
build();

chokidar.watch("src/*", { ignoreInitial: true }).on("all", (event, path) => {
  console.log(`👷 File ${path} changed, rebuilding`);
  build();
});

require("./serve");
