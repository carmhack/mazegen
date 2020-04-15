<template>
  <div class="section">
    <div class="field">
      <b-switch size="is-large" v-model="showBorders">Show borders</b-switch>
    </div>
    <vue-p5 v-on="{ setup, draw, mouseclicked }"></vue-p5>
    <b-button
      v-if="canSave"
      type="is-info"
      size="is-large"
      @click="saveImage"
    >
      Save image
    </b-button>
    <b-button
      v-if="canGenerateMaze"
      type="is-dark"
      size="is-large"
      @click="isPlaying = true"
    >
      Generate maze
    </b-button>
    <p v-if="isGenerating" class="subtitle is-4">Generating maze...</p>
    <b-button
      v-if="canSolve"
      type="is-dark"
      size="is-large"
      @click="solveWithAStar"
    >
      Solve with A*
    </b-button>
  </div>
</template>

<script>
import VueP5 from 'vue-p5';
import { Cell } from './Cell';
import { AStar } from '../algorithms/AStar';

export default {
  name: 'Game',
  components: {
    'vue-p5': VueP5,
  },
  computed: {
    canGenerateMaze() {
      return !this.isPlaying && !this.completed;
    },
    isGenerating() {
      return this.isPlaying && !this.completed;
    },
    canSolve() {
      return this.completed && !this.solved;
    },
    canSave() {
      return this.solved;
    },
  },
  data() {
    return {
      sketch: null,
      canvas: null,
      isPlaying: false,
      width: 1200,
      height: 600,
      cols: 0,
      rows: 0,
      w: 50,
      grid: [],
      current: null,
      stack: [],
      completed: false,
      solved: false,
      end: null,
      last: null, // only for solving algorithm
      showBorders: true,
    };
  },
  methods: {
    setup(sketch) {
      this.sketch = sketch;
      const width = this.width;
      const height = this.height;
      this.canvas = this.sketch.createCanvas(width, height);
      this.sketch.frameRate(60);
      this.sketch.textSize(14);
      this.sketch.textAlign('CENTER', 'CENTER');
      this.cols = Math.floor(width / this.w);
      this.rows = Math.floor(height / this.w);

      for (let j = 0; j < this.rows; j += 1) {
        for (let i = 0; i < this.cols; i += 1) {
          this.grid.push(new Cell(i, j));
        }
      }
      this.current = this.grid[0];
      this.current.visited = true;
    },
    index(i, j) {
      if (i < 0 || j < 0 || i > this.cols - 1 || j > this.rows - 1) {
        return -1;
      }
      return i + j * this.cols;
    },
    checkNeighbors(sketch, cell) {
      let toRet = null;
      const neighbors = [];
      const { i, j } = cell;

      const top = this.grid[this.index(i, j - 1)];
      const right = this.grid[this.index(i + 1, j)];
      const bottom = this.grid[this.index(i, j + 1)];
      const left = this.grid[this.index(i - 1, j)];

      if (top && !top.visited) {
        neighbors.push(top);
      }
      if (right && !right.visited) {
        neighbors.push(right);
      }
      if (bottom && !bottom.visited) {
        neighbors.push(bottom);
      }
      if (left && !left.visited) {
        neighbors.push(left);
      }

      if (neighbors.length > 0) {
        // Random neighbor
        const r = sketch.floor(sketch.random(0, neighbors.length));
        toRet = neighbors[r];
      }

      return toRet;
    },
    removeWalls(current, next) {
      const x = current.i - next.i;
      if (x === 1) {
        current.walls[3] = false;
        next.walls[1] = false;
      } else if (x === -1) {
        current.walls[1] = false;
        next.walls[3] = false;
      }
      const y = current.j - next.j;
      if (y === 1) {
        current.walls[0] = false;
        next.walls[2] = false;
      } else if (y === -1) {
        current.walls[2] = false;
        next.walls[0] = false;
      }
    },
    draw() {
      this.sketch.background(32, 64, 81);

      if (this.showBorders) {
        for (let i = 0; i < this.grid.length; i += 1) {
          this.grid[i].draw(this.sketch, this.w);
        }
      }

      if (this.isPlaying) {
        this.current.highlight(this.sketch, this.w);

        // v.1
        const next = this.checkNeighbors(this.sketch, this.current);

        if (next) {
          this.stack.push(this.current);
          this.removeWalls(this.current, next);
          next.visited = true;
          this.current = next;
        } else if (this.stack.length > 0) {
          this.current = this.stack.pop();
        } else {
          this.completed = true;
          this.isPlaying = false;
        }
      }

      if (this.completed && this.end) {
        this.sketch.noStroke();
        this.sketch.fill(255, 255, 255, 100);
        this.sketch.rect(this.end.x * this.w, this.end.y * this.w, this.w, this.w);
      }

      if (this.solved) {
        let temp = this.last;
        this.sketch.fill(255, 255, 255, 100);
        this.sketch.circle(
          temp.i * this.w + this.w / 2,
          temp.j * this.w + this.w / 2,
          this.w / 5,
        );
        /*
        this.sketch.rect(temp.i * this.w, temp.j * this.w, this.w, this.w);
        this.sketch.fill(0, 0, 0, 100);
        this.sketch.text(temp.f, temp.i * this.w + 20, temp.j * this.w + 20); */
        while (temp.previous) {
          temp = temp.previous;
          this.sketch.fill(0, 255, 0, 100);
          this.sketch.circle(
            temp.i * this.w + this.w / 2,
            temp.j * this.w + this.w / 2,
            this.w / 5,
          );
          /*
          this.sketch.rect(temp.i * this.w, temp.j * this.w, this.w, this.w);
          this.sketch.fill(0, 0, 0, 100);
          this.sketch.text(temp.f, temp.i * this.w + 20, temp.j * this.w + 20); */
        }
      }
    },
    mouseclicked(sketch) {
      const { mouseX, mouseY } = sketch;
      const x = Math.floor(mouseX / this.w);
      const y = Math.floor(mouseY / this.w);

      if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
        this.end = {
          x,
          y,
        };
        this.solveWithAStar();
      }
    },
    solveWithAStar() {
      const start = this.grid[0];
      const end = this.end ? { i: this.end.x, j: this.end.y } : this.grid[this.grid.length - 1];

      const algo = new AStar(start);
      let current = null;
      while (algo.openSet.length > 0) {
        current = algo.findLowestNode();
        if (current.i === end.i && current.j === end.j) {
          break;
        }
        algo.removeNode(current);
        algo.closedSet.push(current);

        // Check current's neighbors
        const i = current.i;
        const j = current.j;
        const index = (j * this.cols) + i;
        const topIndex = index - this.cols;
        const rightIndex = index + 1;
        const bottomIndex = index + this.cols;
        const leftIndex = index - 1;

        const neighbors = [];
        if (topIndex >= 0 && topIndex <= this.grid.length - 1) {
          neighbors.push({ ...this.grid[topIndex], hasWall: this.grid[topIndex].walls[2] });
        }
        if (rightIndex >= 0 && rightIndex <= this.grid.length - 1) {
          neighbors.push({ ...this.grid[rightIndex], hasWall: this.grid[rightIndex].walls[3] });
        }
        if (bottomIndex >= 0 && bottomIndex <= this.grid.length - 1) {
          neighbors.push({ ...this.grid[bottomIndex], hasWall: this.grid[bottomIndex].walls[0] });
        }
        if (leftIndex >= 0 && leftIndex <= this.grid.length - 1) {
          neighbors.push({ ...this.grid[leftIndex], hasWall: this.grid[leftIndex].walls[1] });
        }
        for (let n = 0; n < neighbors.length; n += 1) {
          const neighbor = neighbors[n];
          if (!algo.isInClosedSet(neighbor) && !neighbor.hasWall) {
            const tempG = current.g + 1;

            if (algo.isInOpenSet(neighbor)) {
              if (tempG < neighbor.g) {
                neighbor.g = tempG;
              }
            } else {
              neighbor.g = tempG;
              algo.openSet.push(neighbor);
            }

            neighbor.h = algo.heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
      }

      // done
      this.last = current;
      this.solved = true;
    },
    saveImage() {
      this.sketch.saveCanvas(this.canvas, 'maze', 'jpg');
    },
  },
};
</script>
