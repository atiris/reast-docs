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

The stronger fighter has {max(player.strength, enemy.strength)} power.
```

### Function behavior by calling context

Functions can render text, return values, or both. The behavior depends on context:

| Context                           | Text rendered? | Return value used?   |
| --------------------------------- | -------------- | --------------------- |
| Standalone: `{greet("Aiden")}`    | Yes            | Discarded              |
| In expression: `{max(a, b) + 10}` | Yes (if any)   | Yes                    |
| In assignment: `{set x = fn()}`   | Yes (if any)   | Assigned to `x`        |
| In condition: `{if fn() begin}`   | Yes (if any)   | Evaluated as boolean   |

**Function classifications:**

- **Pure function** — only `{return}`, no narrative text. Behaves like a traditional function (`max`, `damage`)
- **Template function** — only narrative text, no `{return}`. Behaves like a reusable text block (`greet`)
- **Hybrid function** — renders text AND returns a value. Powerful but potentially confusing; linters should warn
- **Side-effect function** — no text, no `{return}`. Only modifies variables or triggers commands (`reset_stats`)

```rea
{function reset_stats() begin}
  {set player.health = 100}
  {set player.gold = 0}
{end function}
```

A function's text body always renders when called — even in expression context. `{return}` is optional; if absent, the function's value in expressions is `undefined`.

### Parameters

Parameters support default values:

```rea
{function damage(base, multiplier = 1.0) begin}
  {return base * multiplier}
{end function}
```

## Functions and `.rext` exportability

Only *pure* and *side-effect* functions — the two classifications above that render no narrative text — can be defined in a `.rext` file and exported via `{use}`. A `.rext` file is prose-free by construction (see [When rules differ in `.rext` files](rext-differences)): the loader rejects any non-command node unconditionally, including inside a `{function}…{end function}` body, because that check runs before the depth-tracking gate that otherwise lets control-flow commands through. *Template* and *hybrid* functions render text, so they can only be defined privately inside a `.rea` file and used within that same document — they cannot be exported. This is a hard rule, not a caveat: a function that renders any text, even conditionally, is not eligible for `.rext`.

## Future: sandboxed script extensions (draft, not implemented)

**Future direction (draft, not implemented):** `.rext` functions are Rea-only and prose-free by design — see [Functions and `.rext` exportability](#functions-and-rext-exportability) above. A future package format may add a separate, explicitly sandboxed script-extension mechanism for cases where that isn't enough, gated behind an explicit host capability declared in the manifest (a package using it would refuse to load on a host that doesn't support it, rather than degrade). Nothing here exists yet; this note only flags that `.rext`'s scope is intentional, not a gap waiting to be filled by JavaScript.
