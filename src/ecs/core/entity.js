class Entity {
  constructor(){
    this.id = Entity.nextId++;
    this.world = null;
    this.components = new Map();
  }

  static nextId = 0;

  addComponent(component) {
    this.components.set(component.constructor.name, component);
    component.entity = this;
    if (this.world) {
      this.world.checkEntityForSystems(this);
    }
    return this;
  }

  removeComponent(ComponentClass) {
    const name = ComponentClass.name;
    this.components.delete(name);
    return this;
  }

  getComponent(ComponentClass) {
    return this.components.get(ComponentClass.name);
  }

  hasComponent(ComponentClass) {
    return this.components.has(ComponentClass.name);
  }

  destroy() {
    this.active = false;
    this.components.clear();
  }
}

export { Entity };
