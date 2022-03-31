/* eslint-disable */
// @flow

import {processFiles} from '../parse';

import {print} from 'graphql/language/printer';

const fixtureFiles = {
    '/firstFile.js': `
        import tagme from 'graphql-tag';

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

    '/secondFile.js': `
        import gql from 'graphql-tag';
        import {fromFirstFile} from './firstFile.js';
        export {fromFirstFile}
        export {alsoFirst} from './firstFile.js';

        const secondFragment = gql\`
        fragment SecondFragment on Thing {
            secondAttribute
        }
        \`;
        export {secondFragment};`,

    '/thirdFile.js': `
        import {fromFirstFile, alsoFirst, seceondFragment} from './secondFile.js';
        import gql from 'graphql-tag';

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
            \${secondFragment}
            \`;
        }`,
};

describe('processing fragments in various ways', () => {
    it('should work', () => {
        const {files, resolved} = processFiles(['/thirdFile.js'], (name) => {
            if (!fixtureFiles[name]) {
                throw new Error(`No file ${name}`);
            }
            return fixtureFiles[name];
        });
        const printed = {};
        Object.keys(resolved).map(
            (k) => (printed[k] = print(resolved[k].document).trim()),
        );
        expect(printed).toMatchInlineSnapshot(`
            Object {
              "/secondFile.js:207": "fragment SecondFragment on Thing {
              secondAttribute
            }",
              "/thirdFile.js:400": "fragment Hello on Something {
              id
            }",
            }
        `);
    });
});
