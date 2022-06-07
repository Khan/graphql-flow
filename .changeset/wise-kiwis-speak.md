---
'@khanacademy/graphql-flow': minor
---

Support multiple 'generate' configs, allowing projects to have different settings for different directories or files

`config.generate` can now be an object or an array of objects, with `match` and `exclude` arrays (either a RegExp or a string that will be passed to `new RegExp()`) to fine-tune which files they apply to.
