import { Color, Scene } from "three";

function createScene() {
  const scene = new Scene();
  scene.background = new Color(0x111111);

  return scene;
}

export { createScene };
