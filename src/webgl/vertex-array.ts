import { BufferAttrib } from './buffer-attrib';
import { Shader, UniformVariable } from './shader';
import { getWebGLErrorString } from './webgl-errors';

export type RenderingMode =
  WebGL2RenderingContext["POINTS"] | WebGL2RenderingContext["TRIANGLES"];


export class VertexArray {

  vao: WebGLVertexArrayObject|null;
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

      if (this.attributes[attrib.name] &&
        this.attributes[attrib.name] !== attrib) {
        // if there's already an attribute set under that name, dispose it.
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

  updateIndexType(): void {
    const indexBuffer = Object.values(this.attributes).find(
      attrib => attrib.target === WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER
    );
    this.indexType = indexBuffer ?
      indexBuffer.indexType :
      WebGL2RenderingContext.NONE;
  }

  updateCount(): void {
    this.count = Math.max(...Object.values(this.attributes).map(attrib => attrib.count));
  }

  render(mode: RenderingMode): void {
    const { gl } = this;
    const attribs = Object.values(this.attributes);

    if (Number.isNaN(this.indexType)) {
      this.updateIndexType();
    }

    if (Number.isNaN(this.count)) {
      this.updateCount();
    }

    this.use();
    if (this.indexType !== WebGL2RenderingContext.NONE) {
      gl.drawElements(mode, this.count, this.indexType, 0);
    } else {
      gl.drawArrays(mode, 0, this.count);
    }
  }

  dispose(): void {
    for (const attrib of Object.values(this.attributes)) {
      attrib.dispose();
    }
    this.gl?.deleteVertexArray(this.vao);
    this.vao = null;
  }
}
