---
"@khanacademy/graphql-flow": major
---

Overhaul import resolution, relying on tsconfig for import aliases, and rspack-resolver for package imports. This removes the `alias` config option, instead requiring that aliases be defined in a `tsconfig.json`.
