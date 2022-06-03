# Graphql Flow Generation

This is a tool for generating flow types from graphql queries in javascript frontends.

## Usage

Write a config file, following the schema defined in [src/cli/schema.json](src/cli/schema.json).
If .js, it needs to export (module.exports = ) an object that adheres to that schema.

If you need different options (or even different schemas) for different files, you can do so by providing
multiple `generate` configuration objects. The first configuration object for which no `exclude` regex's
match, and at least one `match` regex matches, will be used, for the operations in a given file.
If a configuration object has no excludes and no matches, it will match all files.

Then run from the CLI, like so:

```bash
$ graphql-flow path/to/config.json
```

Files will be discovered relative to the `crawl.root`.

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
