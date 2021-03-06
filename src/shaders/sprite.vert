#version 300 es

precision highp float;

in vec4 position;

out float vSpriteIndex;
out float vSize;
out vec2 vPosition;

uniform float time;
uniform float tileSize;
uniform float tilesPerRow;
uniform float numTiles;
uniform vec2 resolution;

void main() {
  // calculate pixel coords to webgl space coords.
  float size = position.z;
  vec2 glPosition = vec2(position.x * 2. / resolution.x - 1., 1. - position.y * 2. / resolution.y); // + vec2(size / 2.) / resolution;

  vPosition = glPosition;
  vSize = size;
  vSpriteIndex = position.w;
  
  gl_PointSize = size;
  gl_Position = vec4(glPosition, 0., 1.);
}
