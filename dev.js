const browserSync = require("browser-sync");
const chokidar = require("chokidar");
const fs = require("fs");
const fsp = fs.promises;
const esbuild = require("esbuild");
const { glsl } = require("esbuild-plugin-glsl");

// esbuild
chokidar
  .watch(["src/*.{js,ts,glsl,frag,vert}", "src/**/*.{js,ts,glsl,frag,vert}"])
  .on("all", async () => {
    try {
      await esbuild.build({
        entryPoints: ["src/index.ts"],
        bundle: true,
        minify: false,
        outdir: "dist",
        plugins: [glsl({ minify: true })],
      });
    } catch (_ex) {}
  });

// passthrough-copy static files
chokidar
  .watch(["src/*.html", "src/*.css", "src/*.png"])
  .on("all", async (event, path) => {
    const exists = fs.existsSync("dist");
    if (!exists) {
      try {
        await fsp.mkdir("dist");
      } catch (ex) {
        console.error("ERROR", ex.message);
        return;
      }
    }
    const destination = path.replace(/^src/, "dist");
    console.log(`[${event}] ${path} => ${destination}`);
    try {
      if (event === "change" || event === "add") {
        await fsp.copyFile(path, destination);
      }
      if (event === "unlink") {
        await fsp.unlink(destination);
      }
    } catch (ex) {
      console.error("ERROR: ", ex.message);
    }
  });

browserSync({
  server: "dist",
  files: ["dist/*.html", "dist/*.css", "dist/*.js"],
});
