const chokidar = require('chokidar');
const esbuild = require('esbuild');
const { glsl } = require('esbuild-plugin-glsl');

// esbuild
chokidar
  .watch(['src/*.{js,ts,glsl,frag,vert}', 'src/**/*.{js,ts,glsl,frag,vert}'])
  .on('all', async () => {
    try {
      await esbuild.build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        minify: false,
        outdir: 'dist',
        plugins: [glsl({ minify: true })],
      });
    } catch (_ex) {}
  });
