import { BufferAttrib } from './buffer-attrib';
import { Shader, UniformVariable } from './shader';

export class VertexArray {

  vao: WebGLVertexArrayObject;
  gl: WebGL2RenderingContext;
  shader: Shader;
   attributes: Record<string, BufferAttrib> = {};
  uniforms: Record<string, UniformVariable> = {};

  init(
    gl: WebGL2RenderingContext,
    shader: Shader, 
    attribs: BufferAttrib[]|null = null,
    uniforms: Record<String, UniformVariable>|null = null
  ): VertexArray {  
    const vao = gl.createVertexArray();
    this.vao = vao;
    this.gl = gl;
    shader.use(gl);
    if (attribs instanceof Array) {
      this.setAttributes(attribs)
    }
    if (uniforms !== null) {
      Object.assign(this.uniforms, uniforms)
      shader.uniforms(this.uniforms);
    }
    return this;
  }

  get count() {
    return BufferAttrib.getCount(Object.values(this.attributes));
  }

  setAttributes(attribs: BufferAttrib[]): VertexArray {
    const { gl, program } = this.shader;
        this.use();
    for (const attrib of attribs) {
      if (this.attributes[attrib.name]) {
        this.attributes[attrib.name].dispose();
      }
      this.attributes[attrib.name] = attrib;
      if (gl && program) {
        attrib.use({gl, program}).enable();
      }
    }
    return this;
  }

  use(): VertexArray { 
    const { gl } = this;
    gl?.bindVertexArray(vao);
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
