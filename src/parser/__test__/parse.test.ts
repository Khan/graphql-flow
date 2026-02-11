/**
 * @jest-environment node
 */
import {describe, it, expect, afterEach} from "@jest/globals";

import {Config} from "../../types";
import {processFiles} from "../parse";
import {resolveDocuments} from "../resolve";

import {print} from "graphql/language/printer";

jest.mock("../resolveImport", () => ({
    resetImportCache: jest.fn(),
    resolveImportPath: jest
        .fn()
        .mockImplementation((sourceFile: string, importPath: string) => {
            const path = require("path");
            if (importPath === "graphql-tag") {
                return "/repo/node_modules/graphql-tag/index.js";
            }
            if (importPath === "monorepo-package/fragment") {
                return "/repo/node_modules/monorepo-package/fragment.js";
            }
            if (importPath.startsWith(".")) {
                return path.resolve(path.dirname(sourceFile), importPath);
            }
            if (path.isAbsolute(importPath)) {
                return importPath;
            }
            return null;
        }),
}));

afterEach(() => {
    jest.clearAllMocks();
});

const fixtureFiles: {
    [key: string]:
        | string
        | {
              text: string;
              resolvedPath: string;
          };
} = {
    "/repo/node_modules/monorepo-package/fragment.js": `
        import gql from 'graphql-tag';

        export const sharedFragment = gql\`
        fragment SharedFields on Something {
            id
        }
        \`;
    `,
    "/repo/packages/app/App.js": `
        import gql from 'graphql-tag';
        import {sharedFragment} from 'monorepo-package/fragment';
        export const appQuery = gql\`
        query AppQuery {
            viewer {
                ...SharedFields
            }
        }
        \${sharedFragment}
        \`;
    `,
    "/firstFile.js": `
        // Note that you can import graphql-tag as
        // something other than gql.
        import tagme from 'graphql-tag';

        // Some complex syntax
        const {x} = {x: 10}

        const notExported = tagme\`
        fragment Something on Otherthing {
            notExportedAttr
        }
        \`;

        export const fromFirstFile = tagme\`
        fragment FromFirstFile on Something {
            firstFile
        }
        \`;

        export const alsoFirst = tagme\`
        fragment AlsoFromFirst on Something {
            name
        }
        \`;`,

    "/secondFile.js": `
        import gql from 'graphql-tag';
        import {fromFirstFile} from './firstFile.js';
        // This import won't be followed, because it's not exported
        // or used in any graphql documents.
        import hello from './someOtherFile.js';
        // Re-exporting a fragment!
        export {fromFirstFile}
        export {alsoFirst} from './firstFile.js';

        const secondFragment = gql\`
        fragment SecondFragment on Thing {
            secondAttribute
        }
        \`;
        export {secondFragment};`,

    "/starExportSource.js": `
        import gql from 'graphql-tag';
        export const starFragment = gql\`
        fragment StarFragment on Star {
            id
        }
        \`;
    `,
    "/starExportReexport.js": `
        export * from './starExportSource.js';
    `,
    "/starExportConsumer.js": `
        import gql from 'graphql-tag';
        import {starFragment} from './starExportReexport.js';

        export const starQuery = gql\`
        query StarQuery {
            stars {
                ...StarFragment
            }
        }
        \${starFragment}
        \`;
    `,

    "/thirdFile.js": `
        import {fromFirstFile, alsoFirst, secondFragment} from './secondFile.js';
        import gql from 'graphql-tag';
        import type {someType} from './somePlace';

        export const renamedSecond = secondFragment;

        const otherTemplate = styled\`lets do this\`;

        const myQuery = gql\`
        query Some {
            hello
            ...FromFirstFile
            ...AlsoFromFirst
        }
        \${fromFirstFile}
        \${alsoFirst}
        \`;

        export const runInlineQuery = () => {
            // Here's a fragment defined inline!
            const anotherFragment = gql\`fragment Hello on Something { id }\`;

            return gql\`
            query InlineQuery {
                hello

                ok {
                    ...Hello
                    ...FromFirstFile
                }
                ...SecondFragment
            }
            \${anotherFragment}
            \${fromFirstFile}
            \${renamedSecond}
            \`;
        }`,

    "/invalidThings.js": `
        import gql from 'graphql-tag';
        // Importing a fragment from an npm module is invalid.
        import someExternalFragment from 'somewhere';

        const myQuery = gql\`
        query Hello {
            id
        }
        \${someExternalFragment}
        \${someUndefinedFragment}
        // Fancy fragment expressions not supported
        \${2 + 3}
        \`;
    `,

    "/circular.js": `
        import gql from 'graphql-tag';
        export {otherThing} from './invalidReferences.js';
        import {one} from './invalidReferences.js';
        export const two = gql\`
        fragment Two {
            id
        }
        \${one}
        \`;
    `,

    "/invalidReferences.js": `
        import gql from 'graphql-tag';
        import {otherThing, two, doesntExist} from './circular.js';
        // 'otherThing' is imported circularly
        export {otherThing}
        const ok = gql\`
        query Hello {
            ...Ok
        }
        \${otherThing}
        \${doesntExist}
        \`;

        // fragments 'one' & 'two' depend on each other
        export const one = gql\`
        fragment One {
            ...Ok
        }
        \${two}
        \`;
    `,
};

