import { describe, expect, test } from "vitest";
import { OSCEmitter } from "../osc_emitter.js";

describe("OSCEmitter", () => {
  describe("when initialised with a params value", () => {
    test("sets the 'params' instance field with the given value", () => {
      const address = "/test";
      const params = { a: 1 };
      const emitter = new OSCEmitter(address, params);

      expect(emitter.params).toEqual(params);
    })
  })

  describe("when initialised without a params value", () => {
    test("sets the 'params' instance field to a default value", () => {
      const address = "/test";
      const emitter = new OSCEmitter(address);

      expect(emitter.params).toEqual({});
    })
  })

  describe("when initialised with an address value", () => {
    test("sets the 'address' instance field with the given value", () => {
      const address = "/test";
      const emitter = new OSCEmitter(address);

      expect(emitter.address).toEqual(address);
    })
  })

  describe("when initialised without an address value", () => {
    test("raises an error", () => {
      expect(() => new OSCEmitter()).toThrowError(/^A message address is required$/);
    })
  })

  test("initialises all other instance fields correctly when constructed", () => {
    const emitter = new OSCEmitter("/test");
    expect(emitter.interval).toBe(1000);
    expect(emitter.lastEmit).toBe(0);
    expect(emitter.loop).toBe(true);
    expect(emitter.enabled).toBe(true);
  })
})

