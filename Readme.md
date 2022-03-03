# Graphql Flow Generation

This is a tool for generating flow types from graphql queries in javascript frontends.

The core of this tool is the `documentToFlowTypes` function, which takes a `DocumentNode` (such as is returned by the `graphql-tag` package) as well as your backend's graphql schema (see below for instructions on how to produce this), and produces a list of stringified flow types, one for each query and mutation defined in that graphql block.

It looks something like this:

```js
import gql from 'graphql-tag';
import {documentToFlowTypes, schemaFromIntrospectionData} from 'graphql-flow';
import myIntrospectionData from './server-introspection-response.json';

const schema = schemaFromIntrospectionData(myIntrospectionData);

const MyQuery = gql`
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
`;

console.log(documentToFlowTypes(MyQuery, schema))
/*
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
*/
```

If you already have a setup whereby you collect all of your graphql literals, that may be all you need!

Otherwise, we provide a way to hook into jest to automatically collect your queries and generate the types.

## Options for `documentToFlowTypes`

```js
{
    // Use nullable types where the graphql type is nullable. Included for legacy compatability,
    // will probably remove once the mobile repo no longer needs it.
    strictNullability: boolean = true,
    // Output `$ReadOnlyArray<>` instead of `Array<>`, for stricter flow typing. On by default.
    readOnlyArray: boolean = true,
    // A mapping of custom scalar names to the underlying json representation.
    scalars: {[key: string]: 'string' | 'boolean' | 'number'}
}
```

## Using jest to do the heavy lifting:

### jest-setup.js

Add the following snippet to your jest-setup.js

```js
if (process.env.GRAPHQL_FLOW) {
    jest.mock('graphql-tag', () => {
        const introspectionData = jest.requireActual(
            './server-introspection-response.json',
        );

        return jest.requireActual('../tools/graphql-flow/jest-mock-graphql-tag.js')(
            introspectionData,
            {
                pragma: '# @autogen\n',
                loosePragma: '# @autogen-loose\n',
            }
        );
    });
}
```

That will mock out the `graphql-tag` function, so that everywhere you call 'gql`some-query`', we'll pick it up and
generate a type for it! As written, the mocking only happens if the `GRAPHQL_FLOW` env variable is set, so that it won't run every time.

By default, all queries are processed. To have them 'opt-in', use the `pragma` and `loosePragma` options. Queries with `loosePragma` in the source will have types generated that ignore nullability.

### Ensure all files with queries get processed by jest

Then you'll want to make a pseudo-'test' that makes sure to 'require' all of the files that define queries, so that
jest will process them and our mock will see them. 
```js
// generate-types.test.js
import {findFilesWithQueries} from '../tools/graphql-flow/find-files-with-gql';

if (process.env.GRAPHQL_FLOW) {
    findFilesWithQueries(path.join(__dirname, '..')).forEach(name => {
        require(name);
    });

    it('should have found queries', () => {
        const gql = require('graphql-tag')
        expect(gql.collectedQueries.length).toBeGreaterThan(0)
    })
} else {
    it(`not generating graphql types because the env flag isn't set`, () => {
        // not doing anything because the env flag isn't set.
    })
}
```

### Run that test to generate the types!

You can add a script to package.json, like so:
```json
    "scripts": {
        "generate-types": "env GRAPHQL_FLOW=1 jest generate-types.test.js"
    }
```

And then `yarn generate-types` or `npm run generate-types` gets your types generated!

🚀

### Options for the `jest-mock-graphql-tag.js` helper:

```js
{
    // These are from the `documentToFlowTypes` options object above
    strictNullability: boolean = true,
    readOnlyArray: boolean = true,
    scalars: {[key: string]: 'string' | 'boolean' | 'number'}

    // Specify an opt-in pragma that must be present in a graphql string source
    // in order for it to be picked up and processed
    // e.g. set this to `"# @autogen\n"` to only generate types for queries that
    // have the comment `# @autogen` in them.
    pragma?: string,
    // Specify a pragma that will turn off `strictNullability` for that
    // source file. e.g. `"# @autogen-loose\n"`.
    loosePragma?: string,
    // If neither pragma nor loosePragma are specified, all graphql documents
    // that contain a query or mutation will be processed.
}
```

## Introspecting your backend's graphql schema
Here's how to get your backend's schema in the way that this tool expects, using the builtin 'graphql introspection query':

```js
import {getIntrospectionQuery} from 'graphql';
import fs from 'fs';
import fetch from 'node-fetch';

const query = getIntrospectionQuery({descriptions: true}),

const response = await fetch(`https://my-backend.com`, {
    method: 'POST',
    body: query,
    headers: {
        // You definitely shouldn't be allowing arbitrary queries without
        // some strict access control.
        'X-header-that-allows-arbitrary-queries': 'my-secret-key',
    },
    contentType: 'application/json',
});
const fullResponse = await response.json();
fs.writeFileSync('./server-introspection-response.json', JSON.stringify(fullResponse.data, null, 2));
```
