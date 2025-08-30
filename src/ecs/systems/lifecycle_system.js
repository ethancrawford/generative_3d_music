import { System } from "../core/system.js";
import { Lifecycle } from "../components/lifecycle.js";

class LifecycleSystem extends System {
  constructor(world) {
    super(world);
  }

  static get requiredComponents() {
    return [Lifecycle];
  }

  update(deltaTime) {
    for(const entity of this.entities) {
      const lifecycleComp = entity.getComponent(Lifecycle);
      lifecycleComp.age += deltaTime;
      if (lifecycleComp.maxAge != Infinity) {
        if (lifecycleComp.age > lifecycleComp.maxAge) {
          entity.destroy();
        }
      }
    }
  }
}

export { LifecycleSystem };
