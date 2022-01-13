import { BufferAttrib } from './webgl/buffer-attrib';
import { Renderer } from './webgl/renderer';
import { Shader, UniformVariable } from './webgl/shader';
import { Texture } from './webgl/texture';
import { TileSet } from './webgl/types';

import fragmentShader from './shaders/sprite.frag';
import vertexShader from './shaders/sprite.vert';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

class App {
  animationFrame = -1;
  shader = new Shader(fragmentShader, vertexShader);
  uniforms: Record<string, UniformVariable> = {};
  buffers: Record<string, BufferAttrib> = {
    position: new BufferAttrib('position', 4),
  };

  tileSets: Record<string, TileSet> = {
    sprites: {
      tileMap: new Texture('img/webgl-sprites.png'),
      tileMapSize: [128, 16],
      tileSize: 16,
      tilesPerRow: 8,
      numTiles: 8,
    },
    font: {
      tileMap: new Texture('img/font-8x8.png'),
      tileSize: 8,
      tilesPerRow: 8,
      numTiles: 256,
      tileMapSize: [256, 256],
    },
  };

  font = new Texture();
  zoom = 4;

  renderer = new Renderer(canvas);

  enableFeatures(gl: WebGL2RenderingContext) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  async init(): Promise<void> {
    const { renderer, shader } = this;
    this.enableFeatures(renderer.gl);
    shader.use(renderer.gl);
    const { sprites, font } = this.tileSets;

    await sprites.tileMap.load();
    await font.tileMap.load();

    sprites.tileMapSize = [sprites.tileMap.width, sprites.tileMap.height];
    font.tileMapSize = [font.tileMap.width, font.tileMap.height];

    sprites.tileMap.use(renderer.gl).upload(0);
    font.tileMap.use(renderer.gl).upload(1);

    this.uniforms = {
      resolution: [innerWidth, innerHeight],
      time: 0,
      ...sprites,
    };
    shader.uniforms(this.uniforms);
    this.onResize();
    window.addEventListener('resize', this.onResize, false);
  }

  run(): void {
    if (this.animationFrame === -1) {
      this.animationFrame = requestAnimationFrame(this.loop);
    }
  }

  pause(): void {
    if (this.animationFrame === -1) {
      return;
    }
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = -1;
  }

  onResize = (): void => {
    const { renderer, shader } = this;
    renderer.setSize(innerWidth, innerHeight);
    shader.uniform('resolution', [innerWidth, innerHeight]);
  };

  loop = (): void => {
    this.drawFrame();
    if (this.animationFrame > -1) {
      this.animationFrame = requestAnimationFrame(this.loop);
      // this.animationFrame = -1;
    }
  };

  drawFrame(): void {
    const { renderer, shader, buffers } = this;
    const clock = performance.now() * 1e-3;
    const { width, height } = renderer.dimensions;
    const { tileSize } = this.tileSets.sprites;
    const zoom = this.zoom || 4;
    const xLen = Math.round(width / (tileSize * zoom)) + 1;
    const yLen = Math.round(height / (tileSize * zoom)) + 2;
    const positionBuffer = this.buffers.position;
    if (
      !positionBuffer.data ||
      positionBuffer.data.length !== 4 * xLen * yLen
    ) {
      positionBuffer.data = new Float32Array(4 * xLen * yLen);
    }
    for (let y = 0; y < yLen; y++) {
      for (let x = 0; x < xLen; x++) {
        const offset = 4 * (y * xLen + x);
        positionBuffer.data[offset + 0] = x * tileSize * zoom;
        positionBuffer.data[offset + 1] = y * tileSize * zoom;
        positionBuffer.data[offset + 2] = tileSize * zoom;
        positionBuffer.data[offset + 3] = Math.round(
          3.5 +
            3.5 *
              (Math.sin(x * 2 - clock * 0.1) * Math.cos(y * 2 + clock * 0.1))
        );
      }
    }
    positionBuffer.update().enable();
    shader.uniform('time', clock);
    renderer.render(
      shader,
      Object.values(buffers),
      WebGL2RenderingContext.POINTS
    );
  }

  dispose(): void {
    const { shader, buffers } = this;
    for (const buffer of Object.values(buffers)) {
      buffer.dispose();
    }
    shader.dispose();
  }
}

const app = new App();
app.init().then(() => app.run());
