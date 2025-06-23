/**
 * Tests for our graphql flow generation!
 */
import {describe, it, expect} from "@jest/globals";
import gql from "graphql-tag";

import {getSchemas} from "../cli/config";
import {documentToFlowTypes} from "..";
import type {GenerateConfig} from "../types";

// This allows us to "snapshot" a string cleanly.

expect.addSnapshotSerializer({
    test: (value: any) => value && typeof value === "string",
    print: (value: any, _: any, __: any) => value,
});

const [_, exampleSchema] = getSchemas(__dirname + "/example-schema.graphql");

const rawQueryToFlowTypes = (
    query: string,
    options?: Partial<GenerateConfig>,
): string => {
    const node = gql(query);
    return documentToFlowTypes(node, exampleSchema, {
        schemaFilePath: "",
        scalars: {PositiveNumber: "number"},
        ...options,
    })
        .map(
            ({typeName, code, extraTypes}: any) =>
                `// ${typeName}.js\n${code}` +
                Object.keys(extraTypes)
                    .sort()
                    .map((k: any) => `\nexport type ${k} = ${extraTypes[k]};`)
                    .join(""),
        )
        .join("\n\n");
};

describe("graphql-flow generation", () => {
    it("should allow custom scalars as input", () => {
        const result = rawQueryToFlowTypes(`
            query SomeQuery($candies: PositiveNumber!) {
                candies(number: $candies)
            }
        `);

        expect(result).toMatchInlineSnapshot(`
            // SomeQueryType.js
            export type SomeQueryType = {
                variables: {
              candies: number;
            },
                response: {
              candies: string | null | undefined;
            }
            };
        `);
    });

    it("should split types", () => {
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
            export type SomeQueryType = {
                variables: {
              id: string;
            },
                response: {
              human: /** A human character*/{
                id: string;
              } | null | undefined;
            }
            };
        `);
    });

    it("should work with a basic query", () => {
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
            export type SomeQueryType = {
                variables: {},
                response: {
              human: /** A human character*/{
                friends: ReadonlyArray<{
                  name: string | null | undefined;
                } | null | undefined> | null | undefined;
                homePlanet: string | null | undefined;
                id: string;
                /** The person's name*/name: string | null | undefined;
              } | null | undefined;
            }
            };
        `);
    });

    it("renames", () => {
        const result = rawQueryToFlowTypes(`
            query SomeQuery {
                human(id: "Han Solo") {
                    notDead: alive
                }
            }
        `);

        expect(result).toMatchInlineSnapshot(`
            // SomeQueryType.js
            export type SomeQueryType = {
                variables: {},
                response: {
              human: /** A human character*/{
                notDead: boolean | null | undefined;
              } | null | undefined;
            }
            };
        `);
    });

    it("should work with unions", () => {
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
            export type SomeQueryType = {
                variables: {},
                response: {
              friend: {
                __typename: "Animal";
              } | {
                __typename: "Droid";
                /** The robot's primary function*/primaryFunction: string;
              } | {
                __typename: "Human";
                hands: number | null | undefined;
                id: string;
              } | null | undefined;
            }
            };
        `);
    });

    it("should work with fragments on interface", () => {
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
            export type SomeQueryType = {
                variables: {},
                response: {
              human: /** A human character*/{
                alive: boolean | null | undefined;
                friends: ReadonlyArray<{
                  __typename: "Droid";
                  appearsIn: ReadonlyArray<
                  /** - NEW_HOPE
                  - EMPIRE
                  - JEDI*/
                  "NEW_HOPE" | "EMPIRE" | "JEDI" | null | undefined> | null | undefined;
                  friends: ReadonlyArray<{
                    id: string;
                  } | null | undefined> | null | undefined;
                  id: string;
                  name: string | null | undefined;
                } | {
                  __typename: "Human";
                  appearsIn: ReadonlyArray<
                  /** - NEW_HOPE
                  - EMPIRE
                  - JEDI*/
                  "NEW_HOPE" | "EMPIRE" | "JEDI" | null | undefined> | null | undefined;
                  friends: ReadonlyArray<{
                    id: string;
                  } | null | undefined> | null | undefined;
                  hands: number | null | undefined;
                  id: string;
                  name: string | null | undefined;
                } | null | undefined> | null | undefined;
                hands: number | null | undefined;
                homePlanet: string | null | undefined;
                id: string;
                /** The person's name*/name: string | null | undefined;
              } | null | undefined;
            }
            };

            // Profile.js
            export type Profile = {
              __typename: "Droid" | "Human";
              appearsIn: ReadonlyArray<
              /** - NEW_HOPE
              - EMPIRE
              - JEDI*/
              "NEW_HOPE" | "EMPIRE" | "JEDI" | null | undefined> | null | undefined;
              friends: ReadonlyArray<{
                id: string;
              } | null | undefined> | null | undefined;
              id: string;
              name: string | null | undefined;
            };
        `);
    });

    it("should work with a readOnlyArray turned off", () => {
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
            export type SomeQueryType = {
                variables: {},
                response: {
              human: /** A human character*/{
                friends: Array<{
                  name: string | null | undefined;
                } | null | undefined> | null | undefined;
              } | null | undefined;
            }
            };
        `);
    });

    describe("Object properties", () => {
        it("should reject invalid field", () => {
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

        it("should reject an unknown fragment", () => {
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

    describe("Fragments", () => {
        it("should resolve correctly, and produce a type file for the fragment", () => {
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
                export type HelloType = {
                    variables: {},
                    response: {
                  hero: {
                    __typename: "Droid";
                    /** The robot's primary function*/primaryFunction: string;
                  } | {
                    __typename: "Human";
                  } | null | undefined;
                }
                };

                // onChar.js
                export type onChar = {
                  __typename: "Droid";
                  /** The robot's primary function*/primaryFunction: string;
                } | {
                  __typename: "Human";
                };
            `);
        });

        it("Should specialize the fragment type correctly", () => {
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
                export type DepsType = {
                    variables: {},
                    response: {
                  droid: /** A robot character*/{
                    __typename: "Droid";
                    name: string | null | undefined;
                    /** The robot's primary function*/primaryFunction: string;
                  } | null | undefined;
                }
                };

                // Hello.js
                export type Hello = {
                  __typename: "Droid";
                  name: string | null | undefined;
                  /** The robot's primary function*/primaryFunction: string;
                } | {
                  __typename: "Human";
                  homePlanet: string | null | undefined;
                  name: string | null | undefined;
                };
            `);
        });
    });

    it("should generate all types when exportAllObjectTypes is set", () => {
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
            export type SomeQueryType = {
                variables: {},
                response: {
              human: /** A human character*/SomeQuery_human | null | undefined;
            }
            };
            export type SomeQuery_human = {
              alive: boolean | null | undefined;
              friends: ReadonlyArray<SomeQuery_human_friends | null | undefined> | null | undefined;
              hands: number | null | undefined;
              homePlanet: string | null | undefined;
              id: string;
              /** The person's name*/name: string | null | undefined;
            };
            export type SomeQuery_human_friends = SomeQuery_human_friends_Droid | SomeQuery_human_friends_Human;
            export type SomeQuery_human_friends_Droid = {
              __typename: "Droid";
            };
            export type SomeQuery_human_friends_Human = {
              __typename: "Human";
              hands: number | null | undefined;
            };
        `);
    });

    describe("Input variables", () => {
        it("should generate a variables type", () => {
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
                export type SomeQueryType = {
                    variables: {
                  id: string;
                  episode?:
                  /** - NEW_HOPE
                  - EMPIRE
                  - JEDI*/
                  "NEW_HOPE" | "EMPIRE" | "JEDI" | null | undefined;
                },
                    response: {
                  hero: {
                    name: string | null | undefined;
                  } | null | undefined;
                  human: /** A human character*/{
                    friends: Array<{
                      name: string | null | undefined;
                    } | null | undefined> | null | undefined;
                  } | null | undefined;
                }
                };
            `);
        });

        it("should handle an inline fragment on an interface without a typeCondition", () => {
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
                export type SomeQueryType = {
                    variables: {},
                    response: {
                  hero: {
                    id: string;
                    name: string | null | undefined;
                  } | {
                    id: string;
                    /** The person's name*/name: string | null | undefined;
                  } | null | undefined;
                }
                };
            `);
        });

        it("should handle an inline fragment on an object (not an interface)", () => {
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
                export type SomeQueryType = {
                    variables: {},
                    response: {
                  human: /** A human character*/{
                    id: string;
                    /** The person's name*/name: string | null | undefined;
                  } | null | undefined;
                }
                };
            `);
        });

        it("should handle a complex input variable", () => {
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
                export type addCharacterType = {
                    variables: {
                  character: /** A character to add*/{
                    /** The new character's name*/name: string;
                    /** The character's friends*/friends?: ReadonlyArray<string> | null | undefined;
                    appearsIn?: ReadonlyArray<
                    /** - NEW_HOPE
                    - EMPIRE
                    - JEDI*/
                    "NEW_HOPE" | "EMPIRE" | "JEDI"> | null | undefined;
                    candies: number;
                    friendly?: boolean | null | undefined;
                  };
                },
                    response: {
                  addCharacter: {
                    id: string;
                  } | null | undefined;
                }
                };
            `);
        });

        it("should strip comments", () => {
            const result = rawQueryToFlowTypes(
                `mutation addCharacter($character: CharacterInput!) {
                    addCharacter(character: $character) {
                        id
                    }
                }`,
                {readOnlyArray: false, noComments: true},
            );

            expect(result).toMatchInlineSnapshot(`
                // addCharacterType.js
                export type addCharacterType = {
                    variables: {
                  character: {
                    name: string;
                    friends?: ReadonlyArray<string> | null | undefined;
                    appearsIn?: ReadonlyArray<"NEW_HOPE" | "EMPIRE" | "JEDI"> | null | undefined;
                    candies: number;
                    friendly?: boolean | null | undefined;
                  };
                },
                    response: {
                  addCharacter: {
                    id: string;
                  } | null | undefined;
                }
                };
            `);
        });
    });
});
