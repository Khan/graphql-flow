import {describe, it, expect, jest} from "@jest/globals";
import * as childProcess from "child_process";

import type {Config} from "../../types";
import {
    findApplicableConfig,
    getInputFiles,
    parseCliOptions,
    validateOrThrow,
} from "../config";
import configSchema from "../../../schema.json";

jest.mock("child_process");

describe("parseCliOptions", () => {
    it("should handle basic invocation", () => {
        expect(parseCliOptions(["config.json"], "./")).toEqual({
            configFilePath: "config.json",
            cliFiles: [],
        });
    });

    it("should handle cli files", () => {
        expect(
            parseCliOptions(["config.json", "one.js", "two.ts"], "./"),
        ).toEqual({
            configFilePath: "config.json",
            cliFiles: ["one.js", "two.ts"],
        });
    });

    it("should handle -h", () => {
        expect(
            parseCliOptions(["config.json", "-h", "one.js", "two.ts"], "./"),
        ).toEqual(false);
        expect(parseCliOptions([], "./")).toEqual(false);
    });

    it("should pick up schema-file", () => {
        expect(
            parseCliOptions(["config.json", "--schema-file=some.schema"], "./"),
        ).toEqual({
            configFilePath: "config.json",
            cliFiles: [],
            schemaFile: "some.schema",
        });
    });
});

describe("findApplicableConfig", () => {
    it("should work with one that matches", () => {
        const config = {
            schemaFilePath: "ok.graphql",
        } as const;
        expect(findApplicableConfig("/hello", config)).toBe(config);
    });

    it("should be falsy if nothing matches", () => {
        const config = {
            schemaFilePath: "ok.graphql",
            exclude: [/hello$/],
        } as const;
        expect(findApplicableConfig("/hello", config as any)).toBeUndefined();
    });

    it("should match & exclude with multiple configs", () => {
        const configs = [
            {schemaFilePath: "one", match: [/\.jsx$/], exclude: [/^test/]},
            {schemaFilePath: "two", exclude: [/^hello/]},
            {schemaFilePath: "three"},
        ];
        expect(findApplicableConfig("hello.js", configs)).toBe(configs[2]);
        expect(findApplicableConfig("goodbye.js", configs)).toBe(configs[1]);
        expect(findApplicableConfig("hello.jsx", configs)).toBe(configs[0]);
        expect(findApplicableConfig("test.jsx", configs)).toBe(configs[1]);
    });
});

describe("jsonschema validation", () => {
    it("should accept valid schema", () => {
        const config: Config = {
            crawl: {
                root: "/here/we/crawl",
            },
            generate: {
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
            },
        };
        validateOrThrow(config, configSchema);
    });

    it("should accept a schema without crawl", () => {
        const config: Config = {
            generate: {
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
            },
        };
        validateOrThrow(config, configSchema);
    });

    it("should accept a schema with multiple generate configs", () => {
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
        validateOrThrow(config, configSchema);
    });

    it("should reject invalid schema", () => {
        expect(() =>
            validateOrThrow(
                {schemaFilePath: 10, options: {extraOption: "hello"}},
                configSchema,
            ),
        ).toThrowErrorMatchingInlineSnapshot(`
            "instance is not allowed to have the additional property \\"schemaFilePath\\"
            instance is not allowed to have the additional property \\"options\\"
            instance requires property \\"generate\\""
        `);
    });
});

describe("getInputFiles", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return cliFiles when provided", () => {
        const options = {
            configFilePath: "/path/to/config.json",
            cliFiles: ["file1.js", "file2.ts", "file3.jsx"],
        };
        const config = {
            generate: {
                schemaFilePath: "schema.graphql",
            },
        } as Config;

        const result = getInputFiles(options, config);
        expect(result).toEqual(["file1.js", "file2.ts", "file3.jsx"]);
    });

    it("should use crawl when no cliFiles provided", () => {
        const options = {
            configFilePath: "/path/to/config.json",
            cliFiles: [],
        };
        const config = {
            crawl: {
                root: "/project/root",
            },
            generate: {
                schemaFilePath: "schema.graphql",
            },
        } as Config;

        // Mock the git grep command to return some files
        const execSyncSpy = jest
            .spyOn(childProcess, "execSync")
            .mockImplementation(
                () => "src/file1.js\nsrc/file2.ts\nsrc/file3.jsx\n",
            );

        const result = getInputFiles(options, config);

        expect(execSyncSpy).toHaveBeenCalledWith(
            "git grep -I --word-regexp --name-only --fixed-strings --untracked 'graphql-tag' -- '*.js' '*.jsx' '*.ts' '*.tsx'",
            {
                encoding: "utf8",
                cwd: "/project/root",
            },
        );
        expect(result).toEqual([
            "/project/root/src/file1.js",
            "/project/root/src/file2.ts",
            "/project/root/src/file3.jsx",
        ]);
    });

    it("should handle crawl with relative path", () => {
        const options = {
            configFilePath: "/path/to/config.json",
            cliFiles: [],
        };
        const config = {
            crawl: {
                root: "relative/path",
            },
            generate: {
                schemaFilePath: "schema.graphql",
            },
        } as Config;

        const execSyncSpy = jest
            .spyOn(childProcess, "execSync")
            .mockImplementation(() => "file1.js\nfile2.ts\n");

        const result = getInputFiles(options, config);

        expect(execSyncSpy).toHaveBeenCalledWith(
            "git grep -I --word-regexp --name-only --fixed-strings --untracked 'graphql-tag' -- '*.js' '*.jsx' '*.ts' '*.tsx'",
            {
                encoding: "utf8",
                cwd: "/path/to/relative/path",
            },
        );
        expect(result).toEqual([
            "/path/to/relative/path/file1.js",
            "/path/to/relative/path/file2.ts",
        ]);
    });

    it("should throw error when neither cliFiles nor crawl provided", () => {
        const options = {
            configFilePath: "/path/to/config.json",
            cliFiles: [],
        };
        const config = {
            generate: {
                schemaFilePath: "schema.graphql",
            },
        } as Config;

        expect(() => getInputFiles(options, config)).toThrow(
            "Either crawl or cliFiles must be provided",
        );
    });

    it("should prioritize cliFiles over crawl when both are available", () => {
        const options = {
            configFilePath: "/path/to/config.json",
            cliFiles: ["explicit-file.js"],
        };
        const config = {
            crawl: {
                root: "/project/root",
            },
            generate: {
                schemaFilePath: "schema.graphql",
            },
        } as Config;

        const execSyncSpy = jest
            .spyOn(childProcess, "execSync")
            .mockImplementation(() => "");
        const result = getInputFiles(options, config);

        expect(execSyncSpy).not.toHaveBeenCalled();
        expect(result).toEqual(["explicit-file.js"]);
    });
});
