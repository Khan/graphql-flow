const path = require('path');
const {execSync} = require('child_process');
import {readFileSync} from 'fs';
import {processFiles} from './parse';

const findGraphqlTagReferences = (root: string): Array<string> => {
    try {
        const response = execSync(
            "git grep -I --word-regexp --name-only --fixed-strings 'graphql-tag' -- '*.js' '*.jsx'",
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

const files = findGraphqlTagReferences(process.cwd());
// console.log(files.length, files.slice(0, 24));
processFiles(files, (f) => readFileSync(f, 'utf8'), {
    babel: {
        sourceType: 'module',
        flow: true,
    },
});
