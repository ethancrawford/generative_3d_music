import { Component } from "../core/component.js";

class Entities extends Component {
  constructor() {
    super();
    this.entities = new Set();
  }
}

export { Entities };
