import { BufferAttrib } from './buffer-attrib';
import { Shader, UniformVariable } from './shader';

export class VertexArray {

  vao: WebGLVertexArrayObject;
  attributes: Record<string, BufferAttrib> = {};
  
  constructor(
    gl: WebGL2RenderingContext,
    attribs: BufferAttrib[]|null = null,
  ) {  
    const vao = gl.createVertexArray();
    this.vao = vao;
    this.gl = gl;
    if (attribs instanceof Array) {
      this.setAttributes(attribs)
    }
  }

  get count() {
    return BufferAttrib.getCount(Object.values(this.attributes));
  }

  setAttributes(attribs: BufferAttrib[]): VertexArray {
    const { gl } = this;
    this.use();
    for (const attrib of attribs) {
      if (this.attributes[attrib.name]) {
        this.attributes[attrib.name].dispose();
      }
      this.attributes[attrib.name] = attrib;
      attrib.enable();
    }
    return this;
  }

  use(): VertexArray { 
    const { gl } = this;
    gl?.bindVertexArray(vao);
    return this;
  }
  
  unuse() {
    const { gl } = this;
    gl?.bindVertexArray(null);
    return this;
  }
  
  render(countOverride = NaN) {
    const { gl } = this;
    const attribs = Object.values(this.attributes);
    const { count, indexType } = BufferAttrib.getCount(buffers);
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
