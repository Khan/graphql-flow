const path = require("path");
const {execSync} = require("child_process");

export const findRepoRoot = (): string => {
    try {
        const res = execSync("git rev-parse --show-toplevel", {
            encoding: "utf8",
        });
        return res.trim();
    } catch (err: any) {
        throw new Error(
            `Unable to use git rev-parse to find the repository root. ${err.message}`,
        );
    }
};

export const findGraphqlTagReferences = (root: string): Array<string> => {
    try {
        const response = execSync(
            "git grep -I --word-regexp --name-only --fixed-strings 'gql`' -- '*.js'",
            {
                encoding: "utf8",
                cwd: root,
            },
        );
        return response
            .trim()
            .split("\n")
            .map((relative: string) => path.join(root, relative));
    } catch (err: any) {
        throw new Error(
            `Unable to use git grep to find files with gql tags. ${err.message}`,
        );
    }
};
