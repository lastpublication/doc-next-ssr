const fs = require("fs");
fs.mkdirSync("dist/client", { recursive: true });

fs.writeFileSync(
  "dist/client/index.mjs",
  `"use client";
export * from "../src/DocClient.mjs";
export { default } from "../src/DocClient.mjs";
`
);

fs.writeFileSync(
  "dist/client/index.cjs",
  `"use client";
module.exports = require("../src/DocClient.cjs");
`
);
console.log("[postbuild] client wrapper -> src/DocClient.(mjs|cjs)");