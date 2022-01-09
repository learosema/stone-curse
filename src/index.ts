import { BufferAttrib } from './buffer-attrib';
import { Renderer } from './renderer';
import { Shader } from './shader';
import { Texture } from './texture';

import fragmentShader from './sprite.frag';
import vertexShader from './sprite.vert';
import { TileSet } from './types';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

class App {
  animationFrame = -1;
  shader = new Shader(fragmentShader, vertexShader);
  buffers: Record<string, BufferAttrib> = {
    position: new BufferAttrib('position', 3),
    sprite: new BufferAttrib('sprite', 3),
  };

  tileSets: Record<string, TileSet> = {
    sprites: {
      texture: new Texture('webgl-sprites.png'),
      tileSize: [16, 16],
      tilesPerRow: 8,
      numTiles: 8,
    },
    font: {
      texture: new Texture('font-8x8.png'),
      tileSize: [8, 8],
      tilesPerRow: 8,
      numTiles: 256,
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
    shader
      .use(renderer.gl)
      .uniform('resolution', [innerWidth, innerHeight])
      .uniform('time', 0)
      .uniform('spriteTexture', 0)
      .uniform('fontTexture', 1);

    window.addEventListener('resize', this.onResize, false);
    const { sprites, font } = this.tileSets;

    await sprites.texture.load();
    await font.texture.load();
    sprites.texture.use(renderer.gl).upload(0);
    font.texture.use(renderer.gl).upload(1);
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
    }
  };

  drawFrame(): void {
    const { renderer, shader, buffers } = this;

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
