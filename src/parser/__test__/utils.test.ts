import fs from "fs";
import {describe, it, expect, jest} from "@jest/globals";
import type {Config} from "../../types";

import {getPathWithExtension} from "../utils";

const generate = {
    match: [/\.fixture\.js$/],
    exclude: [
        "_test\\.js$",
        "\\bcourse-editor-package\\b",
        "\\.fixture\\.js$",
        "\\b__flowtests__\\b",
        "\\bcourse-editor\\b",
    ],
    readOnlyArray: false,
    regenerateCommand: "make gqlflow",
    scalars: {
        JSONString: "string",
        KALocale: "string",
        NaiveDateTime: "string",
    },
    splitTypes: true,
    generatedDirectory: "__graphql-types__",
    exportAllObjectTypes: true,
    schemaFilePath: "./composed_schema.graphql",
} as const;

const config: Config = {
    crawl: {
        root: "/here/we/crawl",
    },
    generate: [
        {...generate, match: [/^static/], exportAllObjectTypes: false},
        generate,
    ],
};

describe("getPathWithExtension", () => {
    it("should handle a basic missing extension", () => {
        // Arrange
        jest.spyOn(fs, "existsSync").mockImplementation((path) =>
            typeof path === "string" ? path.endsWith(".js") : false,
        );

        // Act
        const result = getPathWithExtension("/path/to/file", config);

        // Assert
        expect(result).toBe("/path/to/file.js");
    });

    it("returns null if no file is found", () => {
        // Arrange
        jest.spyOn(fs, "existsSync").mockImplementation((path) => false);

        // Act
        const result = getPathWithExtension("/path/to/file", config);

        // Assert
        expect(result).toBe(null);
    });

    it("maps aliases to their correct value", () => {
        // Arrange
        jest.spyOn(fs, "existsSync").mockImplementation((path) =>
            typeof path === "string" ? path.endsWith(".js") : false,
        );
        const tmpConfig: Config = {
            ...config,
            alias: [{find: "~", replacement: "../../some/prefix"}],
        };

        // Act
        const result = getPathWithExtension("~/dir/file", tmpConfig);

        // Assert
        expect(result).toBe("../../some/prefix/dir/file.js");
    });
});
