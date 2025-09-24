const fs = require("fs");
const p = "dist/client/index.mjs";
let s = fs.readFileSync(p, "utf8");

// 1) ensure "use client";
if (!s.startsWith('"use client";')) s = '"use client";\n' + s;

// 2) add extension for ESM strict resolvers
s = s.replace(/from\s+['"]\.\.\/DocClient['"];/, "from '../DocClient.mjs';");

fs.writeFileSync(p, s);
console.log("[patch-client-entry] Patched", p);