# Graphql Flow Generation

This is a tool for generating flow types from graphql queries in javascript frontends.

## Using as a CLI tool

Write a config file, following the schema defined in [src/cli/schema.json](src/cli/schema.json), either as a `.json` file, or a `.js` file that `module.exports` an object adhering to the schema.

Then run from the CLI, like so:

```bash
$ graphql-flow path/to/config.json
```

Files will be discovered relative to the `crawl.root`.

### Multiple generate configs

To customize type generation for certain directories or files, you can provide multiple
`generate` configs as an array, using `match` and `exclude` to customize behavior.

For example:

```js
// dev/graphql-flow/config.js

const options = {
    regenerateCommand: "make gqlflow",
    generatedDirectory: "__graphql-types__",
    exclude: [
        /_test.js$/,
        /.fixture.js$/,
        /\\b__flowtests__\\b/,
    ],
};

module.exports = {
    crawl: {
        root: "../../",
    },
    generate: [
        {
            ...options,
            schemaFilePath: "../../gengraphql/course-editor-schema.graphql",
            match: [/\bcourse-editor-package\b/, /\bcourse-editor\b/],
            experimentalEnums: true,
        },
        {
            ...options,
            schemaFilePath: "../../gengraphql/composed-schema.graphql",
        },
    ],
};
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
