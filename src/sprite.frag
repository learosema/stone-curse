#version 300 es

precision highp float;
uniform sampler2D tileMap;
uniform float numSprites;

in float vSpriteIndex;

void main() {
  float spr = 1. / numSprites;
  vec2 uv = gl_PointCoord.xy * vec2(spr, 1.) + vec2(spr * vSpriteIndex, 0);
  
  vec4 color = texture2D(tileMap, uv);
  gl_FragColor = color;
}