import { Renderer } from './webgl/renderer';
import { Texture } from './webgl/texture';
import { TileSet } from './webgl/types';

export class TextRenderer {
  font: TileSet = {
    tileMap: new Texture('img/font-8x8.png'),
    tileSize: 8,
    tilesPerRow: 8,
    numTiles: 256,
    tileMapSize: [256, 256],
  };

  constructor(public renderer: Renderer) {}

  async init() {
    const { font, renderer } = this;
    await font.tileMap.load();
    font.tileMapSize = [font.tileMap.width, font.tileMap.height];
    font.tileMap.use(renderer.gl).upload(1);
  }
}
