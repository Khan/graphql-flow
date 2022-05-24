---
'@khanacademy/graphql-flow': minor
---

Users can add files with the name ending in `graphql-flow.config.js` with a subset of the config fields (`options`, `excludes`) in order to have more granular control of the behavior. Another field, `extends`, takes the path of another config file to use as a base and extends/overrides fields. If no `extends` is provided, the file completely overwrites any other config files (as far as `options` and `excludes`).
