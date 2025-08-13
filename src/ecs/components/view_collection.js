import { Component } from "../core/component.js";

class ViewCollection extends Component {
  constructor(active = false) {
    super();
    this.active = active;
    this.views = [];
  }
}

export { ViewCollection };
