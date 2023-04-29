import { BufferAttrib } from './buffer-attrib';
import { Shader, UniformVariable } from './shader';
import { getWebGLErrorString } from './webgl-errors';

export class VertexArray {

  vao: WebGLVertexArrayObject;
  attributes: Record<string, BufferAttrib> = {};
  count: number = NaN;
  indexType: number = NaN;

  constructor(
    public gl: WebGL2RenderingContext,
    attribs: BufferAttrib[]|null = null,
  ) {
    const vao = gl.createVertexArray();
    if (! vao) {
      throw Error(getWebGLErrorString(gl.getError()));
    }
    this.vao = vao;
    this.gl = gl;
    if (attribs instanceof Array) {
      this.setAttributes(attribs)
    }
  }

  setAttributes(attribs: BufferAttrib[]): VertexArray {
    const { gl } = this;
    this.use();
    for (const attrib of attribs) {
      if (! attrib.name) {
        continue;
      }
      if (this.attributes[attrib.name]) {
        this.attributes[attrib.name].dispose();
      }
      this.attributes[attrib.name] = attrib;
      attrib.enable();
    }
    return this;
  }

  use(): VertexArray { 
    const { gl, vao } = this;
    gl?.bindVertexArray(vao);
    return this;
  }

  unuse() {
    const { gl } = this;
    gl?.bindVertexArray(null);
    return this;
  }

  render() {
    const { gl } = this;
    const attribs = Object.values(this.attributes);

    const attribInfo = BufferAttrib.getCount(this.buffers);

    // TODO this is a mess

    const actualCount = Number.isNaN(countOverride) ? count : actualCount;
    this.use();
    if (indexType !== WebGL2RenderingContext.NONE) {
      gl.drawElements(mode, actualCount, indexType, 0);
    } else {
      gl.drawArrays(mode, 0, actualCount);
    }
  }

  dispose(): void {
    for (const attrib of Object.values(this.attributes)) {
      attrib.dispose();
    }
    this.gl?.deleteVertexArray(vao);
  }
}
