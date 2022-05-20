import { App } from './app';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

const app = new App(canvas);
app.init().then(() => app.run());
