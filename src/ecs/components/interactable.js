import { Component } from "../core/component.js";

class Interactable extends Component {
  constructor() {
    super();
    this.hovered = false;
    this.selected = false;
    this.onClick = null;
    this.onHover = null;
  }
}

export { Interactable };
