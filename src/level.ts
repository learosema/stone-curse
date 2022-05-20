export class Level {
  level: number[][] = [];

  async load(fileName: string) {
    const res = await fetch(fileName);
    const data = await res.text();
    this.loadString(data);
  }

  loadString(data: string) {
    const symbols = ' #.o$XGP';
    this.level = data
      .replace(/\/\/.\n/g, '')
      .trim()
      .split('\n')
      .map((row) => row.split('').map((col) => symbols.indexOf(col)));
  }
}
