import fs from "fs";
import {describe, it, expect, jest} from "@jest/globals";
import type {Config} from "../../types";

import {buildModuleMap, getPathWithExtension} from "../utils";

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

describe("buildModuleMap", () => {
    const makeDirent = (name: string, isDir: boolean) => ({
        name,
        isDirectory: () => isDir,
        isFile: () => !isDir,
    });

    it("collects package.json names and ignores node_modules", () => {
        const existsSpy = jest
            .spyOn(fs, "existsSync")
            .mockImplementation((value) => {
                return (
                    value === "/repo/package.json" ||
                    value === "/repo/packages/app/package.json" ||
                    value === "/repo/packages/shared/package.json" ||
                    value === "/repo/node_modules/ignore-me/package.json"
                );
            });
        const readSpy = jest
            .spyOn(fs, "readFileSync")
            .mockImplementation((value) => {
                if (value === "/repo/package.json") {
                    return JSON.stringify({name: "root-package"});
                }
                if (value === "/repo/packages/app/package.json") {
                    return JSON.stringify({name: "app-package"});
                }
                if (value === "/repo/packages/shared/package.json") {
                    return JSON.stringify({name: "@scope/shared"});
                }
                if (value === "/repo/node_modules/ignore-me/package.json") {
                    return JSON.stringify({name: "ignore-me"});
                }
                throw new Error(`Unexpected readFileSync for ${value}`);
            });
        const readdirSpy = jest
            .spyOn(fs, "readdirSync")
            .mockImplementation((value) => {
                if (value === "/repo") {
                    return [
                        makeDirent("packages", true),
                        makeDirent("node_modules", true),
                    ] as Array<any>;
                }
                if (value === "/repo/packages") {
                    return [
                        makeDirent("app", true),
                        makeDirent("shared", true),
                    ] as Array<any>;
                }
                if (
                    value === "/repo/packages/app" ||
                    value === "/repo/packages/shared"
                ) {
                    return [] as Array<any>;
                }
                return [] as Array<any>;
            });
        const realpathSpy = jest
            .spyOn(fs, "realpathSync")
            .mockImplementation((value) => value.toString());

        try {
            const result = buildModuleMap(["/repo"]);
            expect(result).toEqual({
                "root-package": "/repo",
                "app-package": "/repo/packages/app",
                "@scope/shared": "/repo/packages/shared",
            });
        } finally {
            existsSpy.mockRestore();
            readSpy.mockRestore();
            readdirSpy.mockRestore();
            realpathSpy.mockRestore();
        }
    });
});
