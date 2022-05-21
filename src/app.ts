import { LevelRenderer } from './level-renderer';
import { TextRenderer } from './text-renderer';
import { Renderer } from './webgl/renderer';
import { Level } from './level';

export class App {
  animationFrame = -1;

  renderer: Renderer;
  levelRenderer: LevelRenderer;
  textRenderer: TextRenderer;
  level: Level = new Level();
  
  constructor(public canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.levelRenderer = new LevelRenderer(this.renderer);
    this.textRenderer = new TextRenderer(this.renderer);
  }

  enableFeatures(gl: WebGL2RenderingContext) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  async init(): Promise<void> {
    const { renderer } = this;
    this.enableFeatures(renderer.gl);
    await Promise.all([
      this.levelRenderer.init(), 
      this.textRenderer.init(),
      this.levels.load('levels/level-01.txt')
    ]);
    this.onResize();
    window.addEventListener('resize', this.onResize, false);
  }

  run(): void {
    if (this.animationFrame === -1) {
      this.animationFrame = requestAnimationFrame(this.loop);
    }
  }

  pause(): void {
    if (this.animationFrame === -1) {
      return;
    }
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = -1;
  }

  onResize = (): void => {
    this.levelRenderer.onResize();
  };

  loop = (): void => {
    this.levelRenderer.drawFrame();
    if (this.animationFrame > -1) {
      this.animationFrame = requestAnimationFrame(this.loop);
    }
  };

  dispose(): void {
    this.levelRenderer.dispose();
  }
}
