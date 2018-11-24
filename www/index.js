import { Universe } from "rust-wasm-game-of-life";

const pre = document.getElementById("game-of-life-canvas");
const universe = Universe.new();

const renderLoop = () => {
  const textContent = universe.render();

  pre.textContent = textContent;
  universe.tick();

  requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);