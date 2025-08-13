import { expect, test } from "vitest";
import { Entities } from "../entities.js";

test("Initialises an 'entities' instance field correctly when constructed", () => {
  const entities = new Entities();
  expect(entities.entities).toBeInstanceOf(Set);
  expect(entities.entities).toEqual(new Set());
})
