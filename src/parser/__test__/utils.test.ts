/**
 * @jest-environment node
 */
import fs from "fs";
import {describe, it, expect} from "@jest/globals";
import type {Config} from "../../types";

import resolve from "resolve";
import {getPathWithExtension, resolveImportPath} from "../utils";

jest.mock("resolve");

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

describe("resolveImportPath", () => {
    const resolveSync = resolve.sync as jest.Mock;

    beforeEach(() => {
        resolveSync.mockReset();
    });

    it("resolves graphql-tag via node resolution", () => {
        // Arrange
        resolveSync.mockReturnValue("/repo/node_modules/graphql-tag/index.js");
        const importPath = "graphql-tag";

        // Act
        const result = resolveImportPath(importPath, "/from", config);

        // Assert
        expect(result).toBe("/repo/node_modules/graphql-tag/index.js");
        expect(resolveSync).toHaveBeenCalledWith("graphql-tag", {
            basedir: "/from",
            extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
            paths: undefined,
            preserveSymlinks: false,
        });
    });

    it("resolves relative paths via node resolution", () => {
        // Arrange
        resolveSync.mockReturnValue("/from/fragment.ts");
        const importPath = "./fragment";

        // Act
        const result = resolveImportPath(importPath, "/from", config);

        // Assert
        expect(result).toBe("/from/fragment");
        expect(resolveSync).not.toHaveBeenCalled();
    });

    it("resolves package specifiers via node resolution", () => {
        // Arrange
        resolveSync.mockReturnValue("/repo/node_modules/pkg/fragment.js");
        const importPath = "pkg/fragment";

        // Act
        const result = resolveImportPath(importPath, "/from", config);

        // Assert
        expect(result).toBe("/repo/node_modules/pkg/fragment.js");
        expect(resolveSync).toHaveBeenCalledWith("pkg/fragment", {
            basedir: "/from",
            extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
            paths: undefined,
            preserveSymlinks: false,
        });
    });
});
