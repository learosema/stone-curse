import { BufferAttrib } from './buffer-attrib';
import { Shader } from './shader';

export class Renderer {
  gl: WebGL2RenderingContext;
  dimensions = {
    width: 0,
    height: 0,
  };

  constructor(public canvas: HTMLCanvasElement, gl?: WebGL2RenderingContext) {
    this.gl = this.initContext(canvas, gl);
    this.canvas = canvas;
  }

  setSize(width: number, height: number) {
    const { gl, dimensions, canvas } = this;
    Object.assign(dimensions, { width, height });
    Object.assign(canvas, this.dimensions);
    gl.viewport(0, 0, width, height);
  }

  private initContext(
    canvas: HTMLCanvasElement,
    gl?: WebGL2RenderingContext
  ): WebGL2RenderingContext {
    if (!gl) {
      const newContext = canvas?.getContext('webgl2');
      if (!newContext) {
        throw new Error('webgl2 not supported');
      }
      gl = newContext;
    }
    return gl;
  }

  render(
    shader: Shader,
    buffers: BufferAttrib[],
    mode: number = WebGL2RenderingContext.TRIANGLES,
    countOverride = NaN,
    updateBuffers = true
  ) {
    const { gl } = this;
    shader.use(gl);
    for (const buffer of buffers) {
      buffer.use(gl);
      if (updateBuffers) {
        buffer.update();
      }
      buffer.enable();
    }
    const { count, indexType } = BufferAttrib.getCount(buffers);
    if (indexType !== WebGL2RenderingContext.NONE) {
      gl.drawElements(mode, countOverride || count, indexType, 0);
    } else {
      gl.drawArrays(mode, 0, countOverride || count);
    }
    for (const buffer of buffers) {
      buffer.disable();
    }
  }
}
