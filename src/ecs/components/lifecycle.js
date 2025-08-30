import { Component } from "../core/component.js";

class Lifecycle extends Component {
  constructor(maxAge = Infinity) {
    super();
    this.age = 0;
    this.maxAge = maxAge;
  }
}

export { Lifecycle };
