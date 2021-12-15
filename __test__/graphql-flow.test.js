// @flow

/**
 * Tests for our graphql flow generation!
 */

import type {IntrospectionQuery, DocumentNode} from 'graphql';
import type {Schema} from '..';
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

const rawQueryToFlowTypes = (query: string): string => {
    // We need the "requireActual" because we mock graphql-tag in jest-setup.js
    // flow-next-uncovered-line
    const gql: string => DocumentNode = jest.requireActual('graphql-tag');
    const node = gql(query);
    return documentToFlowTypes(
        node,
        exampleSchema,
        {PositiveNumber: 'number'},
        true,
    )
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
              human: ?{|
                id: string,
                name: ?string,
                homePlanet: ?string,
                friends: ?$ReadOnlyArray<?{|
                  name: ?string
                |}>,
              |}
            |};
        `);
    });

    it('should work with fragments', () => {
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
              human: ?{|
                id: string,
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
});
