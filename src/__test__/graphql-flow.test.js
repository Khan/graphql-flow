// @flow

/**
 * Tests for our graphql flow generation!
 */

import type {DocumentNode} from 'graphql';

import {getSchemas} from '../cli/config';
import {documentToFlowTypes} from '..';

import type {Options} from '../types';

// This allows us to "snapshot" a string cleanly.
/* eslint-disable flowtype-errors/uncovered */
expect.addSnapshotSerializer({
    test: (value) => value && typeof value === 'string',
    print: (value, _, __) => value,
});
/* eslint-enable flowtype-errors/uncovered */

const [_, exampleSchema] = getSchemas(__dirname + '/example-schema.graphql');

const rawQueryToFlowTypes = (query: string, options?: Options): string => {
    // We need the "requireActual" because we mock graphql-tag in jest-setup.js
    // eslint-disable-next-line flowtype-errors/uncovered
    const gql: (string) => DocumentNode = jest.requireActual('graphql-tag');
    const node = gql(query);
    return documentToFlowTypes(node, exampleSchema, {
        scalars: {PositiveNumber: 'number'},
        ...options,
    })
        .map(({code}) => code)
        .join('\n\n');
};

describe('graphql-flow generation', () => {
    it('should allow custom scalars as input', () => {
        const result = rawQueryToFlowTypes(`
            query SomeQuery($candies: PositiveNumber!) {
                candies(number: $candies)
            }
        `);

        expect(result).toMatchInlineSnapshot(`
            export type SomeQueryType = {|
                variables: {|
              candies: number
            |},
                response: {|
              candies: ?string
            |}
            |};
        `);
    });

    it('should split types', () => {
        const result = rawQueryToFlowTypes(
            `
            query SomeQuery($id: String!) {
                human(id: $id) { id }
            }
        `,
            {splitTypes: true},
        );

        expect(result).toMatchInlineSnapshot(`
            export type SomeQueryType = {|
                variables: {|
              id: string
            |},
                response: {|

              /** A human character*/
              human: ?{|
                id: string
              |}
            |}
            |};
        `);
    });

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
            export type SomeQueryType = {|
                variables: {||},
                response: {|

              /** A human character*/
              human: ?{|
                id: string,

                /** The person's name*/
                name: ?string,
                homePlanet: ?string,
                friends: ?$ReadOnlyArray<?{|
                  name: ?string
                |}>,
              |}
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
            export type SomeQueryType = {|
                variables: {||},
                response: {|

              /** A human character*/
              human: ?{|
                notDead: ?boolean
              |}
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
            export type SomeQueryType = {|
                variables: {||},
                response: {|
              friend: ?({|
                __typename: "Human",
                id: string,
                hands: ?number,
              |} | {|
                __typename: "Droid",

                /** The robot's primary function*/
                primaryFunction: ?string,
              |} | {|
                __typename: "Animal"
              |})
            |}
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
            export type SomeQueryType = {|
                variables: {||},
                response: {|

              /** A human character*/
              human: ?{|
                id: string,

                /** The person's name*/
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
                  appearsIn: ?$ReadOnlyArray<
                  /** - NEW_HOPE
                  - EMPIRE
                  - JEDI*/
                  ?("NEW_HOPE" | "EMPIRE" | "JEDI")>,
                  hands: ?number,
                |} | {|
                  __typename: "Droid",
                  id: string,
                  name: ?string,
                  friends: ?$ReadOnlyArray<?{|
                    id: string
                  |}>,
                  appearsIn: ?$ReadOnlyArray<
                  /** - NEW_HOPE
                  - EMPIRE
                  - JEDI*/
                  ?("NEW_HOPE" | "EMPIRE" | "JEDI")>,
                |})>,
              |}
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
            export type SomeQueryType = {|
                variables: {||},
                response: {|

              /** A human character*/
              human: ?{|
                friends: ?Array<?{|
                  name: ?string
                |}>
              |}
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

    describe('Input variables', () => {
        it('should generate a variables type', () => {
            const result = rawQueryToFlowTypes(
                `query SomeQuery($id: String!, $episode: Episode) {
                    human(id: $id) {
                        friends {
                            name
                        }
                    }
                    hero(episode: $episode) {
                        name
                    }
                }`,
                {readOnlyArray: false},
            );

            expect(result).toMatchInlineSnapshot(`
                export type SomeQueryType = {|
                    variables: {|
                  id: string,

                  /** - NEW_HOPE
                  - EMPIRE
                  - JEDI*/
                  episode?: ?("NEW_HOPE" | "EMPIRE" | "JEDI"),
                |},
                    response: {|

                  /** A human character*/
                  human: ?{|
                    friends: ?Array<?{|
                      name: ?string
                    |}>
                  |},
                  hero: ?{|
                    name: ?string
                  |},
                |}
                |};
            `);
        });

        it('should handle an inline fragment on an interface without a typeCondition', () => {
            const result = rawQueryToFlowTypes(
                `
                query SomeQuery {
                    hero(episode: JEDI) {
                        id
                        ... {
                            name
                        }
                    }
                }`,
                {readOnlyArray: false},
            );
            expect(result).toMatchInlineSnapshot(`
                export type SomeQueryType = {|
                    variables: {||},
                    response: {|
                  hero: ?({|
                    id: string,

                    /** The person's name*/
                    name: ?string,
                  |} | {|
                    id: string,
                    name: ?string,
                  |})
                |}
                |};
            `);
        });

        it('should handle an inline fragment on an object (not an interface)', () => {
            const result = rawQueryToFlowTypes(
                `
                query SomeQuery {
                    human(id: "hi") {
                        id
                        ... {
                            name
                        }
                    }
                }`,
                {readOnlyArray: false},
            );
            expect(result).toMatchInlineSnapshot(`
                export type SomeQueryType = {|
                    variables: {||},
                    response: {|

                  /** A human character*/
                  human: ?{|
                    id: string,

                    /** The person's name*/
                    name: ?string,
                  |}
                |}
                |};
            `);
        });

        it('should handle a complex input variable', () => {
            const result = rawQueryToFlowTypes(
                `mutation addCharacter($character: CharacterInput!) {
                    addCharacter(character: $character) {
                        id
                    }
                }`,
                {readOnlyArray: false},
            );

            expect(result).toMatchInlineSnapshot(`
                export type addCharacterType = {|
                    variables: {|

                  /** A character to add*/
                  character: {|

                    /** The new character's name*/
                    name: string,

                    /** The character's friends*/
                    friends?: ?$ReadOnlyArray<string>,
                    appearsIn?: ?$ReadOnlyArray<
                    /** - NEW_HOPE
                    - EMPIRE
                    - JEDI*/
                    "NEW_HOPE" | "EMPIRE" | "JEDI">,
                    candies: number,
                  |}
                |},
                    response: {|
                  addCharacter: ?{|
                    id: string
                  |}
                |}
                |};
            `);
        });
    });
});
