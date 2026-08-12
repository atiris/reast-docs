# Contributing

The Reast engine is developed in the open. The most useful contributions right now are the ones that need no repository access at all.

## Report what breaks

A story that renders wrongly is the most valuable bug report there is. Include the smallest `.rea` snippet that reproduces it, what you expected, and what you saw. If it only happens in a package, say which archive layout you used.

Open issues on the engine repository: [github.com/atiris/reast-engine](https://github.com/atiris/reast-engine).

## Argue with the specification

The [specification](/spec/) is the contract every implementation is measured against, so an ambiguity in it is a defect. If a section can be read two ways, or contradicts another section, that is worth reporting exactly like a bug.

The [feature index](/spec/features) tells you where a feature stands. A `draft` feature is the one most open to being reshaped — its design is written down precisely so it can be argued with before anyone builds it.

## Build a second implementation

Rea defines three [conformance levels](/spec/05-reference#conformance-levels) so that a partial implementation can be honest about what it supports. The [`.reast` package format reference](package-format) documents the archive layout and manifest schema in full, so a packager, validator or alternative player can be written without reading the engine's source.

If you build one, tell us — the specification improves fastest when something other than the reference engine has to follow it.

## Code

Engine pull requests are welcome. Two things to know before you start:

- **Match the module you are in.** The engine is TypeScript strict + ESM throughout, and each part (parser, runtime, loader, player) has its own established patterns.
- **Tests come with the change.** A parser or runtime change without a test that fails before it and passes after will be sent back.
