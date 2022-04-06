# Graphql Flow Generation

This is a tool for generating flow types from graphql queries in javascript frontends.

## Using as a CLI tool

Write a config file, with the following options:

```json
{
    // Response to the "introspection query" (see below). This path is resolved relative to the config file location.
    "schemaFilePath": "../some/schema-file.json",
    // List of regexes
    "excludes": ["\\bsome-thing", "_test.jsx?$"],
    // Options for type generation (see below)
    "options": {
        "scalars": {
            "JSONString": "string"
        }
    }
}
```

Then run from the CLI, like so:

```bash
$ graphql-flow path/to/config.json
```

Files will be discovoered relative to the current working directory.

To specify what file should be checked, pass them in as subsequent cli arguments.

## Options (for the cli 'options' config item, or when running from jest):

```ts
type Options = {
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

    // Any graphql operations containing ignorePragma will be skipped
    ignorePragma?: string,
}
```

## Using from jest

You can also use jest to do the heavy lifting, running all of your code and collecting queries
by mocking out the `graphql-tag` function itself. This requires that all graphql operations are
defined at the top level (no queries defined in functions or components, for example), but does
support complicated things like returning a fragment from a function (which is probably
not a great idea code-style-wise anyway).

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
            // See "Options" type above
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
import {findGraphqlTagReferences} from '../tools/graphql-flow/find-files-with-gql';
import path from 'path';

if (process.env.GRAPHQL_FLOW) {
    findGraphqlTagReferences(path.join(__dirname, '..')).forEach(name => {
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
