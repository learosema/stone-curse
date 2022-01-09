export class Texture {
  texture: WebGLTexture | null = null;
  index = NaN;

  gl: WebGL2RenderingContext | null = null;
  imageSource: TexImageSource | null = null;

  wrapS = WebGL2RenderingContext.CLAMP_TO_EDGE;
  wrapT = WebGL2RenderingContext.CLAMP_TO_EDGE;
  minFilter = WebGL2RenderingContext.NEAREST;
  magFilter = WebGL2RenderingContext.NEAREST;

  constructor(public url = '') {}

  load(url?: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      if (url) {
        this.url = url;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.url;
      img.onload = () => {
        this.imageSource = img;
        resolve(this);
      };
      img.onerror = (error) => reject(error);
    });
  }

  use(gl: WebGL2RenderingContext | null) {
    this.gl = gl;
    return this;
  }

  public upload(textureIndex = 0) {
    const { gl } = this;
    if (!gl) {
      throw new Error('no webgl context');
    }
    if (!this.imageSource) {
      throw new Error('no image data there yet.');
    }
    // upload sprites to GPU
    const texture = gl.createTexture();
    if (!texture) {
      throw gl.getError();
    }
    // Select the active texture
    gl.activeTexture(gl.TEXTURE0 + textureIndex);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);

    // Upload the image into the texture.
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.imageSource
    );

    this.texture = texture;
    this.index = textureIndex;
  }

  valueOf() {
    return BigInt(this.index);
  }

  delete() {
    const { gl } = this;
    if (gl) {
      gl.deleteTexture(this.texture);
    }
    return this;
  }

  dispose() {
    this.imageSource = null;
    this.delete();
  }
}
