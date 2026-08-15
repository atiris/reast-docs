# Feature Index

Every feature of the Rea language, grouped by what it is for and labelled with how far it has actually come. Use this page to answer one question before you write a line: **can I rely on this today?**

The same badge appears under the feature's own heading in the specification, so a status is never read from two places.

## What the statuses mean

| Status             | Can I use it?                     | What it means                                                                                                                                       |
| ------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`stable`**       | Yes — build on it                 | Released and frozen. Only a new MAJOR version of the language may change it. Everything an ordinary paragraph of prose uses is here.                 |
| **`experimental`** | Yes — with a note in your changelog | Released and usable, and most of the language is at this level today. The syntax may still be refined within 1.x, so an update may ask you to adjust. |
| **`development`**  | Not yet                           | Designed, agreed and actively being built. The syntax below is what it will be, but the engine does not accept it yet.                                |
| **`draft`**        | No                                | Specified and discussed so the shape of the idea is on record. No implementation has started and the design may still change completely.             |
| **`cancelled`**    | Never                             | Considered and deliberately ruled out. Documented so the decision stays visible rather than being rediscovered and re-argued.                        |

A **version badge** accompanies the status only where there is something to version: `stable` and `experimental` features carry the spec version they became available in. A `development` or `draft` feature has no version yet, and a `cancelled` one never will.

Everything marked `stable` or `experimental` works in the current engine. Anything below that does not — if a story uses it, the runtime applies [graceful degradation](/spec/error-handling) and the reader simply never sees it.

<FeatureIndex />

## Reading the index

- **Click a status** in the legend to narrow the list; click it again, or "show all", to clear.
- **A group title** links to the part of the specification that documents it in full.
- **A feature name** links to its own section, where the same badge appears with the same wording. The `cancelled` entries are the exception: they have no syntax to document, so they live together under [What Rea intentionally omits](05-reference#what-rea-intentionally-omits).

If a feature you need is `draft` or `development`, the specification section still describes it completely — that is what makes it possible to design a story around its eventual arrival. Just do not ship against it.
