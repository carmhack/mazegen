export class Cell {
  constructor(i, j) {
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true];
    this.visited = false;
    this.previous = null;
  }

  draw(sketch, w) {
    const x = this.i * w;
    const y = this.j * w;
    const walls = this.walls;
    const visited = this.visited;

    sketch.stroke(255);
    sketch.strokeWeight(2);
    if (walls[0]) { // Top
      sketch.line(x, y, x + w, y);
    }
    if (walls[1]) { // Right
      sketch.line(x + w, y, x + w, y + w);
    }
    if (walls[2]) { // Bottom
      sketch.line(x + w, y + w, x, y + w);
    }
    if (walls[3]) { // Left
      sketch.line(x, y + w, x, y);
    }

    if (visited) {
      sketch.noStroke();
      sketch.fill(32, 64, 81, 100);
      sketch.rect(x, y, w, w);
    }
  }

  highlight(sketch, w) {
    const x = this.i * w;
    const y = this.j * w;
    sketch.noStroke();
    sketch.fill(202, 232, 213, 100);
    sketch.rect(x, y, w, w);
  }
}
