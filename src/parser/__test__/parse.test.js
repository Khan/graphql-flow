/* eslint-disable */
// @flow

import {processFiles} from '../parse';
import {resolveDocuments} from '../resolve';

import {print} from 'graphql/language/printer';

const fixtureFiles = {
    '/firstFile.js': `
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

    '/invalidThings.js': `
        import gql from 'graphql-tag';
        import someExternalFragment from 'somewhere';

        const myQuery = gql\`
        query Hello {
            id
        }
        \${someExternalFragment}
        \${someUndefinedFragment}
        \${2 + 3}
        \`;
    `,

    '/circular.js': `
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

    '/invalidReferences.js': `
        import gql from 'graphql-tag';
        import {otherThing, two, doesntExist} from './circular.js';
        export {otherThing}
        const ok = gql\`
        query Hello {
            ...Ok
        }
        \${otherThing}
        \${doesntExist}
        \`;

        export const one = gql\`
        fragment One {
            ...Ok
        }
        \${two}
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
              "/firstFile.js:131": "fragment Something on Otherthing {
              notExportedAttr
            }",
              "/firstFile.js:268": "fragment FromFirstFile on Something {
              firstFile
            }",
              "/firstFile.js:398": "fragment AlsoFromFirst on Something {
              name
            }",
              "/secondFile.js:368": "fragment SecondFragment on Thing {
              secondAttribute
            }",
              "/thirdFile.js:305": "query Some {
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
              "/thirdFile.js:557": "fragment Hello on Something {
              id
            }",
              "/thirdFile.js:618": "query InlineQuery {
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

    it('should flag things it doesnt support', () => {
        const files = processFiles(['/invalidThings.js'], getFileSource);
        expect(files['/invalidThings.js'].errors.map((m) => m.message))
            .toMatchInlineSnapshot(`
            Array [
              "Unable to resolve someExternalFragment",
              "Unable to resolve someUndefinedFragment",
              "Template literal interpolation must be an identifier",
            ]
        `);
    });

    it('should flag resolution errors', () => {
        const files = processFiles(['/invalidReferences.js'], getFileSource);
        Object.keys(files).forEach((k) => {
            expect(files[k].errors).toEqual([]);
        });
        const {resolved, errors} = resolveDocuments(files);
        expect(errors.map((m) => m.message)).toMatchInlineSnapshot(`
            Array [
              "Circular import /circular.js -> /invalidReferences.js -> /circular.js",
              "/circular.js has no valid gql export doesntExist",
              "Recursive template dependency! /invalidReferences.js:294 -> /circular.js:178 -> /invalidReferences.js:294",
              "Recursive template dependency! /circular.js:178 -> /invalidReferences.js:294 -> /circular.js:178",
            ]
        `);
        const printed = {};
        Object.keys(resolved).map(
            (k) => (printed[k] = print(resolved[k].document).trim()),
        );
        expect(printed).toMatchInlineSnapshot(`Object {}`);
    });
});
