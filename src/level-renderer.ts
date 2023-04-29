import fragmentShader from './shaders/sprite.frag';
import vertexShader from './shaders/sprite.vert';
import { BufferAttrib } from './webgl/buffer-attrib';
import { Renderer } from './webgl/renderer';
import { Shader, UniformVariable } from './webgl/shader';
import { Texture } from './webgl/texture';
import { TileSet } from './webgl/types';
import { Level } from './level';
import { Point } from './point'; 

export class LevelRenderer {
  sprites: TileSet = {
    tileMap: new Texture('img/webgl-sprites.png'),
    tileMapSize: [128, 16],
    tileSize: 16,
    tilesPerRow: 8,
    numTiles: 8,
  };

  shader = new Shader(fragmentShader, vertexShader, {});
  uniforms: Record<string, UniformVariable> = {};
  buffers: Record<string, BufferAttrib> = {
    position: new BufferAttrib('position', 4),
  };

  constructor(public renderer: Renderer) {}

  async init(): Promise<void> {
    const { sprites, shader, uniforms, renderer } = this;
    await sprites.tileMap.load();
    sprites.tileMapSize = [sprites.tileMap.width, sprites.tileMap.height];
    sprites.tileMap.use(renderer.gl).upload(0);
    shader.use(renderer.gl);
    Object.assign(uniforms, {
      resolution: [innerWidth, innerHeight],
      time: 0,
      ...sprites,
    });
    shader.uniforms(uniforms);
  }

  onResize() {
    const { renderer, shader } = this;
    renderer.setSize(innerWidth, innerHeight);
    shader.uniform('resolution', [innerWidth, innerHeight]);
  }

  drawFrame(level: Level, center?: Point): void {
    const { renderer, shader, buffers } = this;
    const clock = performance.now() * 1e-3;
    const { width, height } = renderer.dimensions;
    const { tileSize } = this.sprites;
    const zoom = 4;
    const xLen = Math.round(width / (tileSize * zoom)) + 1;
    const yLen = Math.round(height / (tileSize * zoom)) + 2;
    const positionBuffer = this.buffers.position;
    if (
      !positionBuffer.data ||
      positionBuffer.data.length !== 4 * xLen * yLen
    ) {
      positionBuffer.data = new Float32Array(4 * xLen * yLen);
    }
    const p: Point = {x: center?.x || 0, y: center?.y || 0};
    let count = 0;
    for (let y = 0; y < yLen; y++) {
      for (let x = 0; x < xLen; x++) {
        const field = level.getField(x + p.x, y + p.y) - 1;
        if (field < 0) {
          continue;
        }
        const offset = count * 4;
        positionBuffer.data[offset + 0] = x * tileSize * zoom;
        positionBuffer.data[offset + 1] = y * tileSize * zoom;
        positionBuffer.data[offset + 2] = tileSize * zoom;
        positionBuffer.data[offset + 3] = field;
        count++;
      }
    }
    positionBuffer.update().enable();
    shader.uniform('time', clock);
    renderer.render(
      shader,
      Object.values(buffers),
      WebGL2RenderingContext.POINTS,
      count
    );
  }

  dispose() {
    const { shader, buffers } = this;
    for (const buffer of Object.values(buffers)) {
      buffer.dispose();
    }
    shader.dispose();
  }
}
