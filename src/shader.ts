type UniformObject = { uniformType?: 'float' | 'int' | 'matrix' };
type UniformVariable = number | number[] | UniformObject;

export class Shader {
  gl: WebGL2RenderingContext | null = null;
  program: WebGLProgram | null = null;
  vertexShaderObject: WebGLShader | null = null;
  fragmentShaderObject: WebGLShader | null = null;

  constructor(public fragmentShader: string, public vertexShader: string) {}

  clone(): Shader {
    return new Shader(this.fragmentShader, this.vertexShader).use(this.gl);
  }

  private shader(type: number, code: string): WebGLShader {
    const { gl } = this;
    if (!gl) {
      throw new Error('no context');
    }
    const sh = gl.createShader(type);
    if (!sh) {
      throw gl.getError();
    }
    gl.shaderSource(sh, code);
    gl.compileShader(sh);

    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(sh);
    }
    return sh;
  }

  private createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
    const { gl } = this;
    if (!gl) {
      throw new Error('no gl context');
    }
    const program = gl.createProgram();
    if (!program) {
      throw gl.getError();
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(program);
    }
    gl.useProgram(program);
    return program;
  }

  use(gl: WebGL2RenderingContext | null) {
    this.gl = gl;
    if (!gl) {
      return this;
    }
    if (!this.program) {
      this.compile();
    }
    if (this.program) {
      gl.useProgram(this.program);
    }
    return this;
  }

  /**
   * recompiles the program
   */
  compile() {
    this.dispose();
    (this.vertexShaderObject = this.shader(
      WebGL2RenderingContext.VERTEX_SHADER,
      this.vertexShader
    )),
      (this.fragmentShaderObject = this.shader(
        WebGL2RenderingContext.FRAGMENT_SHADER,
        this.fragmentShader
      ));
    this.program = this.createProgram(
      this.vertexShaderObject,
      this.fragmentShaderObject
    );
    return this;
  }

  dispose() {
    const { gl } = this;
    if (!gl) {
      return;
    }
    gl.deleteShader(this.vertexShaderObject);
    gl.deleteShader(this.fragmentShaderObject);
    gl.deleteProgram(this.program);

    this.vertexShaderObject = null;
    this.fragmentShaderObject = null;
    this.program = null;
    return this;
  }

  uniforms(vars: Record<string, UniformVariable>): Shader {
    for (const [key, val] of Object.entries(vars)) {
      this.uniform(key, val);
    }
    return this;
  }

  uniform(name: string, value: UniformVariable): Shader {
    const { gl, program } = this;
    let type = 'float';
    if (value instanceof Object && value instanceof Array === false) {
      type = (value as UniformObject).uniformType || 'float';
      const newVal = value.valueOf();
      if (type === 'int') {
        return this.uniformInt(name, newVal as number | number[]);
      }
      if (type === 'matrix') {
        return this.uniformMatrix(name, newVal as number[]);
      }
      return this.uniform(name, newVal as number | number[]);
    }
    if (!gl || !program) {
      return this;
    }
    const loc = gl.getUniformLocation(program, name);
    if (!loc || loc === -1) {
      return this;
    }
    if (value instanceof Array) {
      if (value.length === 1) {
        gl.uniform1fv(loc, value);
      }
      if (value.length === 2) {
        gl.uniform2fv(loc, value);
      }
      if (value.length === 3) {
        gl.uniform3fv(loc, value);
      }
      if (value.length === 4) {
        gl.uniform4fv(loc, value);
      }
      return this;
    }

    if (typeof value === 'bigint') {
      gl.uniform1i(name, Number(value));
    }
    if (typeof value === 'number') {
      gl.uniform1f(name, value);
    }
    return this;
  }

  uniformInt(name: string, value: number | number[]): Shader {
    const { gl, program } = this;
    if (!gl || !program) {
      return this;
    }
    const loc = gl.getUniformLocation(program, name);
    if (!loc || loc === -1) {
      return this;
    }
    if (value instanceof Array) {
      if (value.length === 1) {
        gl.uniform1iv(loc, value);
      }
      if (value.length === 2) {
        gl.uniform2iv(loc, value);
      }
      if (value.length === 3) {
        gl.uniform3iv(loc, value);
      }
      if (value.length === 4) {
        gl.uniform4iv(loc, value);
      }
      return this;
    }
    gl.uniform1i(name, value);
    return this;
  }

  uniformMatrix(name: string, values: number[], transposed = false) {
    const { gl, program } = this;
    if (!gl || !program) {
      return this;
    }
    const loc = gl.getUniformLocation(program, name);
    if (!loc || loc === -1) {
      return this;
    }
    if (values.length === 4) {
      gl.uniformMatrix2fv(loc, transposed, values);
    }
    if (values.length === 9) {
      gl.uniformMatrix3fv(loc, transposed, values);
    }
    if (values.length === 16) {
      gl.uniformMatrix4fv(loc, transposed, values);
    }
    return this;
  }
}
