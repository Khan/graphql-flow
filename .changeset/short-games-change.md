---
'@khanacademy/graphql-flow': major
---

Instead of subconfigs being detected by grepping, you can define multiple generate configs. The first one that matches (via the 'match' array) will be used for a given file. If no applicable config is found, type generation is skipped for that file.

I also allow configs to be javascript files, to allow for more flexibility.

The root is now specified explicitly, instead of being process.cwd() where the command was run.

See src/cli/schema.json for the new config schema.
