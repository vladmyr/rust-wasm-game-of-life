import { Universe, Cell, UniversePreset } from "rust-wasm-game-of-life";
import { memory } from "rust-wasm-game-of-life/rust_wasm_game_of_life_bg";

const CELL_SIZE = 12;
const GRID_COLOR = "#cccccc";
const DEAD_COLOR = "#ffffff";
const ALIVE_COLOR = "#000000";

const universe = Universe.new(UniversePreset.Demo);
const width = universe.width();
const height = universe.height();

let animationId = undefined;
let fps = 2;

const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

canvas.addEventListener("click", event => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const column = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, column);

  drawGrid();
  drawCells();
})

const ctx = canvas.getContext("2d");

const isPaused = () => {
  return animationId === undefined;
}

const play = () => {
  playPauseButton.textContent = "⏸";
  animationId = requestAnimationFrame(frameRate(renderLoop, fps));
}

const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = undefined;
}

const playPauseButton = document.getElementById("play-pause");
playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
}

const getIndex = (row, column) => row * width + column;

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead
        ? DEAD_COLOR
        : ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
}

const fpsMonitor = new class {
  constructor() {
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.latestFrameTimeStamp = performance.now();
  }

  render() {
    const now = performance.now();
    const delta = now - this.latestFrameTimeStamp;
    this.latestFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;

    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }

    let mean = sum / this.frames.length;

    this.fps.textContent = `
FPS:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
    `.trim();
  }
}

const frameRate = (cb, fps, timestampMark = 0) => {
  const timestampDelta = Math.floor(1000 / fps);

  return (timestamp) => {
    let newTimestampMark = timestampMark;

    if (timestamp >= timestampMark) {
      cb();
      newTimestampMark = timestamp + timestampDelta;
    }

    animationId = requestAnimationFrame(frameRate(cb, fps, newTimestampMark));
  }
}

const renderLoop = () => {
  fpsMonitor.render();
  universe.tick();
  
  drawGrid();
  drawCells();
}

play();