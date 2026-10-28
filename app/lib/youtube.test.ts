import { describe, expect, it } from "vitest";
import { extractVideoId, getThumbnails, validateYouTubeUrl } from "./youtube";

const ID = "dQw4w9WgXcQ";

describe("extractVideoId", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtu.be/${ID}`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/v/${ID}`],
    [`https://www.youtube.com/watch?v=${ID}&t=10s`],
    [ID],
  ])("extracts from %s", (input) => {
    expect(extractVideoId(input)).toBe(ID);
  });

  it("returns null for invalid input", () => {
    expect(extractVideoId("https://example.com")).toBeNull();
    expect(extractVideoId("short")).toBeNull();
    expect(extractVideoId("")).toBeNull();
  });
});

describe("validateYouTubeUrl", () => {
  it("validates", () => {
    expect(validateYouTubeUrl(`https://youtu.be/${ID}`)).toBe(true);
    expect(validateYouTubeUrl("nope")).toBe(false);
  });
});

describe("getThumbnails", () => {
  it("returns 5 sizes with correct URLs", () => {
    const t = getThumbnails(ID);
    expect(Object.keys(t)).toEqual(["maxres", "standard", "high", "medium", "default"]);
    expect(t.maxres.url).toBe(`https://img.youtube.com/vi/${ID}/maxresdefault.jpg`);
    expect(t.default.resolution).toBe("120x90");
    for (const item of Object.values(t)) {
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("description");
    }
  });
});
