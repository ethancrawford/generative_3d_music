import { System } from "../core/system.js";
import { Rules } from "../components/rules.js";

class RulesSystem extends System {
  constructor(world) {
    super(world);
    this.rules = new Map();
  }

  static get requiredComponents() {
    return [Rules];
  }

  update(deltaTime) {
    for (const entity of this.entities) {
      const rules = entity.getComponent(Rules);
      executeRules(entity, rules);
    }
  }

  addRule(name, ruleFn) {
    this.rules.set(name, ruleFn);
  }

  removeRule(name) {
    this.rules.delete(name);
  }

  executeRules(entity, rules) {
    for (const [name, ruleFn] of rules) {
      ruleFn(entity, world);
    }
  }
}
