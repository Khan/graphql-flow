/* eslint-disable */
// @flow

import {processFiles} from '../parse';
import {resolveDocuments} from '../resolve';

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
        // This import won't be followed, because it's not exported
        // or used in any graphql documents.
        import hello from './someOtherFile.js';
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

    '/untrackableReference.js': `
        import gql from 'graphql-tag';
        import someExternalFragment from 'somewhere';

        const myQuery = gql\`
        query Hello {
            id
        }
        \${someExternalFragment}
        \`;
    `,
};

const getFileSource = (name) => {
    if (!fixtureFiles[name]) {
        throw new Error(`No file ${name}`);
    }
    return fixtureFiles[name];
};

describe('processing fragments in various ways', () => {
    it('should work', () => {
        const files = processFiles(['/thirdFile.js'], getFileSource);
        Object.keys(files).forEach((k) => {
            expect(files[k].errors).toEqual([]);
        });
        const {resolved, errors} = resolveDocuments(files);
        expect(errors).toEqual([]);
        const printed = {};
        Object.keys(resolved).map(
            (k) => (printed[k] = print(resolved[k].document).trim()),
        );
        expect(printed).toMatchInlineSnapshot(`
            Object {
              "/firstFile.js:208": "fragment FromFirstFile on Something {
              firstFile
            }",
              "/firstFile.js:338": "fragment AlsoFromFirst on Something {
              name
            }",
              "/firstFile.js:71": "fragment Something on Otherthing {
              notExportedAttr
            }",
              "/secondFile.js:255": "fragment SecondFragment on Thing {
              secondAttribute
            }",
              "/thirdFile.js:148": "query Some {
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
              "/thirdFile.js:400": "fragment Hello on Something {
              id
            }",
            }
        `);
    });

    it.only('should flag things it doesnt support', () => {
        const files = processFiles(['/untrackableReference.js'], getFileSource);
        expect(files['/untrackableReference.js'].errors).toMatchInlineSnapshot(`
            Array [
              Object {
                "loc": Object {
                  "end": 201,
                  "path": "/untrackableReference.js",
                  "start": 181,
                },
                "message": "Unable to resolve someExternalFragment",
              },
            ]
        `);
    });
});
