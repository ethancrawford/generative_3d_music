class System {
  constructor(world) {
    this.world = world;
    this.entities = new Set();
  }

  static get requiredComponents() {
    return [];
  }

  addEntity(entity) {
    this.entities.add(entity);
    this.onEntityAdded(entity);
  }

  removeEntity(entity) {
    this.entities.delete(entity);
    this.onEntityRemoved(entity);
  }

  onEntityAdded(entity) {}
  onEntityRemoved(entity) {}
  update(deltaTime) {}
}

export { System };
