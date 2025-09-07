import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [ "userButton", "generativeButton" ]
  static values = { current: String }

  connect() {
    this.eventBus = window.app.eventBus;

    // Listen for mode changes from app
    this.eventBus.subscribe('ui:mode:changed', (mode) => {
      this.currentValue = mode;
    });
  }

  selectUser() {
    this.currentValue = "user";
    this.eventBus.emit('ui:mode:select', 'user');
  }

  selectGenerative() {
    this.currentValue = "generative";
    this.eventBus.emit('ui:mode:select', 'generative');
  }

  currentValueChanged() {
    this.updateButtons();
  }

  updateButtons() {
    this.userButtonTarget.classList.toggle('active', this.currentValue === 'user');
    this.generativeButtonTarget.classList.toggle('active', this.currentValue === 'generative');
  }
}
