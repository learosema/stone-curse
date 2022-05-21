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
  
  getField(x: number, y: number) {
    const { level } = this;
    const yMax = level.length - 1;
    const row = y >= 0 && y <= yMax ? level[y] : undefined;
    const field = row instanceof Array ? row[x] : undefined;
    return typeof field === "number" ? field : 1;
  }
}
