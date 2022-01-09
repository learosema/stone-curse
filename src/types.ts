import { Texture } from "./texture";

export type TileSet = {
  texture: Texture;
  tileSize: [number, number];
  numTiles: number;
  tilesPerRow: number;
  textureIndex?: number;
};
