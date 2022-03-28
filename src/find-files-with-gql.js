// @flow
const path = require('path');
const {execSync} = require('child_process');

export const findRepoRoot = (): string => {
    try {
        const res = execSync('git rev-parse --show-toplevel', {
            encoding: 'utf8',
        });
        return res.trim();
        // eslint-disable-next-line flowtype-errors/uncovered
    } catch (err) {
        throw new Error(
            // eslint-disable-next-line flowtype-errors/uncovered
            `Unable to use git rev-parse to find the repository root. ${err.message}`,
        );
    }
};

export const findGraphqlTagReferences = (
    root: string,
    needle: string = 'gql`',
): Array<string> => {
    try {
        const response = execSync(
            `git grep -I --word-regexp --name-only --fixed-strings '${needle}' -- '*.js'`,
            {
                encoding: 'utf8',
                cwd: root,
            },
        );
        return response
            .trim()
            .split('\n')
            .map((relative) => path.join(root, relative));
        // eslint-disable-next-line flowtype-errors/uncovered
    } catch (err) {
        throw new Error(
            // eslint-disable-next-line flowtype-errors/uncovered
            `Unable to use git grep to find files with gql tags. ${err.message}`,
        );
    }
};