const getFileSource = (name: string) => {
    if (!fixtureFiles[name]) {
        throw new Error(`No file ${name}`);
    }
    return fixtureFiles[name];
};

describe("processing fragments in various ways", () => {
    it("should work", () => {
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
        const files = processFiles(["/thirdFile.js"], config, getFileSource);
        Object.keys(files).forEach((k: any) => {
            expect(files[k].errors).toEqual([]);
        });
        const {resolved, errors} = resolveDocuments(files, config);
        expect(errors).toEqual([]);
        const printed: Record<string, any> = {};
        Object.keys(resolved).map(
            (k: any) => (printed[k] = print(resolved[k].document).trim()),
        );
        expect(printed).toMatchInlineSnapshot(`
            Object {
              "/firstFile.js:15": "fragment FromFirstFile on Something {
              firstFile
            }",
              "/firstFile.js:21": "fragment AlsoFromFirst on Something {
              name
            }",
              "/firstFile.js:9": "fragment Something on Otherthing {
              notExportedAttr
            }",
              "/secondFile.js:11": "fragment SecondFragment on Thing {
              secondAttribute
            }",
              "/thirdFile.js:10": "query Some {
              hello
              ...FromFirstFile
              ...AlsoFromFirst
            }

            fragment FromFirstFile on Something {
              firstFile
            }

            fragment AlsoFromFirst on Something {
              name
            }",
              "/thirdFile.js:22": "fragment Hello on Something {
              id
            }",
              "/thirdFile.js:24": "query InlineQuery {
              hello
              ok {
                ...Hello
                ...FromFirstFile
              }
              ...SecondFragment
            }

            fragment Hello on Something {
              id
            }

            fragment FromFirstFile on Something {
              firstFile
            }

            fragment SecondFragment on Thing {
              secondAttribute
            }",
            }
        `);
    });

    it("should flag things it doesnt support", () => {
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
        const files = processFiles(
            ["/invalidThings.js"],
            config,
            getFileSource,
        );
        expect(files["/invalidThings.js"].errors.map((m: any) => m.message))
            .toMatchInlineSnapshot(`
            Array [
              "Unable to resolve someExternalFragment",
              "Unable to resolve someUndefinedFragment",
              "Template literal interpolation must be an identifier",
            ]
        `);
    });

    it("should flag resolution errors", () => {
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
        const files = processFiles(
            ["/invalidReferences.js"],
            config,
            getFileSource,
        );
        Object.keys(files).forEach((k: any) => {
            expect(files[k].errors).toEqual([]);
        });
        const {resolved, errors} = resolveDocuments(files, config);
        expect(errors.map((m: any) => m.message)).toMatchInlineSnapshot(`
            Array [
              "Circular import /circular.js -> /invalidReferences.js -> /circular.js",
              "/circular.js has no valid gql export doesntExist",
              "Recursive template dependency! /invalidReferences.js:15 ~ 1,2 -> /circular.js:5 ~ 1,2 -> /invalidReferences.js:15",
              "Recursive template dependency! /circular.js:5 ~ 1,2 -> /invalidReferences.js:15 ~ 1,2 -> /circular.js:5",
            ]
        `);
        const printed: Record<string, any> = {};
        Object.keys(resolved).map(
            (k: any) => (printed[k] = print(resolved[k].document).trim()),
        );
        expect(printed).toMatchInlineSnapshot(`Object {}`);
    });

    it("should resolve fragments re-exported via export all", () => {
        // Arrange
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
        // Act
        const files = processFiles(
            ["/starExportConsumer.js"],
            config,
            getFileSource,
        );
        const {resolved} = resolveDocuments(files, config);
        const printed: Record<string, any> = {};
        Object.keys(resolved).map(
            (k: any) => (printed[k] = print(resolved[k].document).trim()),
        );

        // Assert
        expect(printed).toMatchInlineSnapshot(`
            Object {
              "/starExportConsumer.js:5": "query StarQuery {
              stars {
                ...StarFragment
              }
            }

            fragment StarFragment on Star {
              id
            }",
              "/starExportSource.js:3": "fragment StarFragment on Star {
              id
            }",
            }
        `);
    });

    it("should resolve fragments imported from monorepo packages", () => {
        // Arrange
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

        // Act
        const files = processFiles(
            ["/repo/packages/app/App.js"],
            config,
            getFileSource,
        );
        const {resolved} = resolveDocuments(files, config);
        const printed: Record<string, any> = {};
        Object.keys(resolved).map(
            (k: any) => (printed[k] = print(resolved[k].document).trim()),
        );

        // Assert
        expect(printed).toMatchInlineSnapshot(`
                Object {
                  "/repo/node_modules/monorepo-package/fragment.js:4": "fragment SharedFields on Something {
                  id
                }",
                  "/repo/packages/app/App.js:4": "query AppQuery {
                  viewer {
                    ...SharedFields
                  }
                }

                fragment SharedFields on Something {
                  id
                }",
                }
            `);
    });
});
