import { describe, it, expect } from "vitest";
import { cn } from "~/lib/utils";

describe("utils", () => {
  describe("cn (class name utility)", () => {
    it("should merge class names", () => {
      const result = cn("px-4", "py-2");
      expect(result).toBe("px-4 py-2");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toBe("base-class active-class");
    });

    it("should handle falsy values", () => {
      const result = cn("base-class", false, null, undefined, "end-class");
      expect(result).toBe("base-class end-class");
    });

    it("should merge conflicting Tailwind classes", () => {
      const result = cn("px-4", "px-6");
      expect(result).toBe("px-6");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });
});
