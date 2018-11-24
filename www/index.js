import { Universe } from "rust-wasm-game-of-life";

const pre = document.getElementById("game-of-life-canvas");
const universe = Universe.new();

const frameRate = (cb, fps, timestampMark = 0) => {
  const timestampDelta = Math.floor(1000 / fps);

  return (timestamp) => {
    let newTimestampMark = timestampMark;

    if (timestamp >= timestampMark) {
      cb();
      newTimestampMark = timestamp + timestampDelta;
    }

    requestAnimationFrame(frameRate(cb, fps, newTimestampMark));
  }
}

const renderLoop = () => {
  const textContent = universe.render();

  pre.textContent = textContent;
  universe.tick();
}

requestAnimationFrame(frameRate(renderLoop, 2));