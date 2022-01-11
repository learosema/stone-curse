#version 300 es

precision highp float;

in float vSpriteIndex;
in float vSize;
in vec2 vPosition;
out vec4 fragColor;

uniform sampler2D tileMap;
uniform vec2 tileMapSize;
uniform float time;
uniform float tileSize;
uniform float tilesPerRow;
uniform float numTiles;
uniform vec2 resolution;


void main() {
  float col = mod(vSpriteIndex, tilesPerRow) * tileSize;
  float row = floor(vSpriteIndex / tilesPerRow) * tileSize;
  vec2 uv = gl_PointCoord.xy * vec2(tileSize / tileMapSize) + vec2(col, row) / tileMapSize;
  vec4 color = texture(tileMap, uv);
  fragColor = color;
}