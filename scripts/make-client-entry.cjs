const fs = require("fs");
const p = "dist/client/index.mjs";
let s = fs.readFileSync(p, "utf8");

// insère la directive si elle n'est pas déjà en 1ère ligne
if (!s.startsWith('"use client";')) {
  s = '"use client";\n' + s;
  fs.writeFileSync(p, s);
  console.log('[ensure-use-client] added "use client" to', p);
} else {
  console.log('[ensure-use-client] already present in', p);
}