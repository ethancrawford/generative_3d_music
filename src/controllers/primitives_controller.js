import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["button"]
  static values = { selected: String }

  connect() {
    this.eventBus = window.app.eventBus;

    // this.eventBus.subscribe('primitive:selected', (primitive) => {
    //   this.selectedValue = primitive;
    // });

    this.eventBus.subscribe("ui:mode:select", (mode) => {
      this.updateForMode(mode);
    });
  }

  select(event) {
    const primitive = event.currentTarget.dataset.primitive;
    this.selectedValue == primitive;
    this.eventBus.emit("ui:primitive:select", primitive);
  }

  selectedValueChanged() {
    this.buttonTargets.forEach(btn => {
      const isSelected = btn.dataset.primitive === this.selectedValue;
      btn.classList.toggle("active", isSelected);
    });
  }

  updateForMode(mode) {
    const disabled = mode === "generative";
    this.element.style.opacity = disabled ? "0.5" : "1";
    this.element.style.pointerEvents = disabled ? "none" : "auto";
  }
}
