// @flow

/**
 * Tests for our graphql flow generation!
 */

import type {IntrospectionQuery, DocumentNode} from 'graphql';
import type {Schema, Options} from '..';
import {buildSchema, getIntrospectionQuery, graphqlSync} from 'graphql';
import fs from 'fs';
const {documentToFlowTypes, schemaFromIntrospectionData} = require('..');

// This allows us to "snapshot" a string cleanly.
/* flow-uncovered-block */
expect.addSnapshotSerializer({
    test: value => value && typeof value === 'string',
    print: (value, _, __) => value,
});
/* end flow-uncovered-block */

const generateTestSchema = (): Schema => {
    const raw = fs.readFileSync(__dirname + '/example-schema.graphql', 'utf8');
    const queryResponse = graphqlSync(
        buildSchema(raw),
        getIntrospectionQuery({descriptions: true}),
    );
    return schemaFromIntrospectionData(
        // flow-next-uncovered-line
        ((queryResponse.data: any): IntrospectionQuery),
    );
};

const exampleSchema = generateTestSchema();

const rawQueryToFlowTypes = (query: string, options?: Options): string => {
    // We need the "requireActual" because we mock graphql-tag in jest-setup.js
    // flow-next-uncovered-line
    const gql: string => DocumentNode = jest.requireActual('graphql-tag');
    const node = gql(query);
    return documentToFlowTypes(node, exampleSchema, {
        scalars: {PositiveNumber: 'number'},
        ...options,
    })
        .map(({code}) => code)
        .join('\n\n');
};

describe('graphql-flow generation', () => {
    it('should work with a basic query', () => {
        const result = rawQueryToFlowTypes(`
            query SomeQuery {
                human(id: "Han Solo") {
                    id
                    name
                    homePlanet
                    friends {
                        name
                    }
                }
            }
        `);

        expect(result).toMatchInlineSnapshot(`
            export type SomeQueryResponseType = {|
              human: ? // A human character
              {|
                id: string,
                // The person's name
                name: ?string,
                homePlanet: ?string,
                friends: ?$ReadOnlyArray<?{|
                  name: ?string
                |}>,
              |}
            |};
        `);
    });

    it('renames', () => {
        const result = rawQueryToFlowTypes(`
            query SomeQuery {
                human(id: "Han Solo") {
                    notDead: alive
                }
            }
        `);

        expect(result).toMatchInlineSnapshot(`
            export type SomeQueryResponseType = {|
              human: ? // A human character
              {|
                notDead: ?boolean
              |}
            |};
        `);
    });

    it('should work with unions', () => {
        const result = rawQueryToFlowTypes(`
            query SomeQuery {
                friend(id: "Han Solo") {
                    __typename
                    ... on Human {
                        id
                        hands
                    }
                    ... on Droid {
                        primaryFunction
                    }
                }
            }
        `);
        expect(result).toMatchInlineSnapshot(`
            export type SomeQueryResponseType = {|
              friend: ?({|
                __typename: "Human",
                id: string,
                hands: ?number,
              |} | {|
                __typename: "Droid",
                // The robot's primary function
                primaryFunction: ?string,
              |} | {|
                __typename: "Animal"
              |})
            |};
        `);
    });

    it('should work with fragments on interface', () => {
        const result = rawQueryToFlowTypes(`
            query SomeQuery {
                human(id: "Han Solo") {
                    id
                    name
                    homePlanet
                    hands
                    alive
                    friends {
                        ...Profile
                        ... on Human {
                            hands
                        }
                    }
                }
            }

            fragment Profile on Character {
                __typename
                id
                name
                friends {
                    id
                }
                appearsIn
            }
        `);

        expect(result).toMatchInlineSnapshot(`
            export type SomeQueryResponseType = {|
              human: ? // A human character
              {|
                id: string,
                // The person's name
                name: ?string,
                homePlanet: ?string,
                hands: ?number,
                alive: ?boolean,
                friends: ?$ReadOnlyArray<?({|
                  __typename: "Human",
                  id: string,
                  name: ?string,
                  friends: ?$ReadOnlyArray<?{|
                    id: string
                  |}>,
                  appearsIn: ?$ReadOnlyArray<?("NEW_HOPE" | "EMPIRE" | "JEDI")>,
                  hands: ?number,
                |} | {|
                  __typename: "Droid",
                  id: string,
                  name: ?string,
                  friends: ?$ReadOnlyArray<?{|
                    id: string
                  |}>,
                  appearsIn: ?$ReadOnlyArray<?("NEW_HOPE" | "EMPIRE" | "JEDI")>,
                |})>,
              |}
            |};
        `);
    });

    it('should work with a readOnlyArray turned off', () => {
        const result = rawQueryToFlowTypes(
            `
            query SomeQuery {
                human(id: "Han Solo") {
                    friends {
                        name
                    }
                }
            }
        `,
            {readOnlyArray: false},
        );

        expect(result).toMatchInlineSnapshot(`
            export type SomeQueryResponseType = {|
              human: ? // A human character
              {|
                friends: ?Array<?{|
                  name: ?string
                |}>
              |}
            |};
        `);
    });

    describe('Object properties', () => {
        it('should reject invalid field', () => {
            expect(() =>
                rawQueryToFlowTypes(`
                    query SomeQuery {
                        human(id: "Me") {
                            invalidField
                        }
                    }
                `),
            ).toThrowErrorMatchingInlineSnapshot(
                `Graphql-flow type generation failed! Unknown field 'invalidField' for type 'Human'`,
            );
        });

        it('should reject an unknown fragment', () => {
            expect(() =>
                rawQueryToFlowTypes(`
            query SomeQuery {
                human(id: "Me") {
                    ...UnknownFragment
                }
            }
            `),
            ).toThrowErrorMatchingInlineSnapshot(
                `Graphql-flow type generation failed! No fragment named 'UnknownFragment'. Did you forget to include it in the template literal?`,
            );
        });
    });
});
