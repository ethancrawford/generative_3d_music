import * as THREE from "three";

class PrimitiveFactory {
  static createCube(world, x = 0, y = 0, z = 0) {
    const entity = world.createEntity();

    entity.addComponent(new Transform(x, y, z));
    entity.addComponent(new Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    ));
    entity.addComponent(new OSCEmitter('/cube', { intensity: 0.5 }));
    entity.addComponent(new Interactable());
    entity.addComponent(new Rules());
    entity.addComponent(new PrimitiveType('cube'));

    return entity;
  }

  static createSphere(world, x = 0, y = 0, z = 0) {
    const entity = world.createEntity();

    entity.addComponent(new Transform(x, y, z));
    entity.addComponent(new Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0xff0000 })
    ));
    entity.addComponent(new OSCEmitter('/sphere', { frequency: 440 }));
    entity.addComponent(new Interactable());
    entity.addComponent(new Rules());
    entity.addComponent(new PrimitiveType('sphere'));

    return entity;
  }

  static createCylinder(world, x = 0, y = 0, z = 0) {
    const entity = world.createEntity();

    entity.addComponent(new Transform(x, y, z));
    entity.addComponent(new Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      new THREE.MeshPhongMaterial({ color: 0x0000ff })
    ));
    entity.addComponent(new OSCEmitter('/cylinder', { duration: 2.0 }));
    entity.addComponent(new Interactable());
    entity.addComponent(new Rules());
    entity.addComponent(new PrimitiveType('cylinder'));

    return entity;
  }
}

export { PrimitiveFactory };
