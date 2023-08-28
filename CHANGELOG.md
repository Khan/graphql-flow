# @khanacademy/graphql-flow

## 3.0.0

### Major Changes

-   ad68019: Update 'graphql' to 16.3.x (requires consumers to change their version of 'graphql')

## 2.0.0

### Major Changes

-   38eb544: Generate TypeScript directly and only TypeScript

### Minor Changes

-   2933c91: Migrate to TypeScript

## 1.2.0

### Minor Changes

-   e1e9fde: Add --omitFileExtensions option

## 1.1.2

### Patch Changes

-   9867001: Fix empty variables object

## 1.1.1

### Patch Changes

-   a581359: Fix processing of typescript imports that don't use an extension

## 1.1.0

### Minor Changes

-   c7367a1: Basic TypeScript support!

## 1.0.0

### Major Changes

-   1e1de13: BREAKING: Change config file format, split into 'crawl' and 'generate' sections
    See schema.json for new organization.
-   284be55: [breaking] remove support for running graphql-flow via jest

    Now the cli tool is the only way to invoke graphql-flow.

-   9f7f2d1: Breaking: removed support for multiple config files (to be replaced with override support in the central config file)

### Minor Changes

-   a99fc38: Support multiple 'generate' configs, allowing projects to have different settings for different directories or files

    `config.generate` can now be an object or an array of objects, with `match` and `exclude` arrays (either a RegExp or a string that will be passed to `new RegExp()`) to fine-tune which files they apply to.

### Patch Changes

-   bcc06d0: Use jsonschema for validating the config file

## 0.3.0

### Minor Changes

-   093fa5f: Enable `experimentalEnums` in a config or subconfig file in to enable the export of flow enum types, which replace the default string union literals. The type currently comes with eslint decorators to skirt a bug in eslint and flow.
-   5078624: Users can add files with the name ending in `graphql-flow.config.js` with a subset of the config fields (`options`, `excludes`) in order to have more granular control of the behavior. Another field, `extends`, takes the path of another config file to use as a base and extends/overrides fields. If no `extends` is provided, the file completely overwrites any other config files (as far as `options` and `excludes`).

## 0.2.5

### Patch Changes

-   0df32ac: Allow generatedDir to be an absolute path

## 0.2.4

### Patch Changes

-   843839c: Add 'dumpOperations' config option, to enable safelisting

## 0.2.3

### Patch Changes

-   f5ea353: Add 'typeFileName' config option to fit the mobile repo's expectations

## 0.2.2

### Patch Changes

-   31dd235: Compile for node 12 instead of 16

## 0.2.1

### Patch Changes

-   e8a8025: Add shebang to the exported binary, so that it runs

## 0.2.0

### Minor Changes

-   d9a8229: Generate types for fragments!

### Patch Changes

-   7497164: Fix a bug in index file generation that resulted in duplicate entries
-   26abf9b: Add options for specifying the name of the generated directory, and for exporting the response and variables types.

## 0.1.0

### Minor Changes

-   b08ed1b: Build out a cli tool that does our own parsing of javascript files, dramatically speeding things up!

### Patch Changes

-   8cdcdc2: Support inline fragments on objects
-   fd5c6b7: Allow schema to be provided as a .graphql file, not just .json
-   6869203: Add 'ignorePragma' option, to allow skipping of documents

## 0.0.2

### Patch Changes

-   9810bfe: Allow customization of the "regenerate command" that's in the file docstrings
-   7d27337: Support custom scalars as variables in an operation

## 0.0.1

### Patch Changes

-   a4ae2c8: First release! Hoping this works.
-   a3e8461: Make a simple change to check out the changeset stuff

## 0.0.1

### Patch Changes

-   a64c3c7: First release! Hoping this works.
