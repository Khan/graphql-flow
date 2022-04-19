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
        .map(
            ({typeName, code, extraTypes}) =>
                `// ${typeName}.js\n${code}` +
                Object.keys(extraTypes)
                    .sort()
                    .map((k) => `\nexport type ${k} = ${extraTypes[k]};`)
                    .join(''),
        )
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
            // SomeQueryType.js
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
            // SomeQueryType.js
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
            // SomeQueryType.js
            export type SomeQueryType = {|
                variables: {||},
                response: {|

              /** A human character*/
              human: ?{|
                friends: ?$ReadOnlyArray<?{|
                  name: ?string
                |}>,
                homePlanet: ?string,
                id: string,

                /** The person's name*/
                name: ?string,
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
            // SomeQueryType.js
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
            // SomeQueryType.js
            export type SomeQueryType = {|
                variables: {||},
                response: {|
              friend: ?({|
                __typename: "Animal"
              |} | {|
                __typename: "Droid",

                /** The robot's primary function*/
                primaryFunction: string,
              |} | {|
                __typename: "Human",
                hands: ?number,
                id: string,
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
            // SomeQueryType.js
            export type SomeQueryType = {|
                variables: {||},
                response: {|

              /** A human character*/
              human: ?{|
                alive: ?boolean,
                friends: ?$ReadOnlyArray<?({|
                  __typename: "Droid",
                  appearsIn: ?$ReadOnlyArray<
                  /** - NEW_HOPE
                  - EMPIRE
                  - JEDI*/
                  ?("NEW_HOPE" | "EMPIRE" | "JEDI")>,
                  friends: ?$ReadOnlyArray<?{|
                    id: string
                  |}>,
                  id: string,
                  name: ?string,
                |} | {|
                  __typename: "Human",
                  appearsIn: ?$ReadOnlyArray<
                  /** - NEW_HOPE
                  - EMPIRE
                  - JEDI*/
                  ?("NEW_HOPE" | "EMPIRE" | "JEDI")>,
                  friends: ?$ReadOnlyArray<?{|
                    id: string
                  |}>,
                  hands: ?number,
                  id: string,
                  name: ?string,
                |})>,
                hands: ?number,
                homePlanet: ?string,
                id: string,

                /** The person's name*/
                name: ?string,
              |}
            |}
            |};

            // Profile.js
            export type Profile = {|
              __typename: "Droid" | "Human",
              appearsIn: ?$ReadOnlyArray<
              /** - NEW_HOPE
              - EMPIRE
              - JEDI*/
              ?("NEW_HOPE" | "EMPIRE" | "JEDI")>,
              friends: ?$ReadOnlyArray<?{|
                id: string
              |}>,
              id: string,
              name: ?string,
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
            // SomeQueryType.js
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

    describe('Fragments', () => {
        it('should resolve correctly, and produce a type file for the fragment', () => {
            const result = rawQueryToFlowTypes(
                `query Hello {
                    hero(episode: JEDI) {
                        ...onChar
                    }
                }

                fragment onChar on Character {
                    __typename
                    ... on Droid {
                        primaryFunction
                    }
                }`,
            );
            expect(result).toMatchInlineSnapshot(`
                // HelloType.js
                export type HelloType = {|
                    variables: {||},
                    response: {|
                  hero: ?({|
                    __typename: "Droid",

                    /** The robot's primary function*/
                    primaryFunction: string,
                  |} | {|
                    __typename: "Human"
                  |})
                |}
                |};

                // onChar.js
                export type onChar = {|
                  __typename: "Droid",

                  /** The robot's primary function*/
                  primaryFunction: string,
                |} | {|
                  __typename: "Human"
                |};
            `);
        });

        it('Should specialize the fragment type correctly', () => {
            const result = rawQueryToFlowTypes(
                `query Deps {
                    droid(id: "hello") {
                        ...Hello
                    }
                }

                fragment Hello on Character {
                    __typename
                    name
                    ... on Droid {
                        primaryFunction
                    }
                    ... on Human {
                        homePlanet
                    }
                }`,
            );

            // Note how `homePlanet` is ommitted in
            // `DepsType.response.droid`
            expect(result).toMatchInlineSnapshot(`
                // DepsType.js
                export type DepsType = {|
                    variables: {||},
                    response: {|

                  /** A robot character*/
                  droid: ?{|
                    __typename: "Droid",
                    name: ?string,

                    /** The robot's primary function*/
                    primaryFunction: string,
                  |}
                |}
                |};

                // Hello.js
                export type Hello = {|
                  __typename: "Droid",
                  name: ?string,

                  /** The robot's primary function*/
                  primaryFunction: string,
                |} | {|
                  __typename: "Human",
                  homePlanet: ?string,
                  name: ?string,
                |};
            `);
        });
    });

    it('should generate all types when exportAllObjectTypes is set', () => {
        const result = rawQueryToFlowTypes(
            `
            query SomeQuery {
                human(id: "Han Solo") {
                    id
                    name
                    homePlanet
                    hands
                    alive
                    friends {
                        __typename
                        ... on Human {
                            hands
                        }
                    }
                }
            }
        `,
            {exportAllObjectTypes: true},
        );

        expect(result).toMatchInlineSnapshot(`
            // SomeQueryType.js
            export type SomeQueryType = {|
                variables: {||},
                response: {|

              /** A human character*/
              human: ?SomeQuery_human
            |}
            |};
            export type SomeQuery_human = {|
              alive: ?boolean,
              friends: ?$ReadOnlyArray<?SomeQuery_human_friends>,
              hands: ?number,
              homePlanet: ?string,
              id: string,

              /** The person's name*/
              name: ?string,
            |};
            export type SomeQuery_human_friends = SomeQuery_human_friends_Droid | SomeQuery_human_friends_Human;
            export type SomeQuery_human_friends_Droid = {|
              __typename: "Droid"
            |};
            export type SomeQuery_human_friends_Human = {|
              __typename: "Human",
              hands: ?number,
            |};
        `);
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
                // SomeQueryType.js
                export type SomeQueryType = {|
                    variables: {|
                  id: string,

                  /** - NEW_HOPE
                  - EMPIRE
                  - JEDI*/
                  episode?: ?("NEW_HOPE" | "EMPIRE" | "JEDI"),
                |},
                    response: {|
                  hero: ?{|
                    name: ?string
                  |},

                  /** A human character*/
                  human: ?{|
                    friends: ?Array<?{|
                      name: ?string
                    |}>
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
                // SomeQueryType.js
                export type SomeQueryType = {|
                    variables: {||},
                    response: {|
                  hero: ?({|
                    id: string,
                    name: ?string,
                  |} | {|
                    id: string,

                    /** The person's name*/
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
                // SomeQueryType.js
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
                // addCharacterType.js
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
