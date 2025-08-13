import { expect, test } from "vitest";
import { Interactable } from "../interactable.js";

test("Initialises instance field correctly when constructed", () => {
  const interactable = new Interactable();
  expect(interactable.hovered).toBe(false);
  expect(interactable.selected).toBe(false);
  expect(interactable.onClick).toBe(null);
  expect(interactable.onHover).toBe(null);
})
