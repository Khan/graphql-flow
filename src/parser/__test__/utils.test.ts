/**
 * @jest-environment node
 */
import fs from "fs";
import {describe, it, expect} from "@jest/globals";
import {getPathWithExtension} from "../utils";

describe("getPathWithExtension", () => {
    it("should handle a basic missing extension", () => {
        // Arrange
        jest.spyOn(fs, "existsSync").mockImplementation((path) =>
            typeof path === "string" ? path.endsWith(".js") : false,
        );

        // Act
        const result = getPathWithExtension("/path/to/file");

        // Assert
        expect(result).toBe("/path/to/file.js");
    });

    it("returns null if no file is found", () => {
        // Arrange
        jest.spyOn(fs, "existsSync").mockImplementation((path) => false);

        // Act
        const result = getPathWithExtension("/path/to/file");

        // Assert
        expect(result).toBe(null);
    });

    it("returns the original path when an extension is already present", () => {
        // Arrange
        const input = "/dir/file.tsx";

        // Act
        const result = getPathWithExtension(input);

        // Assert
        expect(result).toBe(input);
    });
});
