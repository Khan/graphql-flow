/**
 * @jest-environment node
 */
import {beforeEach, describe, expect, it} from "@jest/globals";
import {resolveImportPath, resetImportCache} from "../resolveImport";
import {ResolverFactory} from "rspack-resolver";

var mockSync = jest.fn();
var mockCreateMatchPath = jest.fn();
var mockLoadConfig = jest.fn();

jest.mock("rspack-resolver", () => ({
    ResolverFactory: jest.fn().mockImplementation(() => ({
        sync: (...args: Array<any>) => mockSync(...args),
    })),
}));

jest.mock("tsconfig-paths", () => ({
    createMatchPath: jest
        .fn()
        .mockImplementation((...args: Array<any>) =>
            mockCreateMatchPath(...args),
        ),
    loadConfig: jest
        .fn()
        .mockImplementation((...args: Array<any>) => mockLoadConfig(...args)),
}));

describe("resolveImportPath", () => {
    beforeEach(() => {
        mockSync.mockReset();
        mockCreateMatchPath.mockReset();
        mockLoadConfig.mockReset();
        (ResolverFactory as unknown as jest.Mock).mockClear();
        resetImportCache();
    });

    it("resolves with tsconfig paths first", () => {
        const matchPath = jest.fn().mockReturnValue("/repo/src/alias/thing.ts");
        mockLoadConfig.mockReturnValue({
            resultType: "success",
            absoluteBaseUrl: "/repo",
            paths: {"@/*": ["src/*"]},
        });
        mockCreateMatchPath.mockReturnValue(matchPath);
        mockSync.mockReturnValue({path: "/repo/src/alias/thing.ts"});

        const result = resolveImportPath("/repo/src/file.ts", "@/alias/thing");

        expect(mockLoadConfig).toHaveBeenCalledWith("/repo/src");
        expect(matchPath).toHaveBeenCalledWith("@/alias/thing");
        expect(mockSync).toHaveBeenCalledWith(
            "/repo/src",
            "/repo/src/alias/thing.ts",
        );
        expect(result).toBe("/repo/src/alias/thing.ts");
    });

    it("caches matchPath per source directory", () => {
        const matchPath = jest.fn().mockReturnValue(undefined);
        mockLoadConfig.mockReturnValue({
            resultType: "success",
            absoluteBaseUrl: "/repo",
            paths: {},
        });
        mockCreateMatchPath.mockReturnValue(matchPath);
        mockSync.mockReturnValue({path: "/repo/node_modules/pkg/index.js"});

        resolveImportPath("/repo/src/a.ts", "pkg");
        resolveImportPath("/repo/src/b.ts", "pkg");

        expect(mockLoadConfig).toHaveBeenCalledTimes(1);
        expect(mockCreateMatchPath).toHaveBeenCalledTimes(1);
        expect(mockSync).toHaveBeenCalledTimes(2);
    });
});
