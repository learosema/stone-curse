type BufferData = Uint8Array | Uint16Array | Uint32Array | Float32Array;

export class BufferAttrib {
  buffer: WebGLBuffer | null = null;
  gl: WebGL2RenderingContext | null = null;
  indexType: number = NaN;
  count: number = NaN;

  constructor(
    public name: string | null,
    public size: number,
    public attribLocation = -1,
    public data: BufferData | null = null,
    public type = WebGL2RenderingContext.FLOAT,
    public normalized = false,
    public offset = 0,
    public stride = 0,
    public usage: number = WebGL2RenderingContext.DYNAMIC_DRAW,
    public target: number = WebGL2RenderingContext.ARRAY_BUFFER
  ) {
    if (name === null) {
      // If the name is not set, imply it's an index buffer
      this.target = WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;
      this.indexType = this.getIndexType();
      this.count = this.data?.length || 0;
    } else {
      this.count = Math.floor((this.data?.length || 0) / this.size);
    }
  }

  static getCount(buffers: BufferAttrib[]): {
    count: number;
    indexType: number;
  } {
    let count = 0;
    let indexType: number = WebGL2RenderingContext.NONE;
    for (const buffer of buffers) {
      if (!buffer.data) {
        continue;
      }
      if (buffer.target === WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER) {
        count = buffer.data.length;
        if (buffer.data instanceof Uint8Array) {
          indexType = WebGL2RenderingContext.UNSIGNED_BYTE;
        }
        if (buffer.data instanceof Uint16Array) {
          indexType = WebGL2RenderingContext.UNSIGNED_SHORT;
        }
        if (buffer.data instanceof Uint32Array) {
          indexType = WebGL2RenderingContext.UNSIGNED_INT;
        }
        return { count, indexType };
      }
      if (Number.isFinite(buffer.size)) {
        count = Math.max(count, Math.floor(buffer.data.length / buffer.size));
      }
    }
    return { count, indexType };
  }

  use(gl: WebGL2RenderingContext) {
    this.gl = gl;
    return this;
  }

  bindLocation(program: WebGLProgram): BufferAttrib {
    const { gl, attribLocation, name } = this;
    gl?.bindAttribLocation(program, attribLocation, name!);
    return this;
  }

  update(
    data:
      | Uint16Array
      | Uint32Array
      | Float32Array
      | null
      | undefined = undefined
  ) {
    const { gl } = this;
    if (!gl) {
      return this;
    }
    if (this.buffer === null) {
      const buffer = gl.createBuffer();
      if (buffer === null) {
        throw gl.getError();
      }
      this.buffer = buffer;
    }
    if (typeof data !== 'undefined') {
      this.data = data;
    }
    gl.bindBuffer(this.target, this.buffer);
    gl.bufferData(this.target, this.data, this.usage);
    return this;
  }

  enable() {
    const { gl } = this;
    if (!gl) {
      return this;
    }
    if (!this.name) {
      return this;
    }
    gl.vertexAttribPointer(
      this.attribLocation,
      this.size,
      this.type,
      this.normalized,
      this.offset,
      this.stride
    );
    gl.enableVertexAttribArray(this.attribLocation);
    return this;
  }

  disable() {
    const { gl } = this;
    if (!gl) {
      return this;
    }
    gl.disableVertexAttribArray(this.attribLocation);
    return this;
  }

  dispose() {
    this.disable();
    if (this.gl) {
      this.gl.deleteBuffer(this.buffer);
    }
    this.gl = null;
  }

  private getIndexType() {
    if (this.data instanceof Uint8Array) {
      return WebGL2RenderingContext.UNSIGNED_BYTE;
    }
    if (this.data instanceof Uint16Array) {
      return WebGL2RenderingContext.UNSIGNED_SHORT;
    }
    if (this.data instanceof Uint32Array) {
      return WebGL2RenderingContext.UNSIGNED_INT;
    }
    throw Error('unsupported index type');
  }
}
