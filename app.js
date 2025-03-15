const ACCENT_COLOR = '#6be9a5';
const BG_COLOR = '#202020';
const STROKE_COLOR = '#101010';

export class Grid {
    constructor(width, container) {
        this.width = parseInt(width, 10);
        this.cellSize = 0;
        this.container = container;
        this.isLocked = false;
        this.init();
    }

    init() {
        this.pixelPerfectResize();
        this.reset();
        this.container.addEventListener('click', (e) => {
            const col = Math.floor(e.offsetX / this.cellSize);
            const row = Math.floor(e.offsetY / this.cellSize);
            this.changeCell(row, col);
        });
    }

    pixelPerfectResize() {
        const dpr = 5;
        const rect = this.container.getBoundingClientRect();

        this.cellSize = rect.width / this.width;
        this.height = parseInt(rect.height / this.cellSize, 10);

        this.container.width = rect.width * dpr;
        this.container.height = this.cellSize * this.height * dpr;

        const ctx = this.container.getContext('2d');
        ctx.scale(dpr, dpr);
        this.container.style.width = `${rect.width}px`;
        this.container.style.height = `${rect.height}px`;
    }

    reset() {
        document.getElementById('stopwatch').innerHTML = 0;
        const ctx = this.container.getContext('2d');
        ctx.canvas.cells = new Array(this.height).fill(null).map(() => new Array(this.width).fill(null));
        const rect = this.container.getBoundingClientRect();

        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, rect.width, rect.height);

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                ctx.strokeStyle = STROKE_COLOR;
                ctx.lineWidth = 1;
                ctx.strokeRect(j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);

                ctx.canvas.cells[i][j] = {
                    row: i,
                    col: j,
                    isAlive: 0
                };
            }
        }
    }

    changeCell(row, col) {
        const ctx = this.container.getContext('2d');
        const currentState = ctx.canvas.cells[row][col].isAlive;

        ctx.fillStyle = currentState ? BG_COLOR : ACCENT_COLOR;
        ctx.strokeStyle = STROKE_COLOR;
        ctx.lineWidth = 1;
        ctx.canvas.cells[row][col].isAlive = +!currentState;
        ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
        ctx.strokeRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
    }

    redraw(newWidth) {
        this.width = newWidth;
        this.pixelPerfectResize();
        this.reset();
    }

    randomize() {
        const count = Math.floor(Math.random() * (this.width * this.height * 0.95));
        const allCells = this.container.getContext('2d').canvas.cells;
        this.reset();

        for (let i = 0; i < count; i++) {
            const currentRow = Math.floor(Math.random() * this.height);
            const currentCol = Math.floor(Math.random() * this.width);
            allCells[currentRow][currentCol].isAlive = 1;
            this.changeCell(currentRow, currentCol);
        }
    }

    setDisabled(value) {
        if (value) {
            this.container.classList.add('disabled');
        } else {
            this.container.classList.remove('disabled');
        }
    }

    getCells() {
        const allCells = this.container.getContext('2d').canvas.cells;
        return allCells.map(row => row.map(el => el.isAlive));
    }
}

class StopWatch {
    constructor() {
        this.startTime = null;
        this.elapsedTime = 0;
        this.element = document.getElementById('stopwatch');
    }

    start() {
        this.startTime = Date.now();
    }

    stop() {
        this.elapsedTime = Date.now() - this.startTime;
        this.element.innerHTML = this.elapsedTime;
    }

    reset() {
        this.element.innerHTML = '0';
    }
}

export class Game {
    constructor(grid) {
        this.cells = [];
        this.grid = grid;
        this.isRunning = false;
        this.requestId = null;
        this.stopWatch = new StopWatch();
    }

    start() {
        this.stopWatch.reset();
        this.cells = structuredClone(this.grid.getCells());
        this.isRunning = true;
        this.requestId = requestAnimationFrame(() => this.iterate());
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.requestId);
    }

    iterate() {
        this.stopWatch.start();

        const newArray = structuredClone(this.cells);
        let isChanged = false;

        const width = this.grid.width;
        const height = this.grid.height;

        for (let i = 0; i < newArray.length; i++) {
            for (let j = 0; j < newArray[i].length; j++) {
                const current = this.cells[i][j];
                const aliveCount =
                    this.cells.at(i - 1)[j] +
                    this.cells.at(i - 1)[j + 1 === width ? 0 : j + 1] +
                    this.cells[i][j + 1 === width ? 0 : j + 1] +
                    this.cells[i + 1 === height ? 0 : i + 1][j + 1 === width ? 0 : j + 1] +
                    this.cells[i + 1 === height ? 0 : i + 1][j] +
                    this.cells[i + 1 === height ? 0 : i + 1].at(j - 1) +
                    this.cells[i].at(j - 1) +
                    this.cells.at(i - 1).at(j - 1);

                if (!current && aliveCount === 3) {
                    newArray[i][j] = 1;
                    this.grid.changeCell(i, j);
                    isChanged = true;
                } else if (current && (aliveCount > 3 || aliveCount < 2)) {
                    newArray[i][j] = 0;
                    this.grid.changeCell(i, j);
                    isChanged = true;
                }
            }
        }
        this.cells = structuredClone(newArray);
        this.stopWatch.stop();

        if (isChanged && this.isRunning) {
            this.requestId = requestAnimationFrame(() => this.iterate());
        } else {
            this.stop();
        }
    }
}