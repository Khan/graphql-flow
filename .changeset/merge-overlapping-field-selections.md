---
"@khanacademy/graphql-flow": major
---

Merge sub-selections when the same response name is selected through multiple branches (base level + inline fragment, two fragment spreads, etc.) so the generated TypeScript matches what the server actually returns.

**Bug fix.** Previously, a query like

```graphql
hero {
  friends { id }
  ... on Human {
    friends { name }
  }
}
```

generated a `Human.friends` type containing only `name` — the `id` selection from the base level was silently dropped. graphql-flow now mirrors the GraphQL spec's CollectFields behavior and merges the two `friends` selections, producing `{ id; name }`.

**Behavior change (why this is a major bump):** For queries that mix inline fragments with base-level field selections on an interface, the field-lookup base is now the concrete impl rather than the interface itself. In practice this means:

- JSDoc description comments on fields now come from the concrete impl (e.g. `Human.name`'s description shows up where previously only the bare interface field appeared).
- If any of your interfaces declare covariant field overrides (a concrete impl narrowing the interface's field type), generated types for those fields will now reflect the concrete impl's narrower type when accessed through a fragment refinement on that impl. Runtime data was already this shape; the type is just catching up.

If you depend on the exact previous output (e.g. snapshot tests of generated `.ts` files), expect diffs in interface-with-fragment queries. Regenerate types and review.
