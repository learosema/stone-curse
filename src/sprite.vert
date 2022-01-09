#version 300 es

precision highp float;
in vec4 sprite;

out float vSpriteIndex;
out float vSize;
out vec2 vPosition;

uniform float time;
void main() {
  gl_PointSize = sprite.z;
  vSize = position.z;
  vSpriteIndex = sprite.w;
  gl_Position = vec4(position.xy, 0., 1.);
}
