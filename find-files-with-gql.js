// @flow
const path = require('path');
const fs = require('fs');

// TODO(jared): Switch to using `git grep`!

const crawl = (root: string, fn: (name: string, full: string) => void) => {
    fs.readdirSync(root).forEach(name => {
        if (name === 'node_modules' || name[0] === '.') {
            return;
        }
        const full = path.join(root, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            crawl(full, fn);
        } else {
            fn(name, full);
        }
    });
};

export const findFilesWithQueries = (
    root: string,
    ignoredFiles: Array<string | RegExp> = [],
): Array<string> => {
    const result = [];
    crawl(root, (name, full) => {
        if (
            name.match(/\.js$/) &&
            !name.match(/\.map\.js$/) &&
            name !== 'jest-setup.js'
        ) {
            for (const test of ignoredFiles) {
                if (typeof test === 'string') {
                    if (name === test) {
                        return;
                    }
                } else {
                    if (test.test(name)) {
                        return;
                    }
                }
            }
            const text = fs.readFileSync(full);
            if (text.includes(`'graphql-tag'`)) {
                result.push(full);
            }
        }
    });
    return result;
};
