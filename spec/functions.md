# Custom Functions

> [Introduction](/spec/) · [Feature index](features) · [Cheatsheet](REA-CHEATSHEET)

<Feature id="functions" />

### Defining functions

Functions are defined at the top of a file or in a shared library file:

```rea
{function greet(name, time_of_day) begin}
  {if time_of_day = "morning" begin}
    Good morning, {name}!
  {else}
    Good evening, {name}!
  {end if}
{end function}
```

Functions can return values:

```rea
{function max(a, b) begin}
  {if a > b begin}
    {return a}
  {else}
    {return b}
  {end if}
{end function}
```

### Calling functions

```rea
{greet("Aiden", "morning")}

The stronger fighter has {max(story.player.strength, story.enemy.strength)} power.
```

### Function behavior by calling context

Functions can render text, return values, or both. The behavior depends on context:

| Context                           | Text rendered? | Return value used?   |
| --------------------------------- | -------------- | --------------------- |
| Standalone: `{greet("Aiden")}`    | Yes            | Discarded              |
| In expression: `{max(a, b) + 10}` | Yes (if any)   | Yes                    |
| In assignment: `{set story.x = fn()}` | Yes (if any) | Assigned to `story.x`  |
| In condition: `{if fn() begin}`   | Yes (if any)   | Evaluated as boolean   |

**Function classifications:**

- **Pure function** — only `{return}`, no narrative text. Behaves like a traditional function (`max`, `damage`)
- **Template function** — only narrative text, no `{return}`. Behaves like a reusable text block (`greet`)
- **Hybrid function** — renders text AND returns a value. Powerful but potentially confusing; linters should warn
- **Side-effect function** — no text, no `{return}`. Only modifies variables or triggers commands (`reset_stats`)

```rea
{function reset_stats() begin}
  {set story.player.health = 100}
  {set story.player.gold = 0}
{end function}
```

A function's text body always renders when called — even in expression context. `{return}` is optional; if absent, the function's value in expressions is `undefined`.

### Parameters

<Feature id="parameters" />

A parameter name is a **bare, dotless identifier**, lexically scoped to that call's frame — never a `{set}` target namespace, never persisted, never domain-prefixed. This is the one narrow exception to the mandatory-domain rule that every other variable follows (see [Scoping](02-logic-data#scoping)): recursion needs a fresh binding per call frame, and the engine supports and tests both direct and mutual recursion (a per-call scope frame, guarded by a configurable call-depth limit). A domain-prefixed parameter would be a single shared slot per call tree — the second frame of a recursive call would clobber the first frame's value the moment it ran its own assignment, which breaks the re-entrancy recursion needs.

Reading a bare parameter name inside the function body is legal, and is the *only* place a bare, dotless identifier resolves to a value — everywhere else a bare dotless first token is `parse/unknown-command` unless it's a reserved word, literal, or function name. A parameter name currently in scope also triggers `{...}`'s auto-print rule, alongside domain names, literals, and function names.

A parameter name shadowing a domain name (`{function greet(story) ...}`) is an error, for the same reason a domain-shaped bare word is reserved elsewhere: `story` immediately after `{` would be ambiguous between "print the parameter" and "this is the domain." Shadowing a reserved word or an outer parameter is not itself an error — in a nested or recursive call, the callee's own parameter of the same name legitimately shadows the caller's, which is exactly the re-entrancy this design exists to support.

Parameters support default values:

```rea
{function damage(base, multiplier = 1.0) begin}
  {return base * multiplier}
{end function}
```

### Functions and part scope

A `{function}` call never changes the active `part.` — a `.rea` file's functions are private to that file ([below](#functions-and-rext-exportability)) and can only be called from within it, so there is no cross-part function call to reset `part.` for. Tunnels (`->>`) are chapter/document-scoped only, for the same reason: neither mechanism can cross a part boundary to begin with.

`.rext` extension functions (shared across parts via `{use}`) are the one case where the same function body genuinely runs on behalf of different parts at different times. They still don't reset `part.`: an extension function has no part of its own — it runs in the calling part's evaluation context, so `part.` inside its body reads and writes whatever the *caller's* currently-active part has.

## Functions and `.rext` exportability

Only *pure* and *side-effect* functions — the two classifications above that render no narrative text — can be defined in a `.rext` file and exported via `{use}`. A `.rext` file is prose-free by construction (see [When rules differ in `.rext` files](rext-differences)): the loader rejects any non-command node unconditionally, including inside a `{function}…{end function}` body, because that check runs before the depth-tracking gate that otherwise lets control-flow commands through. *Template* and *hybrid* functions render text, so they can only be defined privately inside a `.rea` file and used within that same document — they cannot be exported. This is a hard rule, not a caveat: a function that renders any text, even conditionally, is not eligible for `.rext`.

## Future: sandboxed script extensions (draft, not implemented)

**Future direction (draft, not implemented):** `.rext` functions are Rea-only and prose-free by design — see [Functions and `.rext` exportability](#functions-and-rext-exportability) above. A future package format may add a separate, explicitly sandboxed script-extension mechanism for cases where that isn't enough, gated behind an explicit host capability declared in the manifest (a package using it would refuse to load on a host that doesn't support it, rather than degrade). Nothing here exists yet; this note only flags that `.rext`'s scope is intentional, not a gap waiting to be filled by JavaScript.
