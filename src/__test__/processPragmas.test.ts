import {describe, it, expect} from "@jest/globals";

import type {CrawlConfig, GenerateConfig} from "../types";
import {processPragmas} from "../generateTypeFiles";

const pragma = "# @autogen\n";
const loosePragma = "# @autogen-loose\n";

const baseGenerate: GenerateConfig = {schemaFilePath: ""};
const baseCrawl: CrawlConfig = {root: ""};

describe("processPragmas", () => {
    it("should work with no pragmas", () => {
        expect(
            processPragmas(baseGenerate, baseCrawl, `query X { Y }`),
        ).toEqual({
            generate: true,
            strict: undefined,
        });
    });

    it("should reject query without required pragma", () => {
        expect(
            processPragmas(
                baseGenerate,
                {...baseCrawl, pragma},
                `query X { Y }`,
            ),
        ).toEqual({generate: false});
    });

    it("should accept query with required pragma", () => {
        expect(
            processPragmas(
                baseGenerate,
                {...baseCrawl, pragma},
                `query X {
                    # @autogen
                    Y
                }`,
            ),
        ).toEqual({
            strict: true,
            generate: true,
        });
    });

    it("should accept query with loose pragma", () => {
        expect(
            processPragmas(
                baseGenerate,
                {...baseCrawl, pragma, loosePragma},
                `query X {
                    # @autogen-loose
                    Y
                }`,
            ),
        ).toEqual({
            strict: false,
            generate: true,
        });
    });

    it("should reject query with ignore pragma", () => {
        expect(
            processPragmas(
                baseGenerate,
                {...baseCrawl, ignorePragma: "# @ignore\n"},
                `query X {
                    # @ignore
                    Y
                }`,
            ),
        ).toEqual({generate: false});
    });
});
