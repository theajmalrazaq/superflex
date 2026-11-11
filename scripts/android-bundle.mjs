import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const web = join(root, "android", "assets", "web");
const shimdir = join(root, "android", "shim");

function read(path) {
  return readFileSync(path, "utf8");
}

function stop(text) {
  console.error(text);
  process.exit(1);
}

function main() {
  const need = ["background.js", "content-scripts/content.js", "content-scripts/content.css", "bridge.js"];
  for (const item of need) {
    if (!existsSync(join(dist, item))) stop("Missing " + item + ". Run the wxt build first.");
  }
  const version = JSON.parse(read(join(root, "package.json"))).version;
  const shim = read(join(shimdir, "shim.js")).replace("__VERSION__", version);
  const tail = read(join(shimdir, "tail.js"));
  const bg = read(join(dist, "background.js"));
  const ct = read(join(dist, "content-scripts", "content.js"));

  const parts = [
    "(function(){",
    'if(location.origin!=="https://flexstudent.nu.edu.pk"||window.__superflex)return;',
    "window.__superflex=true;",
    shim,
    "(function(chrome,fetch){",
    bg,
    "\n})(bgchrome,remotefetch);",
    "(function(chrome){",
    ct,
    "\n})(ctchrome);",
    tail,
    "})();",
  ];

  rmSync(web, { recursive: true, force: true });
  mkdirSync(web, { recursive: true });
  writeFileSync(join(web, "superflex.js"), parts.join("\n"));
  cpSync(join(dist, "content-scripts", "content.css"), join(web, "content.css"));
  cpSync(join(dist, "bridge.js"), join(web, "bridge.js"));
  cpSync(join(dist, "reviews.json"), join(web, "reviews.json"));
  cpSync(join(dist, "assets"), join(web, "assets"), { recursive: true });
  writeFileSync(join(web, "early.js"), read(join(shimdir, "early.js")));
  writeFileSync(join(web, "main.js"), read(join(shimdir, "main.js")));
  console.log("Android web bundle ready in " + web);
}

main();
