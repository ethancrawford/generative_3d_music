import { Component } from "../core/component.js";
import { createRenderer } from "../../factories/renderer.js";

class Renderable extends Component {
  constructor() {
    super();
    this.renderer = createRenderer();
  }
}

export { Renderable };
