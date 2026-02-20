/**
 * @jest-environment node
 */
import {afterEach, beforeEach, describe, expect, it} from "@jest/globals";
import {resolveImportPath, resetImportCache} from "../resolveImport";
import {ResolverFactory} from "rspack-resolver";

const mockSync = jest.fn();
const mockCreateMatchPath = jest.fn();
const mockLoadConfig = jest.fn();

jest.mock("rspack-resolver", () => ({
    ResolverFactory: jest.fn().mockImplementation(() => ({
        sync: (...args: Array<unknown>) => mockSync(...args),
    })),
}));

jest.mock("tsconfig-paths", () => ({
    createMatchPath: jest
        .fn()
        .mockImplementation((...args: Array<unknown>) =>
            mockCreateMatchPath(...args),
        ),
    loadConfig: jest
        .fn()
        .mockImplementation((...args: Array<unknown>) =>
            mockLoadConfig(...args),
        ),
}));

describe("resolveImportPath", () => {
    beforeEach(() => {
        mockSync.mockReset();
        mockCreateMatchPath.mockReset();
        mockLoadConfig.mockReset();
        (ResolverFactory as unknown as jest.Mock).mockClear();
        resetImportCache();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns the resolved path from the resolver", () => {
        // Arrange
        const matchPath = jest.fn().mockReturnValue("/repo/src/alias/thing.ts");
        mockLoadConfig.mockReturnValue({
            resultType: "success",
            absoluteBaseUrl: "/repo",
            paths: {"@/*": ["src/*"]},
        });
        mockCreateMatchPath.mockReturnValue(matchPath);
        mockSync.mockReturnValue({path: "/repo/src/alias/thing.ts"});

        // Act
        const result = resolveImportPath("/repo/src/file.ts", "@/alias/thing");

        // Assert
        expect(result).toBe("/repo/src/alias/thing.ts");
    });

    it("loads tsconfig from the source file directory", () => {
        // Arrange
        const matchPath = jest.fn().mockReturnValue("/repo/src/alias/thing.ts");
        mockLoadConfig.mockReturnValue({
            resultType: "success",
            absoluteBaseUrl: "/repo",
            paths: {"@/*": ["src/*"]},
        });
        mockCreateMatchPath.mockReturnValue(matchPath);
        mockSync.mockReturnValue({path: "/repo/src/alias/thing.ts"});

        // Act
        resolveImportPath("/repo/src/file.ts", "@/alias/thing");

        // Assert
        expect(mockLoadConfig).toHaveBeenCalledWith("/repo/src");
    });

    it("caches tsconfig matchPath per source directory", () => {
        // Arrange
        const matchPath = jest.fn().mockReturnValue(undefined);
        mockLoadConfig.mockReturnValue({
            resultType: "success",
            absoluteBaseUrl: "/repo",
            paths: {},
        });
        mockCreateMatchPath.mockReturnValue(matchPath);
        mockSync.mockReturnValue({path: "/repo/node_modules/pkg/index.js"});

        // Act
        resolveImportPath("/repo/src/a.ts", "pkg");
        resolveImportPath("/repo/src/b.ts", "pkg");

        // Assert
        expect(mockLoadConfig).toHaveBeenCalledTimes(1);
    });
});
