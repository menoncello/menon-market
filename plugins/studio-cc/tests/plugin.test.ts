import { test, expect, describe } from "bun:test";
import StudioCC, { pluginInfo } from "../index";

describe("StudioCC Plugin", () => {
  test("should initialize with default config", () => {
    const studio = new StudioCC();
    const config = studio.getConfig();

    expect(config.version).toBe("1.0.0");
    expect(config.developmentMode).toBe(false);
    expect(config.debugLogging).toBe(false);
  });

  test("should accept custom config", () => {
    const studio = new StudioCC({
      developmentMode: true,
      debugLogging: true,
    });

    const config = studio.getConfig();
    expect(config.developmentMode).toBe(true);
    expect(config.debugLogging).toBe(true);
  });

  test("should return correct version", () => {
    const studio = new StudioCC();
    expect(studio.getVersion()).toBe("1.0.0");
  });

  test("should update config", () => {
    const studio = new StudioCC();
    studio.updateConfig({ developmentMode: true });

    const config = studio.getConfig();
    expect(config.developmentMode).toBe(true);
  });

  test("should have correct plugin info", () => {
    expect(pluginInfo.name).toBe("studio-cc");
    expect(pluginInfo.displayName).toBe("Studio CC");
    expect(pluginInfo.version).toBe("1.0.0");
    expect(pluginInfo.author).toBe("Eduardo Menoncello");
    expect(pluginInfo.license).toBe("MIT");
  });

  test("should initialize and cleanup successfully", async () => {
    const studio = new StudioCC({ debugLogging: true });

    // These should not throw any errors
    await studio.initialize();
    await studio.cleanup();

    // If we reach here, everything worked
    expect(true).toBe(true);
  });
});