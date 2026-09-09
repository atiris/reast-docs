# For Authors

Everything platform-specific about writing and publishing on Reast. For the Rea language itself, see the [Cheatsheet](/spec/REA-CHEATSHEET) or the [full specification](/spec/); for how to structure and package a story file, see [Story Design](design/).

## How to Write

Stories are written in Rea — a simple markup language designed for interactive narratives. If you can write a text message, you can write a Rea story. There are no programming concepts to learn upfront — just start typing.

::: tip Try it live Open the Editor and write alongside this guide. The live preview updates as you type, so you see exactly what readers experience. :::

A valid story is just text. No special syntax required:

```rea
Once upon a time, in a land far away,
a young traveler set out on a journey.

The road stretched endlessly before them.
```

Add structure with headings (`#`) and choices (`*`) to make it interactive:

```rea
# Chapter One

You stand at a crossroads.

* [Go left]
  The path winds into a dark forest.
* [Go right]
  A bright meadow stretches ahead.

- The wind whispers behind you.
```

For the full set of Rea syntax — variables, conditionals, dialogue, cards, media — see the [Cheatsheet](/spec/REA-CHEATSHEET).

## The built-in editor

The platform ships a browser-based editor with a live preview: write Rea on one side, see exactly what readers will experience on the other. It handles metadata (title, cover, tags, genre), media uploads, and packages the result as a `.reast` file for you — you never assemble the archive by hand. Prefer a plain text editor instead? See [Story Design](design/) for authoring a story outside the platform editor and uploading the finished package.

## Publishing and visibility

A story you're writing is only visible to you until you choose otherwise. Each story has a visibility setting:

- **`private`** — visible only to you. The default while a story is a work in progress.
- **`unlisted`** — reachable by anyone with the direct link, but not shown in the catalog or search. Useful for sharing a draft with beta readers.
- **`public`** — listed in the catalog and discoverable by other readers.

Pricing is independent of visibility: a published story can be free, premium (behind a platform subscription), or a one-time paid purchase — see the [Glossary](glossary#story-tiers) for the exact terms.

## Your author page

Publishing a story adds it to your author page — a customisable profile showcasing your published works to readers, with basic analytics on how readers engage with each story.

## Author pages, and writing under more than one name

An author page is a **identity**: a public identity with its own name, address, picture and description. Your account holds up to **three** author pages. If you need more, ask the moderators and say why.

Reast will not connect one of your author pages to another. Nothing on a page names your other pages, your stories carry only the page they were published under, and your member page — the identity you use for quests, groups and reviews — never lists an author page at all. Which page a story goes out under is chosen when you publish it, and writing a story commits you to nothing: a draft has no page attached until you pick one.

Two things Reast cannot separate for you: the same picture on two pages, and the same biography pasted twice. Both are visible to anyone who looks, and both are yours to avoid.

If you publish as a company, your legal details are filled in once for the account, not per page. An author page may show that it belongs to a company and the trading name you chose; the registration number, country and website are never shown on it.

## Writing a blog

A blogger page is another identity — the one your blog posts are signed with, meant to be a public name you can promote. It works the same way as an author page and is separate from every other identity you hold. It is not a privilege or a rank; it is simply a different kind of page.

## Keyboard Shortcuts

| Key      | Action                |
| -------- | --------------------- |
| `Ctrl+B` | Bold text             |
| `Ctrl+I` | Italic text           |
| `Ctrl+S` | Save story             |
| `Ctrl+M` | Toggle metadata panel |

## FAQ

### Can readers tell that two author pages are mine?

Not from anything Reast publishes. What can give it away is what you do yourself: reusing the same picture, the same biography, or the same links. Moderation, payouts and lawful requests do connect your identities internally — see the privacy policy.

### Can I write stories in my own language?

Absolutely. The Rea language is text-based and works with any script or language.

### How do GPS and sensor features work?

You can embed location triggers and sensor conditions in your story. When a reader's device meets those conditions (e.g., arriving at a specific GPS coordinate), the story reacts. See the language spec's [Real-World Interactions](/spec/03-narrative-interaction) section.

### What file format do stories use?

Stories are written in `.rea` files — plain text with the Rea markup language. The platform packages a story (plus media and metadata) as a `.reast` archive when you publish; see the engine's [package format reference](/engine/package-format) for exactly what's inside one.
