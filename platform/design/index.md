# Story Design

How to structure and package a story for the Reast platform — whether you write it in the built-in editor or with your own tools.

## Two ways to build a story

- **The platform editor** (recommended for most authors) — write Rea with a live preview, manage metadata and media through forms, and publish with one click. The editor assembles the `.reast` package for you; see [For Authors](../for-authors) for the authoring workflow itself.
- **Any text editor** — write `.rea` files directly, then assemble them into a `.reast` package yourself: a ZIP archive with your story files under `story/`, media under `assets/`, and a `manifest.json` describing the title, author, parts, and other metadata at the archive root. Upload the finished `.reast` file to publish it. The full archive layout and every manifest field are documented in the engine's [`.reast` package format reference](/engine/package-format) — that page is the canonical source for what a valid package must contain.

Both paths produce the same kind of package; which one you use is a workflow preference, not a platform requirement.

A story can also turn a physical space into part of the puzzle — see [Real-World Exploration Menus](real-world-exploration-menus) for building a scene the reader searches with a QR sticker, a drawn mark, and their own words.

## Principles

A story that leans on Reast's platform-specific capabilities — real-world interactions, cooperative reading, multi-part structure — benefits from planning those elements before writing prose:

- **Start with structure.** Decide whether your story is single-part or multi-part before you write; multi-part stories use gates and cross-part links (see the spec's [Narrative & Interaction](/spec/03-narrative-interaction) section) and are harder to restructure after the fact than to plan up front.
- **Treat variables as your story's memory.** Domain-prefixed variables (`player.*`, `quest.*`) are what lets later chapters react to earlier choices — decide your variable domains early so naming stays consistent across parts.
- **Reach for platform features deliberately.** GPS, cooperative reading, and sensors are opt-in — use them where they serve the story, not as a checklist. A story that declares `sensors` or `readers > 1` in its manifest is asking the reader's device or group for a real capability; only ask for what you use.

## External access, custom functions, and security

A story can declare `allowed_urls` in its manifest to call a small, explicit set of external endpoints, and can extend its own logic with `.rext` extension modules (see [Extending the Engine](/engine/extending) and [When rules differ in `.rext` files](/spec/rext-differences)). Both are deliberately narrow:

- **`allowed_urls` is a whitelist, not a general network gateway.** Only the endpoints an author lists are reachable; everything else is blocked. Treat every listed URL as something the reader's device will actually contact, and avoid endpoints that return anything you wouldn't want rendered as story text.
- **`.rext` extensions are sandboxed Rea, not arbitrary code.** They cannot access the filesystem, the network beyond what the engine's built-ins allow, or any API outside the Rea language — see [Sandbox constraints](/spec/05-reference#31-extensibility). A story cannot embed JavaScript or any other language.
- **Anything meant to be genuinely unforgeable — a competition answer, a paid unlock — must be verified server-side.** Encrypting a `.rea` chapter deters casual peeking but the decryption key necessarily reaches the reader's device to render it, so it is not a security boundary; see [Content Protection](/spec/04-utilities#23-content-protection-lock).
