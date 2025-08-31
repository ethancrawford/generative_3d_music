import { Mesh, BoxGeometry, MeshLambertMaterial } from "three";

import { ThreeMesh } from "../ecs/components/three_mesh.js";
import { Transform } from "../ecs/components/transform.js";

function createCube(entity, args) {
  const { position, materialArgs = {} } = args;
  const geometry = new BoxGeometry(2, 2, 2);
  const material = createMaterial(materialArgs);
  const mesh = new ThreeMesh(geometry, material);
  mesh.mesh = new Mesh(geometry, material);
  const { x, y, z } = position;
  entity.addComponent(new Transform(x, y, z))
        .addComponent(mesh);
  return entity;
}

function createMaterial(materialArgs) {
  const { color = 0xffffff, ...otherArgs } = materialArgs;
  const material = new MeshLambertMaterial({ color, ...otherArgs })
  return material;
}

export { createCube };
