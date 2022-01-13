import { Texture } from './texture';

export type TileSet = {
  tileMap: Texture;
  tileMapSize: [number, number];
  tileSize: number;
  numTiles: number;
  tilesPerRow: number;
  textureIndex?: number;
};
