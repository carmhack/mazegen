export class AStar {
  constructor(start) {
    this.closedSet = [];
    this.openSet = [start];
  }

  findLowestNode() {
    const sorted = this.openSet.sort((a, b) => {
      let toRet = 0;
      if (a.f < b.f) {
        toRet = -1;
      } else if (a.f > b.f) {
        toRet = 1;
      }
      return toRet;
    });
    return sorted[0];
  }

  removeNode(current) {
    const index = this.openSet.findIndex((node) => node.i === current.i && node.j === current.j);
    this.openSet.splice(index, 1);
  }

  isInClosedSet(current) {
    return this.closedSet.find((node) => node.i === current.i && node.j === current.j);
  }

  isInOpenSet(current) {
    return this.openSet.find((node) => node.i === current.i && node.j === current.j);
  }

  heuristic(a, b) {
    const i = a.i - a.j;
    const j = b.i - b.j;

    return Math.sqrt(i * i + j * j);
  }
}
