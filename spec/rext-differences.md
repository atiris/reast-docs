# When rules differ in `.rext` files

A `.rext` file holds Rea code written in the same grammar as a `.rea` file, but
a stricter subset of it is legal. This page covers only what changes when Rea
is parsed as an extension module; for the archive layout, manifest keys, and
loading mechanics around `.rext` files, see the engine's
[`.reast` package format reference](/engine/package-format#packaged)
and [Extending the Engine](/engine/extending).

## Declaration-only

A `.rext` file may contain only:

- `{function …}`…`{end function}` blocks,
- top-level `{set}` constants,
- `{use}` imports,
- comments.

Any prose node — a paragraph, heading, choice group, media, blockquote,
dialogue, or card definition — anywhere in a `.rext` is a **load error**. Every
`.rext` in the archive is compiled and validated at load, before any prose
runs, so a broken extension fails at publish time rather than on a reader's
device.

Control-flow commands (`{if}`, `{return}`, …) are allowed only **inside**
function bodies — a bare `{if}` at the top level of a `.rext` is prose in this
sense and is rejected the same way a paragraph would be.

## `{use}` is required — presence alone does not activate a module

A `.rext` present in the archive is compiled and validated, but it is **not
active** until a story `{use}`s it. This is a genuine runtime requirement, not
stale documentation: only `{use}` populates the interpreter's extension
bindings, and a call through a name that was never `{use}`d silently resolves
to `undefined` — the loader raises no error. Bindings are per-module and
non-transitive: a part that itself calls `{use}` does not automatically make
the alias available to a different part that also wants to call the same
extension; each part `{use}`s it independently.

```rea
{use "extensions/inventory" as inv}

Your pack weighs {inv.total_weight()} kg.
```

Rules the loader enforces on the `{use}` graph:

- **Package-local resolution only** — a `{use}` path resolves inside the
  package, never the filesystem, never the network.
- **The `{use}` graph must be acyclic** — a cycle fails the load, naming the
  cycle.
- **Duplicate export names are an error**, not first-wins.
- **A `{use}` of a missing path fails the load**, as does a
  `manifest.extensions` entry that is not present in the archive.

## Top-level `{set}` becomes a private constant, not a story variable

Inside a `.rext`, a top-level `{set}` declares the module's **private
constant**. Its functions can read it, but it never becomes a story variable:
it never appears in exported reading state, two modules may declare the same
constant name without colliding, and a module can never overwrite a variable
the author declared elsewhere. A function parameter of the same name shadows
the constant.

A `{set}` **inside** a function body follows ordinary Rea function scoping and
does write a story variable, exactly as it would in a `.rea` file — so
accumulate loop state by recursion, not by a counter that leaks into the
reader's saved state.

## Story (`.rea`) functions stay private

A `.rea` file may still declare `{function}`s, but those are **private and
document-scoped** — only a `.rext`'s functions export. To share a function
across parts, move it into a `.rext` and `{use}` it from each part that needs
it.
